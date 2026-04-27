const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const Staff = require('../models/Staff');
const SecurityEvent = require('../models/SecurityEvent');
const { sendSecurityAlert } = require('../utils/securityAlerts');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validateStaffRegistration, validateObjectIdParam, isStrongPassword } = require('../middleware/validation');
const { verifyToken, isAdmin, generateToken, generateRefreshToken, refreshAccessToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    process.exit(1);
}

const signTwoFactorToken = (staffId) => jwt.sign(
    { id: staffId, purpose: 'staff-2fa' },
    JWT_SECRET,
    { expiresIn: '10m' }
);

const signStaffAuthToken = (staff, options = {}) => jwt.sign(
    {
        id: staff._id,
        email: staff.email,
        role: staff.role,
        twoFactorVerified: options.twoFactorVerified === true
    },
    JWT_SECRET,
    { expiresIn: '24h' }
);

const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
});

const MAX_FAILED_ATTEMPTS = Number(process.env.ADMIN_MAX_FAILED_ATTEMPTS || 5);
const LOCKOUT_MINUTES = Number(process.env.ADMIN_LOCKOUT_MINUTES || 30);

const getRequestMeta = (req) => ({
    ipAddress: (req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown').slice(0, 100),
    userAgent: String(req.headers['user-agent'] || 'unknown').slice(0, 300)
});

const writeSecurityEvent = async ({ staff, email, eventType, status, detail, req, metadata = {} }) => {
    try {
        const meta = getRequestMeta(req);
        await SecurityEvent.create({
            staffId: staff?._id,
            email: (email || staff?.email || '').toLowerCase().trim(),
            role: staff?.role || 'unknown',
            eventType,
            status,
            detail,
            metadata,
            ...meta
        });
    } catch (error) {
        console.error('Security event logging failed:', error.message);
    }
};

const isLocked = (staff) => !!(staff?.lockUntil && new Date(staff.lockUntil) > new Date());

const remainingLockSeconds = (staff) => {
    if (!staff?.lockUntil) return 0;
    return Math.max(0, Math.ceil((new Date(staff.lockUntil).getTime() - Date.now()) / 1000));
};

const registerFailedAttempt = async (staff, req, reason) => {
    const requestMeta = getRequestMeta(req);
    staff.failedLoginAttempts = (staff.failedLoginAttempts || 0) + 1;
    const isNowLocked = staff.failedLoginAttempts >= MAX_FAILED_ATTEMPTS;

    if (isNowLocked) {
        staff.lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        staff.failedLoginAttempts = 0;
    }

    await staff.save();

    await writeSecurityEvent({
        staff,
        eventType: 'admin_auth_failed',
        status: isNowLocked ? 'blocked' : 'failed',
        detail: isNowLocked
            ? `Account locked after repeated failures (${reason}).`
            : `Authentication failed (${reason}).`,
        req,
        metadata: {
            reason,
            lockUntil: staff.lockUntil,
            lockoutApplied: isNowLocked
        }
    });

    if (isNowLocked && staff.role === 'admin') {
        try {
            await sendSecurityAlert({
                subject: `Admin account locked: ${staff.email}`,
                bodyLines: [
                    'An admin account was locked after repeated failed authentication attempts.',
                    `Reason: ${reason}`,
                    `Lockout duration: ${LOCKOUT_MINUTES} minutes.`
                ],
                metadata: {
                    email: staff.email,
                    role: staff.role,
                    ipAddress: requestMeta.ipAddress,
                    userAgent: requestMeta.userAgent,
                    lockUntil: staff.lockUntil?.toISOString?.() || String(staff.lockUntil)
                }
            });
        } catch (error) {
            console.error('Security alert email failed:', error.message);
        }
    }

    return isNowLocked;
};

const clearFailedAttempts = async (staff) => {
    if (staff.failedLoginAttempts || staff.lockUntil) {
        staff.failedLoginAttempts = 0;
        staff.lockUntil = null;
        await staff.save();
    }
};

// GET all staff (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { role, status } = req.query;
        const filter = {};
        
        if (role) filter.role = role;
        if (status) filter.status = status;
        
        const staff = await Staff.find(filter).sort({ createdAt: -1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff', detail: error.message });
    }
});

// POST login - Rate limited to prevent brute force
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').toLowerCase().trim();
        
        if (!normalizedEmail || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find staff with password field and 2FA secret for admin enrollment/verification
        const staff = await Staff.findOne({ email: normalizedEmail }).select('+password +twoFactorSecret');
        
        if (!staff) {
            await writeSecurityEvent({
                email: normalizedEmail,
                eventType: 'admin_auth_failed',
                status: 'failed',
                detail: 'Authentication failed for unknown account.',
                req,
                metadata: { reason: 'account-not-found' }
            });
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (isLocked(staff)) {
            const lockSeconds = remainingLockSeconds(staff);
            await writeSecurityEvent({
                staff,
                eventType: 'admin_auth_blocked',
                status: 'blocked',
                detail: 'Login blocked because account is temporarily locked.',
                req,
                metadata: { lockSeconds }
            });
            return res.status(423).json({ error: `Account locked. Try again in ${Math.ceil(lockSeconds / 60)} minute(s).` });
        }
        
        if (staff.status !== 'Active') {
            await writeSecurityEvent({
                staff,
                eventType: 'admin_auth_failed',
                status: 'failed',
                detail: 'Authentication failed because account is not active.',
                req,
                metadata: { reason: 'inactive-account' }
            });
            return res.status(401).json({ error: 'Account is not active' });
        }
        
        const isMatch = await staff.comparePassword(password);
        
        if (!isMatch) {
            const locked = await registerFailedAttempt(staff, req, 'password-mismatch');
            if (locked) {
                return res.status(423).json({ error: `Account locked for ${LOCKOUT_MINUTES} minutes due to repeated failed attempts.` });
            }
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        if (staff.role === 'admin') {
            let setupRequired = false;
            let secret = staff.twoFactorSecret;

            await clearFailedAttempts(staff);

            if (!staff.twoFactorEnabled || !secret) {
                const generatedSecret = speakeasy.generateSecret({
                    name: `Hope Foundation Admin (${staff.email})`,
                    issuer: 'Hope Foundation'
                });

                secret = generatedSecret.base32;
                staff.twoFactorSecret = secret;
                staff.twoFactorEnabled = true;
                setupRequired = true;
            }
            await staff.save();

            const tempToken = signTwoFactorToken(staff._id);
            const payload = {
                requiresTwoFactor: true,
                tempToken,
                staff: {
                    id: staff._id,
                    name: staff.name,
                    email: staff.email,
                    role: staff.role
                }
            };

            if (setupRequired) {
                const otpauthUrl = speakeasy.otpauthURL({
                    secret,
                    label: `Hope Foundation Admin (${staff.email})`,
                    issuer: 'Hope Foundation',
                    encoding: 'base32'
                });

                payload.twoFactor = {
                    secret,
                    otpauthUrl,
                    qrCodeDataUrl: await QRCode.toDataURL(otpauthUrl)
                };
            }

            await writeSecurityEvent({
                staff,
                eventType: 'admin_2fa_challenge_issued',
                status: 'info',
                detail: setupRequired
                    ? '2FA challenge issued with new enrollment setup.'
                    : '2FA challenge issued.',
                req,
                metadata: { setupRequired }
            });

            return res.json(payload);
        }

        // Update last login
        await clearFailedAttempts(staff);
        staff.lastLogin = new Date();
        const requestMeta = getRequestMeta(req);
        staff.lastLoginIp = requestMeta.ipAddress;
        staff.lastLoginUserAgent = requestMeta.userAgent;
        await staff.save();

        await writeSecurityEvent({
            staff,
            eventType: 'staff_login_success',
            status: 'success',
            detail: 'Staff login successful without 2FA requirement.',
            req
        });

        // Generate JWT token
        const token = signStaffAuthToken(staff);

        res.cookie('staffAuthToken', token, getAuthCookieOptions());

        res.json({
            message: 'Login successful',
            token,
            twoFactorVerified: false,
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', detail: error.message });
    }
});

router.get('/session-check', verifyToken, isAdmin, async (req, res) => {
    return res.json({
        valid: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            twoFactorVerified: req.user.twoFactorVerified === true
        }
    });
});

router.get('/security-events', verifyToken, isAdmin, async (req, res) => {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
        const events = await SecurityEvent.find({ role: 'admin' })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return res.json({
            count: events.length,
            events
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch security events', detail: error.message });
    }
});

// POST verify admin 2FA
router.post('/verify-2fa', loginLimiter, async (req, res) => {
    try {
        const { tempToken, code } = req.body || {};

        if (!tempToken || !code) {
            return res.status(400).json({ error: 'Temporary token and verification code are required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(tempToken, JWT_SECRET);
        } catch {
            return res.status(401).json({ error: 'Invalid or expired verification session' });
        }

        if (decoded.purpose !== 'staff-2fa') {
            return res.status(401).json({ error: 'Invalid verification session' });
        }

        const staff = await Staff.findById(decoded.id).select('+twoFactorSecret');
        if (!staff || staff.status !== 'Active' || staff.role !== 'admin') {
            return res.status(401).json({ error: 'Admin account not found or inactive' });
        }

        if (isLocked(staff)) {
            const lockSeconds = remainingLockSeconds(staff);
            await writeSecurityEvent({
                staff,
                eventType: 'admin_2fa_blocked',
                status: 'blocked',
                detail: '2FA verification blocked because account is temporarily locked.',
                req,
                metadata: { lockSeconds }
            });
            return res.status(423).json({ error: `Account locked. Try again in ${Math.ceil(lockSeconds / 60)} minute(s).` });
        }

        if (!staff.twoFactorSecret) {
            return res.status(400).json({ error: '2FA is not configured for this account' });
        }

        const verified = speakeasy.totp.verify({
            secret: staff.twoFactorSecret,
            encoding: 'base32',
            token: String(code).replace(/\s+/g, ''),
            window: 1
        });

        if (!verified) {
            const locked = await registerFailedAttempt(staff, req, 'invalid-2fa-code');
            if (locked) {
                return res.status(423).json({ error: `Account locked for ${LOCKOUT_MINUTES} minutes due to repeated failed attempts.` });
            }
            return res.status(401).json({ error: 'Invalid verification code' });
        }

        const requestMeta = getRequestMeta(req);
        const ipChanged = !!staff.lastLoginIp && staff.lastLoginIp !== requestMeta.ipAddress;
        const userAgentChanged = !!staff.lastLoginUserAgent && staff.lastLoginUserAgent !== requestMeta.userAgent;
        const securityAlert = (ipChanged || userAgentChanged)
            ? 'New device or network detected. If this was not you, rotate credentials immediately.'
            : null;

        await clearFailedAttempts(staff);

        staff.lastLogin = new Date();
        staff.lastLoginIp = requestMeta.ipAddress;
        staff.lastLoginUserAgent = requestMeta.userAgent;
        await staff.save();

        await writeSecurityEvent({
            staff,
            eventType: 'admin_2fa_success',
            status: 'success',
            detail: securityAlert || 'Admin 2FA verification successful.',
            req,
            metadata: {
                ipChanged,
                userAgentChanged
            }
        });

        if (securityAlert) {
            try {
                await sendSecurityAlert({
                    subject: `Suspicious admin login detected: ${staff.email}`,
                    bodyLines: [
                        securityAlert,
                        'A successful 2FA login was completed from a new device/network fingerprint.'
                    ],
                    metadata: {
                        email: staff.email,
                        ipAddress: requestMeta.ipAddress,
                        userAgent: requestMeta.userAgent,
                        ipChanged,
                        userAgentChanged,
                        loginTime: new Date().toISOString()
                    }
                });
            } catch (error) {
                console.error('Security alert email failed:', error.message);
            }
        }

        const token = signStaffAuthToken(staff, { twoFactorVerified: true });

        res.cookie('staffAuthToken', token, getAuthCookieOptions());

        res.json({
            message: 'Login successful',
            token,
            twoFactorVerified: true,
            securityAlert,
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Two-factor verification failed', detail: error.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('staffAuthToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    });

    return res.json({ message: 'Logged out successfully' });
});

// POST register new staff (admin only - protected)
router.post('/register', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, email, password, phone, role, department } = req.body;
        
        // Check if email already exists
        const existing = await Staff.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const staff = new Staff({
            name,
            email,
            password,
            phone,
            role: role || 'staff',
            department
        });
        
        await staff.save();
        
        res.status(201).json({
            message: 'Staff registered successfully',
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed', detail: error.message });
    }
});

// GET single staff (authenticated)
router.get('/:id', verifyToken, validateObjectIdParam('id'), async (req, res) => {
    try {
        const isSelfRequest = String(req.user.id) === String(req.params.id);
        if (req.user.role !== 'admin' && !isSelfRequest) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff', detail: error.message });
    }
});

// PUT update staff (admin only)
router.put('/:id', verifyToken, isAdmin, validateObjectIdParam('id'), async (req, res) => {
    try {
        const { name, phone, role, department, status } = req.body;
        
        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            { name, phone, role, department, status },
            { new: true, runValidators: true }
        );
        
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        
        res.json({ message: 'Staff updated successfully', staff });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update staff', detail: error.message });
    }
});

// PUT change password (authenticated - own account only)
router.put('/:id/password', verifyToken, validateObjectIdParam('id'), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const isSelfRequest = String(req.user.id) === String(req.params.id);
        if (req.user.role !== 'admin' && !isSelfRequest) {
            return res.status(403).json({ error: 'Access denied.' });
        }
        
        const staff = await Staff.findById(req.params.id).select('+password');
        
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        
        const isMatch = await staff.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        if (!newPassword || !isStrongPassword(newPassword)) {
            return res.status(400).json({ error: 'New password must be at least 6 characters and include a number.' });
        }

        const sameAsCurrent = await staff.comparePassword(newPassword);
        if (sameAsCurrent) {
            return res.status(400).json({ error: 'New password must be different from current password.' });
        }
        
        staff.password = newPassword;
        await staff.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password', detail: error.message });
    }
});

// DELETE staff (admin only)
router.delete('/:id', verifyToken, isAdmin, validateObjectIdParam('id'), async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete staff', detail: error.message });
    }
});

module.exports = router;

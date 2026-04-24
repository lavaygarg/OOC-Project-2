const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { registerLimiter, loginLimiter } = require('../middleware/rateLimiter');
const { sanitizeString, isValidEmail, isValidPhone, isStrongPassword } = require('../middleware/validation');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    process.exit(1);
}

const signAuthToken = (user) => jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
);

const signTwoFactorToken = (userId) => jwt.sign(
    { id: userId, purpose: '2fa' },
    JWT_SECRET,
    { expiresIn: '10m' }
);

const authenticateUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== 'user') {
            return res.status(403).json({ error: 'User access required.' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

router.post('/register', registerLimiter, async (req, res) => {
    try {
        const { name, email, phone, password } = req.body || {};
        const errors = [];

        if (!name || String(name).trim().length < 2) errors.push('Name must be at least 2 characters');
        if (!isValidEmail(email)) errors.push('Invalid email address');
        if (phone && !isValidPhone(phone)) errors.push('Invalid phone number');
        if (!password || !isStrongPassword(password)) errors.push('Password must be at least 6 characters and include a number');

        if (errors.length) {
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const sanitizedName = sanitizeString(name, 100);
        const sanitizedPhone = phone ? String(phone).replace(/[^\d+\-\s]/g, '').slice(0, 15) : '';

        const secret = speakeasy.generateSecret({
            name: `Hope Foundation (${normalizedEmail})`,
            issuer: 'Hope Foundation'
        });

        const user = new User({
            name: sanitizedName,
            email: normalizedEmail,
            phone: sanitizedPhone,
            password,
            twoFactorSecret: secret.base32,
            twoFactorEnabled: true
        });

        await user.save();

        const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            },
            twoFactor: {
                secret: secret.base32,
                otpauthUrl: secret.otpauth_url,
                qrCodeDataUrl
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed', detail: error.message });
    }
});

router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!isValidEmail(email) || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select('+password +twoFactorSecret');

        if (!user || user.status !== 'Active') {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatches = await user.comparePassword(password);
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const tempToken = signTwoFactorToken(user._id);

        res.json({
            requiresTwoFactor: true,
            tempToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', detail: error.message });
    }
});

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

        if (decoded.purpose !== '2fa') {
            return res.status(401).json({ error: 'Invalid verification session' });
        }

        const user = await User.findById(decoded.id).select('+twoFactorSecret');
        if (!user || user.status !== 'Active') {
            return res.status(401).json({ error: 'User not found or inactive' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: String(code).replace(/\s+/g, ''),
            window: 1
        });

        if (!verified) {
            return res.status(401).json({ error: 'Invalid verification code' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = signAuthToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Two-factor verification failed', detail: error.message });
    }
});

router.get('/me', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.status !== 'Active') {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile', detail: error.message });
    }
});

module.exports = router;
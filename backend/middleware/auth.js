const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    process.exit(1);
}

// Verify JWT Token Middleware
const verifyToken = async (req, res, next) => {
    try {
        const cookieToken = req.cookies?.staffAuthToken;
        const authHeader = req.headers.authorization;
        const headerToken = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;

        const token = cookieToken || headerToken;

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);

        const staff = await Staff.findById(decoded.id).select('name email role status');
        if (!staff || staff.status !== 'Active') {
            return res.status(401).json({ error: 'Invalid token or inactive account.' });
        }
        
        // Attach user info to request
        req.user = {
            id: staff._id.toString(),
            email: staff.email,
            role: staff.role,
            name: staff.name,
            twoFactorVerified: decoded.twoFactorVerified === true
        };
        req.userId = decoded.id;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        return res.status(500).json({ error: 'Authentication failed.' });
    }
};

// Optional token verification (doesn't block if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const cookieToken = req.cookies?.staffAuthToken;
        const authHeader = req.headers.authorization;
        const headerToken = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;
        const token = cookieToken || headerToken;

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            req.userId = decoded.id;
        }
        
        next();
    } catch (error) {
        // Continue without auth if token is invalid
        next();
    }
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }

        if (req.user.twoFactorVerified !== true) {
            return res.status(403).json({ error: 'Admin 2FA verification required.' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ error: 'Authorization failed.' });
    }
};

// Check if user is staff or admin
const isStaffOrAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (!['admin', 'staff', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Staff access required.' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ error: 'Authorization failed.' });
    }
};

// Generate new access token
const generateToken = (user, expiresIn = '7d') => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email, 
            role: user.role,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn }
    );
};

// Generate refresh token (longer lived)
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Verify refresh token and issue new access token
const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid refresh token');
        }

        const user = await Staff.findById(decoded.id);
        
        if (!user || user.status !== 'Active') {
            throw new Error('User not found or inactive');
        }

        return {
            accessToken: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

module.exports = {
    verifyToken,
    optionalAuth,
    isAdmin,
    isStaffOrAdmin,
    generateToken,
    generateRefreshToken,
    refreshAccessToken
};

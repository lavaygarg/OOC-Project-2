const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for login attempts (prevent brute force)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
        error: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Limiter for registration/signup
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 registrations per hour
    message: {
        error: 'Too many accounts created. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter for contact form (prevent spam)
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 messages per hour
    message: {
        error: 'Too many messages sent. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter for donation creation (prevent abuse)
const donationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 donation attempts per hour
    message: {
        error: 'Too many donation attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter for volunteer applications
const volunteerLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // Limit each IP to 3 applications per day
    message: {
        error: 'Too many applications submitted. Please try again tomorrow.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    loginLimiter,
    registerLimiter,
    contactLimiter,
    donationLimiter,
    volunteerLimiter
};

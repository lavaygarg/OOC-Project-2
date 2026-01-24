const validator = require('validator');

// Sanitize string input
const sanitizeString = (str, maxLength = 1000) => {
    if (!str || typeof str !== 'string') return '';
    return validator.escape(str.trim().slice(0, maxLength));
};

// Validate email
const isValidEmail = (email) => {
    if (!email) return false;
    return validator.isEmail(email);
};

// Validate phone (Indian format)
const isValidPhone = (phone) => {
    if (!phone) return true; // Phone is optional
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 12;
};

// Validate amount (positive number)
const isValidAmount = (amount) => {
    const num = Number(amount);
    return !isNaN(num) && num > 0 && num <= 10000000; // Max 1 crore
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return validator.isMongoId(String(id));
};

// Validate URL
const isValidUrl = (url) => {
    if (!url) return true;
    return validator.isURL(url, { protocols: ['http', 'https'] });
};

// Validate password strength
const isStrongPassword = (password) => {
    return validator.isStrongPassword(password, {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0
    });
};

// Validation middleware for volunteer registration
const validateVolunteer = (req, res, next) => {
    const { name, email, phone, interest } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!isValidEmail(email)) {
        errors.push('Invalid email address');
    }

    if (phone && !isValidPhone(phone)) {
        errors.push('Invalid phone number');
    }

    const validInterests = ['Teaching', 'Fundraising', 'Healthcare', 'Event Management', 'Admin Support', 'Other'];
    if (interest && !validInterests.includes(interest)) {
        errors.push('Invalid interest selected');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Sanitize inputs
    req.body.name = sanitizeString(name, 100);
    req.body.email = email.toLowerCase().trim();
    req.body.phone = phone ? phone.replace(/[^\d+\-\s]/g, '').slice(0, 15) : '';

    next();
};

// Validation middleware for donations
const validateDonation = (req, res, next) => {
    const { donorName, donorEmail, amount } = req.body;
    const errors = [];

    if (!donorName || donorName.trim().length < 2) {
        errors.push('Donor name must be at least 2 characters');
    }

    if (donorEmail && !isValidEmail(donorEmail)) {
        errors.push('Invalid email address');
    }

    if (!isValidAmount(amount)) {
        errors.push('Invalid donation amount');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Sanitize inputs
    req.body.donorName = sanitizeString(donorName, 100);
    req.body.amount = Number(amount);

    next();
};

// Validation middleware for messages
const validateMessage = (req, res, next) => {
    const { name, email, message } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!isValidEmail(email)) {
        errors.push('Invalid email address');
    }

    if (!message || message.trim().length < 10) {
        errors.push('Message must be at least 10 characters');
    }

    if (message && message.length > 2000) {
        errors.push('Message too long (max 2000 characters)');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Sanitize inputs
    req.body.name = sanitizeString(name, 100);
    req.body.email = email.toLowerCase().trim();
    req.body.message = sanitizeString(message, 2000);

    next();
};

// Validation middleware for staff login
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!isValidEmail(email)) {
        errors.push('Invalid email address');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    req.body.email = email.toLowerCase().trim();

    next();
};

// Validation middleware for staff registration
const validateStaffRegistration = (req, res, next) => {
    const { name, email, password, role } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!isValidEmail(email)) {
        errors.push('Invalid email address');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    const validRoles = ['admin', 'staff', 'manager'];
    if (role && !validRoles.includes(role)) {
        errors.push('Invalid role');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    req.body.name = sanitizeString(name, 100);
    req.body.email = email.toLowerCase().trim();

    next();
};

module.exports = {
    sanitizeString,
    isValidEmail,
    isValidPhone,
    isValidAmount,
    isValidObjectId,
    isValidUrl,
    isStrongPassword,
    validateVolunteer,
    validateDonation,
    validateMessage,
    validateLogin,
    validateStaffRegistration
};

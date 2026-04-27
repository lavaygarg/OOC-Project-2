const crypto = require('crypto');

const CSRF_COOKIE_NAME = 'csrfToken';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const AUTH_COOKIE_NAMES = ['staffAuthToken', 'userAuthToken'];

const getCookieOptions = () => ({
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
});

const generateToken = () => crypto.randomBytes(32).toString('base64url');

const ensureCsrfToken = (req, res) => {
    const existing = req.cookies?.[CSRF_COOKIE_NAME];
    if (existing) return existing;

    const token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, getCookieOptions());
    return token;
};

const hasAuthCookie = (req) => AUTH_COOKIE_NAMES.some((name) => Boolean(req.cookies?.[name]));

const timingSafeEqual = (a, b) => {
    const left = Buffer.from(String(a || ''), 'utf8');
    const right = Buffer.from(String(b || ''), 'utf8');

    if (left.length !== right.length || left.length === 0) return false;

    try {
        return crypto.timingSafeEqual(left, right);
    } catch {
        return false;
    }
};

const csrfProtection = (req, res, next) => {
    const csrfCookie = ensureCsrfToken(req, res);

    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    // Only enforce CSRF for cookie-authenticated requests.
    if (!hasAuthCookie(req)) {
        return next();
    }

    const headerToken = req.get('x-csrf-token') || req.get('x-xsrf-token') || '';
    const bodyToken = req.body && typeof req.body === 'object' ? req.body._csrf : '';
    const providedToken = String(headerToken || bodyToken || '').trim();

    if (!timingSafeEqual(providedToken, csrfCookie)) {
        return res.status(403).json({ error: 'CSRF token validation failed.' });
    }

    return next();
};

const issueCsrfToken = (req, res) => {
    const token = ensureCsrfToken(req, res);
    return res.json({ csrfToken: token });
};

module.exports = {
    csrfProtection,
    issueCsrfToken,
    CSRF_COOKIE_NAME
};

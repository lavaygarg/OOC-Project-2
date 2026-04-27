const sanitizeErrorResponses = ({ isProduction }) => (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (payload) => {
        if (
            isProduction &&
            res.statusCode >= 400 &&
            payload &&
            typeof payload === 'object' &&
            !Array.isArray(payload)
        ) {
            const sanitized = { ...payload };
            delete sanitized.detail;
            return originalJson(sanitized);
        }

        return originalJson(payload);
    };

    next();
};

module.exports = sanitizeErrorResponses;

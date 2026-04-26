const express = require('express');
const validator = require('validator');
const Testimonial = require('../models/Testimonial');
const { contactLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const sanitize = (value, maxLen) => validator.escape(String(value || '').trim().slice(0, maxLen));

// GET approved testimonials (public)
router.get('/', async (req, res) => {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
        const testimonials = await Testimonial.find({ status: 'Approved' })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return res.json({ testimonials });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch testimonials', detail: error.message });
    }
});

// POST new testimonial (public, rate limited)
router.post('/', contactLimiter, async (req, res) => {
    try {
        const { name, role, city, rating, message, image } = req.body || {};
        const errors = [];

        const cleanName = sanitize(name, 100);
        const cleanRole = sanitize(role, 60);
        const cleanCity = sanitize(city, 60);
        const cleanMessage = sanitize(message, 1000);
        const cleanImage = String(image || '').trim().slice(0, 500);

        const numericRating = Number(rating);

        if (!cleanName || cleanName.length < 2) errors.push('Name must be at least 2 characters');
        if (!cleanRole || cleanRole.length < 2) errors.push('Role must be at least 2 characters');
        if (!cleanCity || cleanCity.length < 2) errors.push('City must be at least 2 characters');
        if (!cleanMessage || cleanMessage.length < 10) errors.push('Story must be at least 10 characters');
        if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) errors.push('Rating must be between 1 and 5');

        if (cleanImage && !validator.isURL(cleanImage, { protocols: ['http', 'https'], require_protocol: true })) {
            errors.push('Image URL must be a valid http/https URL');
        }

        if (errors.length) {
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }

        const testimonial = await Testimonial.create({
            name: cleanName,
            role: cleanRole,
            city: cleanCity,
            rating: Math.round(numericRating),
            message: cleanMessage,
            image: cleanImage,
            status: 'Approved'
        });

        return res.status(201).json({ message: 'Testimonial submitted', testimonial });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to submit testimonial', detail: error.message });
    }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const { volunteerLimiter } = require('../middleware/rateLimiter');
const { validateVolunteer } = require('../middleware/validation');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth');

// GET all volunteers (staff/admin only)
router.get('/', async (req, res) => {
    try {
        const { status, interest } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        if (interest) filter.interest = interest;
        
        const volunteers = await Volunteer.find(filter).sort({ createdAt: -1 });
        res.json(volunteers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch volunteers', detail: error.message });
    }
});

// GET single volunteer
router.get('/:id', async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }
        res.json(volunteer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch volunteer', detail: error.message });
    }
});

// POST create volunteer (public registration) - Rate limited and validated
router.post('/', volunteerLimiter, validateVolunteer, async (req, res) => {
    try {
        const { name, email, phone, interest, message } = req.body;
        
        // Check if email already exists
        const existing = await Volunteer.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email already registered as volunteer' });
        }
        
        const volunteer = new Volunteer({
            name,
            email,
            phone,
            interest,
            message,
            status: 'Pending'
        });
        
        await volunteer.save();
        res.status(201).json({ message: 'Volunteer application submitted successfully', volunteer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit application', detail: error.message });
    }
});

// PUT update volunteer status (admin)
router.put('/:id', async (req, res) => {
    try {
        const { status, interest } = req.body;
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            { status, interest },
            { new: true, runValidators: true }
        );
        
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }
        
        res.json({ message: 'Volunteer updated successfully', volunteer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update volunteer', detail: error.message });
    }
});

// DELETE volunteer
router.delete('/:id', async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }
        res.json({ message: 'Volunteer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete volunteer', detail: error.message });
    }
});

module.exports = router;

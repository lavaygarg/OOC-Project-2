const express = require('express');
const router = express.Router();
const Institution = require('../models/Institution');

// GET all institutions
router.get('/', async (req, res) => {
    try {
        const { sector, status, city } = req.query;
        const filter = {};
        
        if (sector) filter.sector = sector;
        if (status) filter.status = status;
        if (city) filter.city = { $regex: city, $options: 'i' };
        
        const institutions = await Institution.find(filter).sort({ name: 1 });
        res.json(institutions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch institutions', detail: error.message });
    }
});

// GET institution stats
router.get('/stats', async (req, res) => {
    try {
        const total = await Institution.countDocuments({ status: 'Active' });
        const bySector = await Institution.aggregate([
            { $match: { status: 'Active' } },
            { $group: { _id: '$sector', count: { $sum: 1 }, totalAllocation: { $sum: '$allocation' } } }
        ]);
        
        res.json({ total, bySector });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats', detail: error.message });
    }
});

// GET single institution
router.get('/:id', async (req, res) => {
    try {
        const institution = await Institution.findById(req.params.id);
        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }
        res.json(institution);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch institution', detail: error.message });
    }
});

// POST create institution
router.post('/', async (req, res) => {
    try {
        const institution = new Institution(req.body);
        await institution.save();
        res.status(201).json({ message: 'Institution created successfully', institution });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create institution', detail: error.message });
    }
});

// PUT update institution
router.put('/:id', async (req, res) => {
    try {
        const institution = await Institution.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }
        
        res.json({ message: 'Institution updated successfully', institution });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update institution', detail: error.message });
    }
});

// DELETE institution
router.delete('/:id', async (req, res) => {
    try {
        const institution = await Institution.findByIdAndDelete(req.params.id);
        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }
        res.json({ message: 'Institution deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete institution', detail: error.message });
    }
});

module.exports = router;

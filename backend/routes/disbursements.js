const express = require('express');
const router = express.Router();
const Disbursement = require('../models/Disbursement');
const { validateObjectIdParam } = require('../middleware/validation');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth');

// GET all disbursements (staff/admin only)
router.get('/', verifyToken, isStaffOrAdmin, async (req, res) => {
    try {
        const { category, status, startDate, endDate } = req.query;
        const filter = {};
        
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }
        
        const disbursements = await Disbursement.find(filter)
            .populate('approvedBy', 'name email')
            .sort({ date: -1 });
        res.json(disbursements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch disbursements', detail: error.message });
    }
});

// GET disbursement stats
router.get('/stats', async (req, res) => {
    try {
        const totalDisbursements = await Disbursement.countDocuments({ status: 'Disbursed' });
        const totalAmount = await Disbursement.aggregate([
            { $match: { status: 'Disbursed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const byCategory = await Disbursement.aggregate([
            { $match: { status: 'Disbursed' } },
            { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } }
        ]);
        
        res.json({
            totalDisbursements,
            totalAmount: totalAmount[0]?.total || 0,
            byCategory
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats', detail: error.message });
    }
});

// GET single disbursement (staff/admin only)
router.get('/:id', verifyToken, isStaffOrAdmin, validateObjectIdParam('id'), async (req, res) => {
    try {
        const disbursement = await Disbursement.findById(req.params.id)
            .populate('approvedBy', 'name email');
        if (!disbursement) {
            return res.status(404).json({ error: 'Disbursement not found' });
        }
        res.json(disbursement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch disbursement', detail: error.message });
    }
});

// POST create disbursement (staff/admin only)
router.post('/', verifyToken, isStaffOrAdmin, async (req, res) => {
    try {
        const { recipient, amount, category, description, date } = req.body;
        
        const disbursement = new Disbursement({
            recipient,
            amount,
            category,
            description,
            date: date || new Date(),
            approvedBy: req.userId,
            status: 'Disbursed'
        });
        
        await disbursement.save();
        res.status(201).json({ message: 'Disbursement created successfully', disbursement });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create disbursement', detail: error.message });
    }
});

// PUT update disbursement (staff/admin only)
router.put('/:id', verifyToken, isStaffOrAdmin, validateObjectIdParam('id'), async (req, res) => {
    try {
        const allowedFields = ['recipient', 'amount', 'category', 'description', 'date', 'approvedBy', 'status'];
        const updates = Object.fromEntries(
            Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key))
        );

        const disbursement = await Disbursement.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );
        
        if (!disbursement) {
            return res.status(404).json({ error: 'Disbursement not found' });
        }
        
        res.json({ message: 'Disbursement updated successfully', disbursement });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update disbursement', detail: error.message });
    }
});

// DELETE disbursement (staff/admin only)
router.delete('/:id', verifyToken, isStaffOrAdmin, validateObjectIdParam('id'), async (req, res) => {
    try {
        const disbursement = await Disbursement.findByIdAndDelete(req.params.id);
        if (!disbursement) {
            return res.status(404).json({ error: 'Disbursement not found' });
        }
        res.json({ message: 'Disbursement deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete disbursement', detail: error.message });
    }
});

module.exports = router;

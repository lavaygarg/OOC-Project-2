const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { donationLimiter } = require('../middleware/rateLimiter');
const { validateDonation, validateObjectIdParam } = require('../middleware/validation');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth');

// GET all donations (staff/admin only)
router.get('/', verifyToken, isStaffOrAdmin, async (req, res) => {
    try {
        const { status, method, startDate, endDate } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        if (method) filter.method = method;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        
        const donations = await Donation.find(filter).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch donations', detail: error.message });
    }
});

// GET donation stats
router.get('/stats', async (req, res) => {
    try {
        const totalDonations = await Donation.countDocuments({ status: 'Completed' });
        const totalAmount = await Donation.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const byMethod = await Donation.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } }
        ]);
        
        res.json({
            totalDonations,
            totalAmount: totalAmount[0]?.total || 0,
            byMethod
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats', detail: error.message });
    }
});

// GET single donation (staff/admin only)
router.get('/:id', verifyToken, isStaffOrAdmin, validateObjectIdParam('id'), async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        res.json(donation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch donation', detail: error.message });
    }
});

// POST create donation (after successful payment) - Rate limited and validated
router.post('/', donationLimiter, validateDonation, async (req, res) => {
    try {
        const { donorName, donorEmail, donorPhone, amount, method, paymentId, orderId, notes } = req.body;
        
        const donation = new Donation({
            donorName,
            donorEmail,
            donorPhone,
            amount,
            method,
            paymentId,
            orderId,
            notes,
            status: 'Completed'
        });
        
        await donation.save();
        res.status(201).json({ message: 'Donation recorded successfully', donation });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record donation', detail: error.message });
    }
});

// PUT update donation (staff/admin only)
router.put('/:id', verifyToken, isStaffOrAdmin, validateObjectIdParam('id'), async (req, res) => {
    try {
        const allowedFields = ['donorName', 'donorEmail', 'donorPhone', 'amount', 'method', 'paymentId', 'orderId', 'status', 'notes'];
        const updates = Object.fromEntries(
            Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key))
        );

        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );
        
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        
        res.json({ message: 'Donation updated successfully', donation });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update donation', detail: error.message });
    }
});

// DELETE donation (staff/admin only)
router.delete('/:id', verifyToken, isStaffOrAdmin, validateObjectIdParam('id'), async (req, res) => {
    try {
        const donation = await Donation.findByIdAndDelete(req.params.id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        res.json({ message: 'Donation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete donation', detail: error.message });
    }
});

module.exports = router;

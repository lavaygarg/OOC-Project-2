const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { donationLimiter } = require('../middleware/rateLimiter');
const { validateDonation } = require('../middleware/validation');

// GET all donations
router.get('/', async (req, res) => {
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

// GET single donation
router.get('/:id', async (req, res) => {
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

// PUT update donation
router.put('/:id', async (req, res) => {
    try {
        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            req.body,
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

// DELETE donation
router.delete('/:id', async (req, res) => {
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

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { contactLimiter } = require('../middleware/rateLimiter');
const { validateMessage } = require('../middleware/validation');

// GET all messages
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        
        const messages = await Message.find(filter)
            .populate('repliedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages', detail: error.message });
    }
});

// GET message stats
router.get('/stats', async (req, res) => {
    try {
        const total = await Message.countDocuments();
        const unread = await Message.countDocuments({ status: 'Unread' });
        const replied = await Message.countDocuments({ status: 'Replied' });
        
        res.json({ total, unread, replied });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats', detail: error.message });
    }
});

// GET single message
router.get('/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id)
            .populate('repliedBy', 'name email');
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch message', detail: error.message });
    }
});

// POST create message (public contact form) - Rate limited and validated
router.post('/', contactLimiter, validateMessage, async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        const newMessage = new Message({
            name,
            email,
            phone,
            subject,
            message,
            status: 'Unread'
        });
        
        await newMessage.save();
        res.status(201).json({ message: 'Message sent successfully', data: newMessage });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message', detail: error.message });
    }
});

// PUT update message status
router.put('/:id', async (req, res) => {
    try {
        const { status, replyMessage, repliedBy } = req.body;
        
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { status, replyMessage, repliedBy },
            { new: true, runValidators: true }
        );
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json({ message: 'Message updated successfully', data: message });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update message', detail: error.message });
    }
});

// PUT mark as read
router.put('/:id/read', async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { status: 'Read' },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json({ message: 'Marked as read', data: message });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update message', detail: error.message });
    }
});

// DELETE message
router.delete('/:id', async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message', detail: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET all events
router.get('/', async (req, res) => {
    try {
        const { status, upcoming } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        if (upcoming === 'true') {
            filter.date = { $gte: new Date() };
        }
        
        const events = await Event.find(filter).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events', detail: error.message });
    }
});

// GET single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch event', detail: error.message });
    }
});

// POST create event
router.post('/', async (req, res) => {
    try {
        const { title, description, date, location, organizer, maxParticipants } = req.body;
        
        const event = new Event({
            title,
            description,
            date,
            location,
            organizer,
            maxParticipants,
            status: new Date(date) > new Date() ? 'Upcoming' : 'Completed'
        });
        
        await event.save();
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event', detail: error.message });
    }
});

// PUT update event
router.put('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json({ message: 'Event updated successfully', event });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update event', detail: error.message });
    }
});

// POST register for event
router.post('/:id/register', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        if (event.maxParticipants > 0 && event.registeredCount >= event.maxParticipants) {
            return res.status(400).json({ error: 'Event is full' });
        }
        
        event.registeredCount += 1;
        await event.save();
        
        res.json({ message: 'Registered successfully', event });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register', detail: error.message });
    }
});

// DELETE event
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event', detail: error.message });
    }
});

module.exports = router;

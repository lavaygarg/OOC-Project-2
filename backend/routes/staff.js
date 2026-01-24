const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

const JWT_SECRET = process.env.JWT_SECRET || 'ooc-secret-key-2026';

// GET all staff (admin only)
router.get('/', async (req, res) => {
    try {
        const { role, status } = req.query;
        const filter = {};
        
        if (role) filter.role = role;
        if (status) filter.status = status;
        
        const staff = await Staff.find(filter).sort({ createdAt: -1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff', detail: error.message });
    }
});

// POST login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find staff with password field
        const staff = await Staff.findOne({ email }).select('+password');
        
        if (!staff) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        if (staff.status !== 'Active') {
            return res.status(401).json({ error: 'Account is not active' });
        }
        
        const isMatch = await staff.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Update last login
        staff.lastLogin = new Date();
        await staff.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { id: staff._id, email: staff.email, role: staff.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', detail: error.message });
    }
});

// POST register new staff (admin only)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role, department } = req.body;
        
        // Check if email already exists
        const existing = await Staff.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const staff = new Staff({
            name,
            email,
            password,
            phone,
            role: role || 'staff',
            department
        });
        
        await staff.save();
        
        res.status(201).json({
            message: 'Staff registered successfully',
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed', detail: error.message });
    }
});

// GET single staff
router.get('/:id', async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff', detail: error.message });
    }
});

// PUT update staff
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, role, department, status } = req.body;
        
        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            { name, phone, role, department, status },
            { new: true, runValidators: true }
        );
        
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        
        res.json({ message: 'Staff updated successfully', staff });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update staff', detail: error.message });
    }
});

// PUT change password
router.put('/:id/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const staff = await Staff.findById(req.params.id).select('+password');
        
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        
        const isMatch = await staff.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        staff.password = newPassword;
        await staff.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password', detail: error.message });
    }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete staff', detail: error.message });
    }
});

module.exports = router;

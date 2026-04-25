const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const PortalMessage = require('../models/PortalMessage');
const Staff = require('../models/Staff');
const User = require('../models/User');
const { contactLimiter } = require('../middleware/rateLimiter');
const { validateMessage } = require('../middleware/validation');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;
const SSE_RETRY_MS = 3000;
const HEARTBEAT_INTERVAL_MS = 25000;
const portalSubscribers = new Map();

const toPortalUserId = (kind, id, role) => {
    const normalized = String(id || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (kind === 'staff') return role === 'admin' ? 'ADMIN' : `STAFF-${normalized}`;
    return `USER-${normalized}`;
};

const toPortalIdentity = (doc, kind) => ({
    userId: toPortalUserId(kind, doc._id, doc.role),
    displayName: doc.name || (kind === 'staff' ? 'Staff' : 'User'),
    role: kind === 'staff' ? (doc.role || 'staff') : 'user',
    department: kind === 'staff' ? (doc.department || 'operations') : 'donors',
    email: doc.email || ''
});

const sanitizeRecipientTokens = (input) => {
    const list = Array.isArray(input) ? input : [input];
    return [...new Set(
        list
            .map(value => String(value || '').trim())
            .filter(Boolean)
            .filter(token => (
                token === 'all' ||
                token === 'admin' ||
                token.startsWith('role:') ||
                token.startsWith('user:')
            ))
    )];
};

const getPortalAudienceTokens = (current) => {
    const tokens = [
        'all',
        `role:${current.role}`,
        `user:${current.userId}`
    ];

    if (current.department) {
        tokens.push(`dept:${current.department}`);
    }

    if (current.college) {
        tokens.push(`college:${current.college}`);
    }

    if (current.role === 'admin') {
        tokens.push('admin', 'role:management');
    }

    return tokens;
};

const canPortalUserAccessMessage = (current, messageDoc) => {
    if (!current || !messageDoc) return false;
    if (messageDoc?.from?.userId === current.userId) return true;

    const audience = new Set(getPortalAudienceTokens(current));
    const recipients = Array.isArray(messageDoc.recipientTokens)
        ? messageDoc.recipientTokens
        : [];

    return recipients.some(token => audience.has(token));
};

const normalizePortalPayload = (messageDoc) => {
    if (!messageDoc) return null;
    if (typeof messageDoc.toObject === 'function') {
        return messageDoc.toObject();
    }
    return messageDoc;
};

const emitSseEvent = (res, event, payload) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const broadcastPortalEvent = (event, payload, options = {}) => {
    const message = payload?.message;
    if (!message) return;

    for (const [, subscriber] of portalSubscribers) {
        if (!subscriber?.res || !subscriber?.portalUser) continue;

        if (!canPortalUserAccessMessage(subscriber.portalUser, message)) {
            continue;
        }

        emitSseEvent(subscriber.res, event, payload);
        if (options.includeConversationUpdate) {
            emitSseEvent(subscriber.res, 'conversation:update', {
                messageId: message._id || message.id,
                updatedAt: message.createdAt || new Date().toISOString()
            });
        }
    }
};

const verifyPortalAuth = async (req, res, next) => {
    try {
        const cookieStaffToken = req.cookies?.staffAuthToken;
        const cookieUserToken = req.cookies?.userAuthToken;
        const authHeader = req.headers.authorization;
        const headerToken = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;

        const token = cookieStaffToken || cookieUserToken || headerToken;
        if (!token) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.role === 'user') {
            const user = await User.findById(decoded.id).select('name email role status');
            if (!user || user.status !== 'Active') {
                return res.status(401).json({ error: 'Invalid or inactive user account.' });
            }
            req.portalUser = toPortalIdentity(user, 'user');
            return next();
        }

        const staff = await Staff.findById(decoded.id).select('name email role department status');
        if (!staff || staff.status !== 'Active') {
            return res.status(401).json({ error: 'Invalid or inactive staff account.' });
        }
        req.portalUser = toPortalIdentity(staff, 'staff');
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please login again.' });
        }
        return res.status(401).json({ error: 'Invalid authentication token.' });
    }
};

// GET unified portal messages (authenticated user/staff/admin)
router.get('/portal', verifyPortalAuth, async (req, res) => {
    try {
        const current = req.portalUser;
        const recipientTokens = getPortalAudienceTokens(current);
        const sinceParam = String(req.query?.since || '').trim();
        const createdAfter = sinceParam ? new Date(sinceParam) : null;

        const baseQuery = {
            $or: [
                { 'from.userId': current.userId },
                { recipientTokens: { $in: recipientTokens } }
            ]
        };

        if (createdAfter && !Number.isNaN(createdAfter.getTime())) {
            baseQuery.createdAt = { $gt: createdAfter };
        }

        const messages = await PortalMessage.find(baseQuery)
            .sort({ createdAt: -1 })
            .lean();

        const [staffMembers, users] = await Promise.all([
            Staff.find({ status: 'Active' }).select('name email role department').lean(),
            User.find({ status: 'Active' }).select('name email role').lean()
        ]);

        const directoryMap = new Map();
        staffMembers.forEach(member => {
            const identity = toPortalIdentity(member, 'staff');
            directoryMap.set(identity.userId, identity);
        });
        users.forEach(user => {
            const identity = toPortalIdentity(user, 'user');
            directoryMap.set(identity.userId, identity);
        });

        const directory = Array.from(directoryMap.values())
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        return res.json({
            currentUser: current,
            messages,
            directory
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to load portal messages', detail: error.message });
    }
});

// Live stream for portal messages (authenticated user/staff/admin)
router.get('/portal/stream', verifyPortalAuth, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
        res.flushHeaders();
    }

    res.write(`retry: ${SSE_RETRY_MS}\n\n`);

    const subscriberId = `${req.portalUser.userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const heartbeat = setInterval(() => {
        res.write(': ping\n\n');
    }, HEARTBEAT_INTERVAL_MS);

    portalSubscribers.set(subscriberId, {
        res,
        portalUser: req.portalUser,
        heartbeat
    });

    emitSseEvent(res, 'connection:ready', {
        subscriberId,
        userId: req.portalUser.userId,
        role: req.portalUser.role,
        connectedAt: new Date().toISOString()
    });

    req.on('close', () => {
        const subscriber = portalSubscribers.get(subscriberId);
        if (subscriber?.heartbeat) {
            clearInterval(subscriber.heartbeat);
        }
        portalSubscribers.delete(subscriberId);
    });
});

// POST unified portal message (authenticated user/staff/admin)
router.post('/portal', verifyPortalAuth, async (req, res) => {
    try {
        const { to, recipientTokens: rawTokens, subject, body, type = 'message' } = req.body || {};
        const recipientTokens = sanitizeRecipientTokens(rawTokens?.length ? rawTokens : to);

        const safeSubject = String(subject || '').trim().slice(0, 200);
        const safeBody = String(body || '').trim().slice(0, 5000);

        if (!recipientTokens.length) {
            return res.status(400).json({ error: 'At least one valid recipient is required.' });
        }
        if (!safeSubject || !safeBody) {
            return res.status(400).json({ error: 'Subject and body are required.' });
        }

        const message = await PortalMessage.create({
            from: req.portalUser,
            recipientTokens,
            subject: safeSubject,
            body: safeBody,
            type: ['message', 'task', 'shift', 'notification'].includes(type) ? type : 'message'
        });

        const payloadMessage = normalizePortalPayload(message);
        const isReply = safeSubject.toLowerCase().startsWith('re:');
        broadcastPortalEvent(isReply ? 'message:reply' : 'message:new', {
            message: payloadMessage
        }, { includeConversationUpdate: true });

        return res.status(201).json({
            message: 'Portal message sent',
            data: payloadMessage,
            delivered: true
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to send portal message', detail: error.message });
    }
});

// GET all messages (staff/admin only)
router.get('/', verifyToken, isStaffOrAdmin, async (req, res) => {
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

// GET message stats (staff/admin only)
router.get('/stats', verifyToken, isStaffOrAdmin, async (req, res) => {
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

// PUT update message status (staff/admin only)
router.put('/:id', verifyToken, isStaffOrAdmin, async (req, res) => {
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

// PUT mark as read (staff/admin only)
router.put('/:id/read', verifyToken, isStaffOrAdmin, async (req, res) => {
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

// DELETE message (staff/admin only)
router.delete('/:id', verifyToken, isStaffOrAdmin, async (req, res) => {
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

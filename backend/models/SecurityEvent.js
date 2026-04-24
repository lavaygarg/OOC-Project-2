const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['admin', 'staff', 'manager', 'unknown'],
        default: 'unknown'
    },
    eventType: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'blocked', 'info'],
        required: true
    },
    ipAddress: {
        type: String,
        trim: true,
        maxlength: 100
    },
    userAgent: {
        type: String,
        trim: true,
        maxlength: 300
    },
    detail: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    metadata: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('SecurityEvent', securityEventSchema);

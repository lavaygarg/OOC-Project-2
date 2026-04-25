const mongoose = require('mongoose');

const portalIdentitySchema = new mongoose.Schema({
    userId: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    department: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' }
}, { _id: false });

const portalMessageSchema = new mongoose.Schema({
    from: {
        type: portalIdentitySchema,
        required: true
    },
    recipientTokens: {
        type: [String],
        required: true,
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length > 0,
            message: 'At least one recipient token is required'
        }
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    body: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    type: {
        type: String,
        enum: ['message', 'task', 'shift', 'notification'],
        default: 'message'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('PortalMessage', portalMessageSchema);

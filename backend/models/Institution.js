const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    sector: {
        type: String,
        enum: ['Education', 'Nutrition', 'Healthcare', 'Shelter', 'Other'],
        required: [true, 'Sector is required']
    },
    allocation: {
        type: Number,
        default: 0,
        min: 0,
        max: 100 // Percentage
    },
    impact: {
        type: String,
        trim: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    contactPhone: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Institution', institutionSchema);

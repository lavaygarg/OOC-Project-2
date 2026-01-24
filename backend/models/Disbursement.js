const mongoose = require('mongoose');

const disbursementSchema = new mongoose.Schema({
    recipient: {
        type: String,
        required: [true, 'Recipient is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be at least 1']
    },
    category: {
        type: String,
        enum: ['Education', 'Nutrition', 'Healthcare', 'Shelter', 'Emergency', 'Other'],
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        trim: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Disbursed', 'Cancelled'],
        default: 'Disbursed'
    },
    date: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Disbursement', disbursementSchema);

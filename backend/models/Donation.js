const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donorName: {
        type: String,
        required: [true, 'Donor name is required'],
        trim: true
    },
    donorEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    donorPhone: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be at least 1']
    },
    method: {
        type: String,
        enum: ['UPI (Razorpay)', 'Card (Razorpay)', 'Bank Transfer', 'Cash', 'Cheque', 'Other'],
        default: 'UPI (Razorpay)'
    },
    paymentId: {
        type: String,
        trim: true
    },
    orderId: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Completed'
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for formatted date
donationSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toISOString().split('T')[0];
});

// Ensure virtuals are included in JSON
donationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Donation', donationSchema);

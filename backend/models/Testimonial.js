const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, required: true, trim: true, maxlength: 60 },
    city: { type: String, required: true, trim: true, maxlength: 60 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    image: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
    createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);

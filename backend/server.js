require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./config/database');

// Import Routes
const volunteerRoutes = require('./routes/volunteers');
const donationRoutes = require('./routes/donations');
const staffRoutes = require('./routes/staff');
const disbursementRoutes = require('./routes/disbursements');
const eventRoutes = require('./routes/events');
const messageRoutes = require('./routes/messages');
const institutionRoutes = require('./routes/institutions');

// Import Middleware
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Connect to MongoDB
connectDB();

// =====================
// SECURITY MIDDLEWARE
// =====================

// Set security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
}));

// Rate limiting - Apply to all API routes
app.use('/api/', apiLimiter);

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// CORS configuration - Allow all origins for development and production
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    process.env.FRONTEND_URL // Add your Netlify URL in Render env variables
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, file://, etc.)
        if (!origin) return callback(null, true);
        
        // Allow localhost with any port
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        // Allow netlify.app, vercel.app, and onrender.com domains
        if (origin.includes('netlify.app') || origin.includes('vercel.app') || origin.includes('onrender.com')) {
            return callback(null, true);
        }
        
        // Allow specific origins from the list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // For development, allow all origins
            callback(null, true);
        }
    },
    credentials: true
}));

// Body parser with size limits
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

if (!keyId || !keySecret) {
    console.warn('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set. Create a .env file.');
}

const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'OOC Backend API is running' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create Razorpay Order
app.post('/api/create-order', async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        if (!amount || amount < 100) return res.status(400).json({ error: 'Amount must be >= ₹1.00' });

        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: req.body.receipt || 'rcpt_' + Date.now(),
            notes: req.body.notes || {}
        });

        res.json({ order, keyId });
    } catch (err) {
        console.error('Order creation failed', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Also support the /api/razorpay/create-order endpoint
app.post('/api/razorpay/create-order', async (req, res) => {
    try {
        const { amount, donorName = 'Anonymous', donorEmail = '', donorContact = '' } = req.body || {};

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Amount is required and must be > 0' });
        }

        const order = await razorpay.orders.create({
            amount: Math.round(Number(amount) * 100), // convert to paise
            currency: 'INR',
            receipt: 'donation_' + Date.now(),
            payment_capture: 1
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId,
            donor: { name: donorName, email: donorEmail, contact: donorContact }
        });
    } catch (err) {
        console.error('Razorpay create order error', err);
        res.status(500).json({ error: 'Unable to create order', detail: err?.message });
    }
});

// Verify Payment
app.post('/api/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ verified: false, error: 'Missing fields' });
    }

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const digest = hmac.digest('hex');
    const verified = digest === razorpay_signature;
    return res.json({ verified });
});

// Webhook for Razorpay events
app.post('/api/webhook', (req, res) => {
    const payload = JSON.stringify(req.body);
    const receivedSignature = req.headers['x-razorpay-signature'];
    if (!webhookSecret || !receivedSignature) {
        return res.status(400).send('Webhook secret/signature missing');
    }

    const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
    if (expected !== receivedSignature) {
        return res.status(400).send('Invalid signature');
    }

    // Log event - you can persist to database later
    console.log('Razorpay webhook received:', req.body?.event);
    res.status(200).send('OK');
});

// =====================
// DATABASE API ROUTES
// =====================
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/disbursements', disbursementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/institutions', institutionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server listening on port ${PORT}`);
});

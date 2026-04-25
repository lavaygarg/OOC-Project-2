require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/database');

// Import Routes
const volunteerRoutes = require('./routes/volunteers');
const donationRoutes = require('./routes/donations');
const staffRoutes = require('./routes/staff');
const userRoutes = require('./routes/users');
const disbursementRoutes = require('./routes/disbursements');
const eventRoutes = require('./routes/events');
const messageRoutes = require('./routes/messages');
const institutionRoutes = require('./routes/institutions');

// Import Middleware
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
app.set('trust proxy', 1);

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

// Data sanitization against XSS
app.use(xssClean());

// Prevent HTTP Parameter Pollution
app.use(hpp());

const isProduction = process.env.NODE_ENV === 'production';

const normalizeOrigin = (value) => {
    if (!value) return '';
    const raw = String(value).trim();
    if (!raw) return '';
    try {
        return new URL(raw).origin.toLowerCase();
    } catch {
        return raw.replace(/\/+$/, '').toLowerCase();
    }
};

// CORS configuration - permissive in development, explicit in production
const allowedOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : [])
]
    .map(normalizeOrigin)
    .filter(Boolean);

const deployedFrontendHost = normalizeOrigin('https://hopefoundation.onrender.com');
const renderPreviewHost = normalizeOrigin('https://*.onrender.com');

const localOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
].map(normalizeOrigin);

app.use(cors({
    origin: function(origin, callback) {
        const normalizedOrigin = normalizeOrigin(origin);

        // Allow requests with no origin in all environments (Render health checks, curl, server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        // Allow localhost with any port only in development
        if (!isProduction && (
            localOrigins.includes(normalizedOrigin) ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin)
        )) {
            return callback(null, true);
        }
        
        // Allow specific origins from the list in all environments
        if (
            allowedOrigins.includes(normalizedOrigin) ||
            normalizedOrigin === deployedFrontendHost ||
            normalizedOrigin.endsWith('.onrender.com')
        ) {
            return callback(null, true);
        }

        console.warn(`CORS blocked origin: ${origin}`);

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(cookieParser());

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
app.use('/api/users', userRoutes);
app.use('/api/disbursements', disbursementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/institutions', institutionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        error: err.message === 'Not allowed by CORS' ? 'Origin not allowed' : 'Internal server error',
        ...(isProduction ? {} : { detail: err.message })
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server listening on port ${PORT}`);
});

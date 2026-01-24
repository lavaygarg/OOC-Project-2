require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

if (!keyId || !keySecret) {
    console.warn('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set. Create a .env file.');
}

const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

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

    // TODO: persist payment status in a database if needed
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

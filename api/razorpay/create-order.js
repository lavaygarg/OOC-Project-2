const Razorpay = require('razorpay');

// Helper to send JSON responses
function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return send(res, 405, { error: 'Method not allowed' });
  }

  const {
    amount, // in INR
    donorName = 'Anonymous',
    donorEmail = '',
    donorContact = ''
  } = req.body || {};

  if (!amount || Number(amount) <= 0) {
    return send(res, 400, { error: 'Amount is required and must be > 0' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return send(res, 500, { error: 'Razorpay keys not configured' });
  }

  try {
    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await instance.orders.create({
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: 'INR',
      receipt: 'donation_' + Date.now(),
      payment_capture: 1
    });

    return send(res, 200, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      donor: { name: donorName, email: donorEmail, contact: donorContact }
    });
  } catch (err) {
    console.error('Razorpay create order error', err);
    return send(res, 500, { error: 'Unable to create order', detail: err?.message });
  }
};

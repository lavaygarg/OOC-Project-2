const crypto = require('crypto');

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return send(res, 405, { error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return send(res, 500, { error: 'Webhook secret not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body || {});

  if (!signature || !rawBody) {
    return send(res, 400, { error: 'Invalid webhook payload' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  const isValid = expectedSignature === signature;
  if (!isValid) {
    return send(res, 400, { error: 'Signature verification failed' });
  }

  // Log event for now; you can persist to DB later
  console.log('Razorpay webhook received:', req.body?.event, req.body?.payload?.payment?.entity?.status);

  return send(res, 200, { status: 'ok' });
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};

# 🚀 Render.com Deployment Guide

This guide will help you deploy both the **frontend** and **backend** of the OOC Project on Render.com with Razorpay payment gateway integration.

---

## 📋 Prerequisites

1. A [Render.com](https://render.com) account (free tier available)
2. A [Razorpay](https://razorpay.com) account with API keys
3. Your code pushed to a GitHub/GitLab repository

---

## 🔑 Step 1: Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Generate API Keys:
   - For testing: Use **Test Mode** keys (prefix: `rzp_test_`)
   - For production: Use **Live Mode** keys (prefix: `rzp_live_`)
4. Copy both:
   - **Key ID** (public key)
   - **Key Secret** (private key - keep this secure!)

### Optional: Webhook Secret
1. Go to **Settings** → **Webhooks**
2. Create a webhook pointing to: `https://your-backend.onrender.com/api/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the **Webhook Secret**

---

## 🖥️ Step 2: Deploy Backend on Render

### Option A: Deploy via Dashboard (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub/GitLab repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `ooc-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free (or Starter for better performance) |

5. Add **Environment Variables** (click "Advanced" → "Add Environment Variable"):

| Key | Value |
|-----|-------|
| `RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxxxxxxx` (your key) |
| `RAZORPAY_KEY_SECRET` | `xxxxxxxxxxxxxxxxxxxxxxxx` (your secret) |
| `RAZORPAY_WEBHOOK_SECRET` | *(optional)* |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | *(add after deploying frontend)* |

6. Click **"Create Web Service"**

### Option B: Deploy via Blueprint (render.yaml)

1. The `render.yaml` file is already created in your project root
2. Go to Render Dashboard → **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically detect `render.yaml` and create services
5. Add environment variables in the dashboard after deployment

---

## 🌐 Step 3: Deploy Frontend on Render

### Option A: Static Site (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `ooc-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | *(leave empty)* |
| **Publish Directory** | `.` |

5. Click **"Create Static Site"**

### Important: Update API URL in Frontend

After deploying the backend, update the `API_BASE_URL` in `frontend/script.js`:

```javascript
// Line 3 in script.js
const API_BASE_URL = 'https://ooc-backend.onrender.com';
```

Replace `ooc-backend` with your actual backend service name from Render.

---

## 🔄 Step 4: Connect Frontend and Backend

1. **Get your backend URL** from Render dashboard (e.g., `https://ooc-backend.onrender.com`)

2. **Update Frontend** - Edit `frontend/script.js` line 3:
   ```javascript
   const API_BASE_URL = 'https://YOUR-BACKEND-NAME.onrender.com';
   ```

3. **Update Backend CORS** - Add your frontend URL to environment variables:
   - Go to Backend service → Environment
   - Set `FRONTEND_URL` = `https://YOUR-FRONTEND-NAME.onrender.com`

4. **Commit and push** - Render will auto-deploy on git push

---

## ✅ Step 5: Test the Deployment

### Test Backend API
```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-25T..."}
```

### Test Payment Flow
1. Open your frontend URL
2. Go to "Donate" section
3. Enter test details:
   - Name: Test User
   - Amount: ₹100
4. Click "Donate via Razorpay"
5. Use Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - OTP: `1234` (for test mode)

---

## 🔧 Troubleshooting

### Backend takes time to respond (Cold Start)
- **Free tier limitation**: Render free tier services sleep after 15 minutes of inactivity
- **Solution**: The frontend already includes retry logic for waking up the backend
- **Upgrade**: Consider Starter plan ($7/month) for always-on services

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in backend environment
- The backend already allows `*.onrender.com` domains

### Payment fails with "Unable to create order"
- Check Razorpay keys are correct in environment variables
- Verify keys match the mode (test keys for test, live keys for production)
- Check Render logs: Dashboard → Your Service → Logs

### Razorpay Checkout Not Opening
- Ensure the Razorpay script is loaded in `index.html`
- Check browser console for JavaScript errors

---

## 📊 Environment Variables Summary

### Backend Service
| Variable | Required | Description |
|----------|----------|-------------|
| `RAZORPAY_KEY_ID` | ✅ Yes | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | ✅ Yes | Razorpay private key |
| `RAZORPAY_WEBHOOK_SECRET` | ❌ No | For webhook verification |
| `FRONTEND_URL` | ✅ Yes | Frontend URL for CORS |
| `NODE_ENV` | ❌ No | Set to `production` |
| `PORT` | ❌ No | Auto-set by Render |

---

## 🔒 Security Checklist

- [ ] Never commit `.env` file to git
- [ ] Use environment variables for all secrets
- [ ] Use **test keys** during development
- [ ] Switch to **live keys** only in production
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set up webhook secret for payment verification

---

## 📁 Project Structure for Render

```
OOC-Project-2/
├── render.yaml          # Blueprint for both services
├── backend/
│   ├── server.js        # Express API server
│   ├── package.json     # Node dependencies
│   ├── render.yaml      # Backend-specific config (optional)
│   └── .env.example     # Example environment variables
└── frontend/
    ├── index.html       # Main HTML file
    ├── script.js        # Frontend JS (update API_BASE_URL)
    ├── style.css        # Styles
    └── ...
```

---

## 🎉 You're Done!

Your application should now be live on Render.com with working Razorpay payments!

**Your URLs:**
- Frontend: `https://ooc-frontend.onrender.com`
- Backend: `https://ooc-backend.onrender.com`
- Health Check: `https://ooc-backend.onrender.com/api/health`

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

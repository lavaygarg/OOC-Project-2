# OOC Project - Hope Foundation

This project is split into two parts for separate deployment:

## 📁 Project Structure

```
OOC-Project/
├── backend/          # Node.js API Server (Deploy on Render.com)
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/         # Static Website (Deploy on Netlify)
    ├── index.html
    ├── script.js
    ├── style.css
    ├── netlify.toml
    ├── images/
    ├── data/
    └── portals/
```

## 🚀 Deployment Guide

### Backend (Render.com)

1. Go to [Render.com](https://render.com) and create a new Web Service
2. Connect your GitHub repo
3. Set the **Root Directory** to `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables:
   - `RAZORPAY_KEY_ID` - Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET` - Your Razorpay Secret Key
   - `RAZORPAY_WEBHOOK_SECRET` - Webhook secret (optional)
   - `FRONTEND_URL` - Your Netlify URL (e.g., https://yoursite.netlify.app)

### Frontend (Netlify)

1. Go to [Netlify](https://netlify.com) and create a new site
2. Connect your GitHub repo
3. Set the **Base Directory** to `frontend`
4. Publish Directory: `frontend`
5. No build command needed (static site)
6. After deployment, update `API_BASE_URL` in `frontend/script.js` with your Render URL

## ⚙️ Environment Variables

### Backend (.env)
```
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
FRONTEND_URL=https://your-site.netlify.app
PORT=3000
```

### Frontend (script.js)
Update line 3:
```javascript
const API_BASE_URL = 'https://your-backend.onrender.com';
```

## 🔧 Local Development

### Backend
```bash
cd backend
npm install
# Create .env file with your credentials
npm run dev
```

### Frontend
```bash
cd frontend
# Use Live Server or any static file server
npx serve .
```

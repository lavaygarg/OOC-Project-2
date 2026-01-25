# 🤝 Hope Foundation - OOC Project

> A modern, full-stack web application for managing donations, events, volunteering, and community outreach with **integrated Razorpay payment gateway** for seamless fund collection.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-success)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7)](https://render.com)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

**Hope Foundation** is a comprehensive non-profit management platform designed to empower underprivileged communities through education, healthcare, and nutrition programs. The platform enables seamless donation processing, volunteer coordination, event management, and impact tracking.

### Key Highlights
- 💰 **Razorpay Integration** - Secure online donation processing (Cards, UPI, Bank Transfer)
- 🛡️ **Enterprise Security** - JWT authentication, encryption, rate limiting, XSS/NoSQL injection protection
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- 🌐 **Multi-language Support** - English and Hindi translations
- 🎨 **Dark Mode** - User-friendly theme toggle
- 📊 **Admin Dashboard** - Real-time analytics and fund management
- 👥 **Role-Based Access** - Admin, Staff, and User portals

---

## ✨ Features

### 🎁 For Donors
- **One-click Donations** - Seamless payment via Razorpay
- **Donation History** - Track all contributions
- **Tax Receipt** - Automatic receipt generation
- **Multiple Payment Methods** - Cards, UPI, Net Banking

### 👨‍💼 For Admin & Staff
- **Dashboard Analytics** - Real-time donation and disbursement tracking
- **Event Management** - Create and manage community events
- **Volunteer Management** - Track volunteer registrations and activities
- **Fund Disbursement** - Monitor scholarship and relief distributions
- **Message Center** - Communicate with donors and volunteers
- **Institution Management** - Manage partner schools and organizations

### 🌟 Additional Features
- Multi-language support (English/Hindi)
- Dark mode theme
- Mobile responsive design
- Testimonials showcase
- Event gallery
- Impact statistics
- Contact & support system

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **Razorpay SDK** | Payment processing |
| **JWT** | Authentication & authorization |
| **bcryptjs** | Password hashing |
| **Helmet** | Security headers |
| **Express Rate Limiter** | API rate limiting |
| **Cors** | Cross-origin requests |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure |
| **CSS3** | Styling (with responsive design) |
| **Vanilla JavaScript** | Interactivity |
| **Razorpay Checkout** | Payment UI |
| **Font Awesome** | Icons |
| **Google Fonts** | Typography |

### Deployment
| Service | Component |
|---------|-----------|
| **Render.com** | Backend API hosting |
| **Netlify** | Frontend static hosting |
| **MongoDB Atlas** | Database hosting |
| **Razorpay** | Payment gateway |

---

## 📁 Project Structure

```
OOC-Project-2/
├── 📄 README.md                    # Project documentation
├── 📄 DEPLOYMENT_RENDER.md         # Detailed deployment guide
├── 📄 render.yaml                  # Infrastructure as Code
│
├── 🔧 backend/                     # Node.js API Server
│   ├── 📄 server.js                # Express app initialization
│   ├── 📄 package.json             # Dependencies & scripts
│   ├── 📄 seed.js                  # Database seed data
│   ├── 📄 .env.example             # Environment template
│   │
│   ├── 📂 config/
│   │   └── database.js             # MongoDB connection
│   │
│   ├── 📂 models/                  # Database schemas
│   │   ├── Donation.js
│   │   ├── Disbursement.js
│   │   ├── Event.js
│   │   ├── Institution.js
│   │   ├── Message.js
│   │   ├── Staff.js
│   │   └── Volunteer.js
│   │
│   ├── 📂 routes/                  # API endpoints
│   │   ├── donations.js
│   │   ├── disbursements.js
│   │   ├── events.js
│   │   ├── institutions.js
│   │   ├── messages.js
│   │   ├── staff.js
│   │   └── volunteers.js
│   │
│   └── 📂 middleware/              # Express middleware
│       ├── auth.js                 # JWT authentication
│       ├── rateLimiter.js          # Rate limiting
│       └── validation.js           # Input validation
│
└── 🌐 frontend/                    # Static website
    ├── 📄 index.html               # Main page
    ├── 📄 script.js                # Application logic (3000+ lines)
    ├── 📄 style.css                # Responsive styling
    ├── 📄 netlify.toml             # Netlify config
    ├── 📄 vercel.json              # Vercel config
    │
    ├── 📂 data/
    │   └── ngo-data.json           # Static organization data
    │
    ├── 📂 images/                  # Media assets
    │
    └── 📂 portals/                 # Authenticated dashboards
        ├── index.html              # Portal login
        ├── user.html               # User dashboard
        ├── admin.html              # Admin dashboard
        ├── staff.html              # Staff portal
        ├── user-dashboard.html     # User profile
        ├── staff-portal.js         # Portal logic
        └── staff-portal.css        # Portal styling
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
- **Git** ([Download](https://git-scm.com/))
- **Razorpay Account** ([Sign up](https://razorpay.com)) - Get free test keys

### Installation & Local Development

#### 1️⃣ Clone Repository
```bash
git clone <your-repo-url>
cd OOC-Project-2
```

#### 2️⃣ Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# RAZORPAY_KEY_ID=rzp_test_xxxx
# RAZORPAY_KEY_SECRET=your_secret
# MONGODB_URI=mongodb://localhost:27017/ooc-project
# FRONTEND_URL=http://localhost:5500

# Start development server (requires nodemon)
npm run dev

# Or start production server
npm start

# Backend runs at: http://localhost:3000
```

#### 3️⃣ Frontend Setup
```bash
cd frontend

# Option A: Use Live Server extension in VS Code
# Right-click index.html → Open with Live Server

# Option B: Use local server
npx serve .

# Frontend runs at: http://localhost:3000 or http://localhost:5500
```

#### 4️⃣ Access the Application
- 🏠 **Public Site**: [http://localhost:5500](http://localhost:5500)
- 🔐 **Admin Portal**: [http://localhost:5500/portals/admin.html](http://localhost:5500/portals/admin.html)
- 👥 **Staff Portal**: [http://localhost:5500/portals/staff.html](http://localhost:5500/portals/staff.html)
- 👤 **User Dashboard**: [http://localhost:5500/portals/user.html](http://localhost:5500/portals/user.html)

---

## 📡 API Documentation

### Base URL
```
Production: https://ooc-backend.onrender.com/api
Development: http://localhost:3000/api
```

### Core Endpoints

#### 💰 Donations
```bash
GET    /donations              # Get all donations
GET    /donations/stats        # Get donation statistics
POST   /donations              # Create new donation (auth required)
GET    /donations/:id          # Get specific donation
PUT    /donations/:id          # Update donation (auth required)
DELETE /donations/:id          # Delete donation (admin only)
```

**Request Example:**
```json
POST /donations
{
  "donorName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "amount": 5000,
  "method": "card",
  "message": "Support education"
}
```

#### 👥 Volunteers
```bash
GET    /volunteers             # Get all volunteers
POST   /volunteers             # Register new volunteer
GET    /volunteers/:id         # Get volunteer details
PUT    /volunteers/:id         # Update volunteer
DELETE /volunteers/:id         # Delete volunteer (admin)
```

#### 📅 Events
```bash
GET    /events                 # Get all events
POST   /events                 # Create event (staff/admin)
GET    /events/:id             # Get event details
PUT    /events/:id             # Update event (staff/admin)
DELETE /events/:id             # Delete event (admin)
```

#### 💸 Disbursements
```bash
GET    /disbursements          # Get all disbursements
POST   /disbursements          # Record disbursement (admin)
GET    /disbursements/stats    # Get disbursement stats
```

#### 🏢 Institutions
```bash
GET    /institutions           # Get all partner institutions
POST   /institutions           # Create institution (admin)
GET    /institutions/:id       # Get institution details
```

#### 📧 Messages
```bash
GET    /messages               # Get all messages
POST   /messages               # Send message
DELETE /messages/:id           # Delete message (admin)
```

#### 👨‍💼 Staff
```bash
POST   /staff/login            # Staff login (returns JWT)
POST   /staff/register         # Register staff (admin only)
GET    /staff/:id              # Get staff details
```

**Authentication:**
Include JWT token in headers:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🛡️ Security Features

### 🔒 Implemented Security Measures

1. **Authentication & Authorization**
   - JWT (JSON Web Tokens) for API authentication
   - Role-based access control (Admin, Staff, User)
   - Secure password hashing with bcryptjs

2. **Data Protection**
   - **XSS Prevention** - HTML escaping and input sanitization
   - **NoSQL Injection Prevention** - MongoDB sanitization
   - **CSRF Protection** - Helmet.js security headers
   - **Password Hashing** - bcryptjs with salt rounds

3. **API Security**
   - **Rate Limiting** - Prevents brute force attacks
   - **CORS Configuration** - Restricts cross-origin requests
   - **Security Headers** - Content-Security-Policy, X-Frame-Options, etc.
   - **HPP Protection** - HTTP Parameter Pollution prevention
   - **Input Validation** - Strict validation middleware

4. **Payment Security**
   - **Razorpay Encryption** - Industry-standard payment processing
   - **Webhook Verification** - Secure payment confirmation
   - **API Keys in Environment** - Never hardcoded credentials

5. **Database Security**
   - **MongoDB Connection Encryption** - SSL/TLS for Atlas
   - **Query Sanitization** - Protection against NoSQL injection

### 🔐 Best Practices
- ✅ Use environment variables for all secrets
- ✅ HTTPS enforced in production
- ✅ Test mode keys for development, live keys for production
- ✅ Regular security audits recommended
- ✅ Never commit `.env` file to version control

---

## 📦 Deployment

### Deployment Architecture
```
┌─────────────┐                ┌──────────────────┐
│   GitHub    │────webhooks───▶│  Render.com      │
│  Repository │                │  (Backend API)   │
└─────────────┘                └──────────────────┘
       │                               │
       │                         ┌─────┴────────┐
       │                         │              │
       ▼                         ▼              ▼
    ┌─────────┐          ┌──────────────┐  ┌────────┐
    │ Netlify │          │ MongoDB Atlas│  │Razorpay│
    │(Frontend)          │  (Database)  │  │(Payment)
    └─────────┘          └──────────────┘  └────────┘
```

### 🟨 Deploy to Render.com (Recommended)

#### Backend Deployment
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ooc-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   RAZORPAY_WEBHOOK_SECRET=webhook_secret (optional)
   FRONTEND_URL=https://your-frontend.netlify.app
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   ```
6. Click **"Create Web Service"**

#### Frontend Deployment
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your repository
4. Configure:
   - **Name**: `ooc-frontend`
   - **Root Directory**: `frontend`
   - **Publish Directory**: `.`
5. Update `frontend/script.js` line 3:
   ```javascript
   const API_BASE_URL = 'https://ooc-backend.onrender.com';
   ```

### 🌐 Deploy to Netlify (Alternative for Frontend)

1. Go to [Netlify](https://netlify.com)
2. Click **"New site from Git"**
3. Connect GitHub repository
4. Configure:
   - **Base Directory**: `frontend`
   - **Publish Directory**: `frontend`
   - **No build command needed**
5. Deploy!

### ⚙️ Using Blueprint (Infrastructure as Code)

The `render.yaml` file automates deployment:
```bash
# Render automatically reads render.yaml
# Deploy by connecting your GitHub repo to Render Blueprints
```

See [DEPLOYMENT_RENDER.md](DEPLOYMENT_RENDER.md) for detailed step-by-step guide.

---

## 🌐 Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ooc-project

# Payment Gateway
RAZORPAY_KEY_ID=rzp_test_1234567890
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=webhook_secret_optional

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5500

# Server
NODE_ENV=development
PORT=3000
```

### Frontend (script.js - Line 3)
```javascript
const API_BASE_URL = 'http://localhost:3000';  // Development
// const API_BASE_URL = 'https://ooc-backend.onrender.com';  // Production
```

---

## 🧪 Testing Payment Gateway

### Using Razorpay Test Mode

**Test Card Details:**
```
Card Number: 4111 1111 1111 1111
Expiry Date: 12/30 (Any future date)
CVV: 123 (Any 3 digits)
Name: Test User
OTP: 1234 (For test mode)
```

**Test UPI:**
```
UPI ID: success@orazorpay
OTP: 123456
```

### Steps to Test
1. Go to **Donate** section
2. Enter donation amount (minimum ₹1)
3. Click **"Donate via Razorpay"**
4. Use test card details above
5. Complete payment
6. Check Admin Dashboard for recorded donation

---

## 🔧 Troubleshooting

### ❌ Common Issues & Solutions

#### 1. **Backend won't start**
```bash
# Check Node version
node --version  # Should be 18+

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if port 3000 is available
# Kill any process using port 3000
```

#### 2. **CORS errors**
```javascript
// Ensure FRONTEND_URL is set correctly in .env
FRONTEND_URL=http://localhost:5500

// Frontend script.js API_BASE_URL must match backend URL
const API_BASE_URL = 'http://localhost:3000';
```

#### 3. **MongoDB connection fails**
```bash
# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/ooc-project

# For MongoDB Atlas:
# 1. Whitelist your IP in Atlas
# 2. Use correct username:password
# 3. Check cluster name and database name
```

#### 4. **Razorpay payment fails**
- Verify API keys are correct (test vs. live)
- Check browser console for errors
- Ensure payment amount is ≥ ₹1
- Test mode keys start with `rzp_test_`

#### 5. **Cold start delay (Free Tier Render)**
- Free tier services sleep after 15 minutes
- First request takes 30-60 seconds to wake up
- Consider upgrading to Starter plan ($7/month)

#### 6. **Donation not appearing in dashboard**
- Check browser console for errors
- Verify backend is running
- Check database connection
- Review server logs: `Render → Your Service → Logs`

### 📋 Debug Checklist
- [ ] Is backend running? (`http://localhost:3000/api/health`)
- [ ] Is frontend running? (`http://localhost:5500`)
- [ ] MongoDB connected? (Check backend console)
- [ ] Razorpay keys valid? (Check .env)
- [ ] FRONTEND_URL correct? (Check backend .env)
- [ ] API_BASE_URL updated? (Check frontend script.js)
- [ ] No CORS errors? (Check browser console)

---

## 📊 API Response Examples

### Successful Donation Response
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "donorName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "amount": 5000,
  "method": "card",
  "razorpayOrderId": "order_1234567890",
  "razorpayPaymentId": "pay_1234567890",
  "status": "completed",
  "message": "Support education",
  "createdAt": "2024-01-25T10:30:00.000Z",
  "updatedAt": "2024-01-25T10:30:00.000Z"
}
```

### Error Response
```json
{
  "error": "Failed to process payment",
  "detail": "Razorpay API error",
  "statusCode": 500
}
```

---

## 📚 Resources

- 📖 [Express.js Documentation](https://expressjs.com/)
- 🗄️ [MongoDB Docs](https://docs.mongodb.com/)
- 💳 [Razorpay API Docs](https://razorpay.com/docs/api/)
- 🚀 [Render Deployment Guide](https://render.com/docs)
- 🔒 [OWASP Security Best Practices](https://owasp.org/)

---

## 📝 License

This project is licensed under the **MIT License** - see LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use descriptive variable names
- Add comments for complex logic
- Follow ES6+ standards
- Test before submitting PR

---

## 📞 Support & Contact

- 📧 **Email**: support@hopefoundation.org
- 🌐 **Website**: [hopefoundation.org](https://hopefoundation.org)
- 💬 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

## 🙏 Acknowledgments

- Razorpay for payment processing
- Render.com for hosting
- MongoDB for database
- The open-source community

---

## ⭐ Show Your Support

If you find this project helpful, please give it a star! ⭐

```
Made with ❤️ for the Hope Foundation community
```

# Hope Foundation
### Empowering Underprivileged Children Through Education, Nutrition, and Healthcare

🌍 **Live Demo:** [hopefoundation.onrender.com](https://hopefoundation.onrender.com)

---

## Overview

Hope Foundation is a production-ready full-stack NGO management platform that addresses a critical gap in non-profit operations: managing donations transparently, coordinating volunteers efficiently, and maintaining secure records.

Built from the ground up with security and usability at its core, this platform serves as a bridge between donors, volunteers, and administrators—ensuring every resource reaches the children who need it most.

---

## Key Features

### 🌏 Public Interface
- **Dynamic landing page** with hero section and impact metrics
- **Program showcase** highlighting Education, Nutrition, and Healthcare initiatives
- **Media gallery** with masonry-style layout of on-ground activities
- **Events calendar** with upcoming drives and registration
- **Impact stories** featuring real testimonials
- **Bilingual support** (English/Hindi) with instant toggle
- **Dark/Light theme** for accessibility
- **Contact form** integrated with backend message system

### 💳 Donation System
- **Razorpay integration** supporting Credit Card, NetBanking, and UPI
- **Order creation → Payment → Webhook verification** complete flow
- **Digital receipts** generated instantly
- **Donation history** visible on impact page
- **80G tax exemption** certificate generation (simulated)

### 🤝 Volunteer Management
- **Online application** form with skills and availability tracking
- **Dedicated portal** for volunteers with:
  - Personal dashboard with assigned tasks
  - Event registration and RSVP
  - Service hours logging for certification

### 🛡️ Admin & Staff Portals
- **Role-based access control** (Admin, Staff, Manager, HR)
- **Two-factor authentication** (TOTP) for admin operations
- **Account lockout** after failed login attempts
- **Security event logging** with email alerts
- **Analytics dashboard** with Chart.js visualizations:
  - Monthly/yearly donation trends
  - Active volunteer counts
  - Fund distribution across programs
- **Entity management**:
  - Donations: transaction logs, filters, export reports
  - Volunteers: approve/reject applications, assign roles
  - Staff: HR registry management
  - Institutions: partner school/orphanage relationships
  - Disbursements: complete fund utilization tracking
- **Unified messaging system** with live updates (SSE)

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | HTML5, CSS3 (Custom Variables), Vanilla JavaScript (ES6+), Chart.js |
| **Backend** | Node.js v18+, Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | JWT (HTTP-only cookies), bcryptjs, speakeasy (TOTP 2FA) |
| **Security** | helmet, cors, hpp, express-rate-limit, express-mongo-sanitize, xss-clean, validator |
| **Payments** | Razorpay SDK (Orders + Webhooks) |
| **Notifications** | Nodemailer (Security alerts) |
| **Deployment** | Render (Blueprint architecture) |

---

## Project Structure

```
OOC-Project-2/
├── backend/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT + role verification
│   │   ├── rateLimiter.js           # Route-specific rate limits
│   │   └── validation.js            # Input sanitization
│   ├── models/                      # Mongoose schemas
│   │   ├── Donation.js
│   │   ├── Disbursement.js
│   │   ├── Event.js
│   │   ├── Institution.js
│   │   ├── Message.js
│   │   ├── PortalMessage.js
│   │   ├── SecurityEvent.js
│   │   ├── Staff.js
│   │   ├── User.js
│   │   └── Volunteer.js
│   ├── routes/                      # API endpoints
│   │   ├── donations.js
│   │   ├── volunteers.js
│   │   ├── staff.js
│   │   ├── users.js
│   │   └── messages.js
│   ├── utils/
│   │   └── securityAlerts.js        # Email notification system
│   ├── seed.js                      # Database seeding script
│   ├── server.js                    # Application entry point
│   └── .env.example                 # Environment template
│
├── frontend/
│   ├── index.html                   # Main public page
│   ├── script.js                    # Frontend logic + API calls
│   ├── style.css                    # Custom CSS system
│   ├── data/
│   │   └── ngo-data.json           # Frontend seed data
│   └── portals/
│       ├── index.html              # Portal chooser
│       ├── admin.html              # Admin login + 2FA
│       ├── staff.html              # Staff portal
│       ├── staff-portal.js         # Staff portal logic
│       ├── staff-portal.css        # Staff portal styles
│       ├── user.html               # User registration/login
│       └── user-dashboard.html     # User portal with messaging
│
├── render.yaml                      # Render Blueprint config
└── DEPLOYMENT_RENDER.md            # Deployment documentation
```

---

## API Endpoints

### Public
- `GET /` - Health check
- `GET /api/health` - API status
- `POST /api/create-order` - Initiate Razorpay order
- `POST /api/verify-payment` - Verify payment signature
- `POST /api/webhook` - Razorpay webhook handler

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/verify-2fa` - Verify TOTP
- `POST /api/users/logout` - Clear session
- `GET /api/users/me` - Get current user
- `POST /api/staff/login` - Staff/admin login
- `POST /api/staff/verify-2fa` - Admin 2FA verification
- `POST /api/staff/logout` - Staff logout
- `GET /api/staff/session-check` - Verify session

### Protected Resources
- **Donations**: Full CRUD + filtering
- **Volunteers**: Application management
- **Events**: Event CRUD + registration
- **Messages**: Contact form submissions
- **Institutions**: Partner management
- **Disbursements**: Fund tracking
- **Staff**: HR registry
- **Portal Messages**: 
  - `GET /api/messages/portal` - Fetch messages
  - `GET /api/messages/portal/stream` - SSE live updates
  - `POST /api/messages/portal` - Send message

---

## Local Development Setup

### Prerequisites
- Node.js 18 or higher
- MongoDB Atlas account
- Razorpay test account

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - MONGODB_URI
# - JWT_SECRET
# - RAZORPAY_KEY_ID
# - RAZORPAY_KEY_SECRET
# - FRONTEND_URL=http://localhost:5500

# Seed the database (optional)
node seed.js

# Start development server
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Serve with any static server
# Option 1: VS Code Live Server (port 5500)
# Option 2: Python
python -m http.server 5500

# Option 3: Node serve
npx serve -p 5500
```

Frontend runs on `http://localhost:5500`

**Important:** The `script.js` file auto-detects localhost and points to `http://localhost:3000` for API calls.

---


## Database Seeding

The seed script creates default accounts and sample data:

```bash
cd backend
node seed.js
```

**Creates:**
- Admin account (from env: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_TOTP_SECRET`)
- Staff accounts (Manager, HR, Standard)
- Sample volunteers, donations, events, institutions, disbursements

---

## Security Features

### Authentication & Authorization
- JWT-based sessions with HTTP-only cookies
- Role-based access control (Admin, Manager, Staff, HR, User)
- TOTP two-factor authentication for admin operations
- Password hashing with bcryptjs (10 rounds)

### Attack Prevention
- Rate limiting on all `/api/*` endpoints
- NoSQL injection protection (`express-mongo-sanitize`)
- XSS attack prevention (`xss-clean`)
- HTTP parameter pollution protection (`hpp`)
- Secure HTTP headers (`helmet`)
- Strict CORS configuration

### Monitoring & Alerts
- Account lockout after failed attempts
- Security event audit trail
- Email alerts for suspicious activity
- Session validation on protected routes

---

## Deployment

### Render Blueprint

This project uses Render Blueprint for one-click deployment:

1. Fork this repository
2. Connect to Render
3. Deploy using `render.yaml`

See `DEPLOYMENT_RENDER.md` for detailed instructions.

### Manual Deployment

1. Set up MongoDB Atlas cluster
2. Configure Razorpay production keys
3. Set environment variables in hosting platform
4. Deploy backend as web service
5. Deploy frontend as static site
6. Update `FRONTEND_URL` and `FRONTEND_URLS` in backend env

---

## Future Roadmap

- [ ] **Email automation**: Monthly impact newsletters for donors
- [ ] **AI chatbot**: Instant query resolution using NLP
- [ ] **Blockchain ledger**: Immutable proof of fund utilization
- [ ] **Mobile app**: React Native companion app
- [ ] **Analytics dashboard**: Advanced reporting with filters and exports
- [ ] **Multi-language support**: Expand beyond English/Hindi

---

## Team

| Name | Role |
|------|------|
| **Riya Ghoshi** | Frontend Developer |
| **Lavay Garg** | Full Stack Developer & Cybersecurity Expert |
| **Jatin** | Frontend Developer & UI/UX Designer |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*"We make a living by what we get, but we make a life by what we give."* — Winston Churchill
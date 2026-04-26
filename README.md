# Hope Foundation

### Empowering Underprivileged Children Through Education, Nutrition, and Healthcare

🌍 **Live Demo:** [hopefoundation.onrender.com](https://hopefoundation.onrender.com)  
📦 **Repository:** [github.com/lavaygarg/Hope-Foundation](https://github.com/lavaygarg/Hope-Foundation)

---

## Overview

Hope Foundation is a production-ready full-stack NGO management platform that addresses a critical gap in non-profit operations: managing donations transparently, coordinating volunteers efficiently, and maintaining secure records.

Built from the ground up with security and usability at its core, this platform serves as a bridge between donors, volunteers, and administrators — ensuring every resource reaches the children who need it most.

The platform features a rich public-facing website with bilingual support (English / Hindi), a Razorpay-powered donation system, real-time internal messaging via Server-Sent Events (SSE), and multi-portal dashboards for users, staff, and administrators — all secured with JWT authentication and TOTP two-factor verification.

---

## Key Features

### 🌏 Public Interface
- **Dynamic landing page** with hero section, animated impact counters, and mission statement
- **Program showcase** highlighting Education, Nutrition, Healthcare, Skill Development, and Mentorship initiatives
- **Media gallery** with masonry-style layout of on-ground activity photos
- **Events hub** with three tabs — Upcoming Events (live from API), Past Prayas Events gallery, and Newsletter archive with subscription
- **Impact dashboard** with KPI cards, program utilization metrics, and live institution allocation grid
- **Impact stories** featuring real testimonials
- **Bilingual support** (English / Hindi) with instant toggle
- **Dark / Light theme** with system-preference detection
- **Contact form** integrated with the backend message system
- **Responsive design** with mobile hamburger menu

### 💳 Donation System
- **Razorpay integration** supporting UPI, Credit/Debit Card, and NetBanking
- **Complete payment flow:** Order creation → Checkout → Signature verification → Webhook confirmation
- **Two order endpoints** — `/api/create-order` (paise) and `/api/razorpay/create-order` (rupees with auto-conversion)
- **Digital receipts** generated instantly after successful payment
- **QR code** payment option displayed on the donate page
- **Donation history** and stats visible on the impact page
- **80G tax exemption** certificate generation (simulated)

### 🤝 Volunteer Management
- **Public application form** with name, email, phone, interest selection, and message
- **Interest categories:** Teaching, Fundraising, Healthcare, Event Management, Admin Support, Photography, Tech, Logistics, Social Media
- **Application workflow:** Submit → Pending → Approved/Rejected by staff
- **Rate limited** to 3 applications per IP per 24 hours to prevent abuse

### 👤 User Portal
- **Self-service registration** with mandatory TOTP 2FA enrollment (QR code provided on signup)
- **Two-factor login flow:** Email/password → TOTP verification → JWT session
- **Personal dashboard** with profile information and portal messaging
- **Real-time messaging** with staff and admin via SSE-powered chat

### 🛡️ Admin & Staff Portals
- **Role-based access control** with three roles: `admin`, `staff`, `manager`
- **Two-factor authentication** (TOTP via Google Authenticator / Authy) mandatory for admin login
- **Account lockout** after configurable failed login attempts (default: 5 attempts → 30-minute lock)
- **Security event audit trail** — every login attempt, 2FA challenge, and lockout is logged
- **Email alerts** via Nodemailer for suspicious admin activity (new IP/device detection, account lockouts)
- **Analytics dashboard** with Chart.js visualizations:
  - Monthly/yearly donation trends
  - Active volunteer counts
  - Fund distribution across programs
- **Entity management:**
  - **Donations** — transaction logs, filtering by status/method/date range, aggregated stats
  - **Volunteers** — approve/reject applications, filter by status/interest
  - **Staff** — register new staff (admin-only), update roles, change passwords, delete accounts
  - **Institutions** — partner school/center management with sector-wise allocation tracking
  - **Disbursements** — fund utilization records with category breakdowns and approval tracking
  - **Events** — full CRUD with participant registration and capacity limits
  - **Messages** — contact form inbox with read/unread/replied status and reply functionality
- **Unified messaging system** — real-time SSE-based portal messaging between users, staff, and admin with audience-targeted delivery (`all`, `role:`, `user:`, `dept:`)

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | HTML5, CSS3 (Custom Properties + Dark Mode), Vanilla JavaScript (ES6+), Chart.js, Font Awesome 6 |
| **Backend** | Node.js ≥ 18, Express.js 4 |
| **Database** | MongoDB Atlas (database: `hope-foundation`), Mongoose 9 ODM |
| **Authentication** | JWT (HTTP-only cookies + Bearer tokens), bcryptjs, speakeasy (TOTP 2FA), qrcode |
| **Security** | helmet, cors, hpp, express-rate-limit, express-mongo-sanitize, xss-clean, validator |
| **Payments** | Razorpay SDK (Orders + Signature Verification + Webhooks) |
| **Notifications** | Nodemailer (SMTP-based security alert emails) |
| **Real-time** | Server-Sent Events (SSE) for portal messaging |
| **Deployment** | Render (Blueprint architecture — Web Service + Static Site) |

---

## Project Structure

```
Hope-Foundation/
├── backend/
│   ├── config/
│   │   └── database.js                # MongoDB Atlas connection with TLS
│   ├── middleware/
│   │   ├── auth.js                    # JWT verification, role guards (admin, staff, manager)
│   │   ├── rateLimiter.js             # 6 route-specific rate limiters
│   │   └── validation.js              # Input sanitization + validation middleware
│   ├── models/
│   │   ├── Disbursement.js            # Fund utilization records
│   │   ├── Donation.js                # Donor transactions with payment IDs
│   │   ├── Event.js                   # Events with registration capacity
│   │   ├── Institution.js             # Partner schools/centers with allocation %
│   │   ├── Message.js                 # Contact form submissions
│   │   ├── PortalMessage.js           # Real-time portal messages (SSE)
│   │   ├── SecurityEvent.js           # Audit trail for auth events
│   │   ├── Staff.js                   # Staff accounts with 2FA + lockout fields
│   │   ├── User.js                    # Public user accounts with mandatory 2FA
│   │   └── Volunteer.js               # Volunteer applications
│   ├── routes/
│   │   ├── disbursements.js           # Disbursement CRUD + stats
│   │   ├── donations.js               # Donation CRUD + stats + filtering
│   │   ├── events.js                  # Event CRUD + public registration
│   │   ├── institutions.js            # Institution CRUD + stats
│   │   ├── messages.js                # Contact messages + portal SSE messaging
│   │   ├── staff.js                   # Staff auth (login/2FA/lockout) + CRUD
│   │   ├── users.js                   # User registration/login with 2FA
│   │   └── volunteers.js              # Volunteer application + management
│   ├── utils/
│   │   └── securityAlerts.js          # SMTP email notification system
│   ├── .env.example                   # Environment variable template
│   ├── .gitignore
│   ├── package.json
│   ├── render.yaml                    # Backend-specific Render config
│   ├── seed.js                        # Database seeding script
│   └── server.js                      # Application entry point + Razorpay routes
│
├── frontend/
│   ├── .well-known/
│   │   └── security.txt               # Security disclosure policy
│   ├── data/
│   │   └── ngo-data.json              # Frontend seed data (programs, testimonials)
│   ├── images/                        # Local assets (logo, gallery photos, QR code)
│   │   ├── logo.jpeg
│   │   ├── QR.jpeg
│   │   ├── bg.jpeg
│   │   └── photo_1–7.*               # Gallery images
│   ├── portals/
│   │   ├── index.html                 # Portal chooser (Admin / Staff / User)
│   │   ├── admin.html                 # Admin login + 2FA setup/verification
│   │   ├── staff.html                 # Staff portal shell
│   │   ├── staff-portal.js            # Staff dashboard logic + Chart.js
│   │   ├── staff-portal.css           # Staff portal styles
│   │   ├── user.html                  # User registration + login with 2FA
│   │   └── user-dashboard.html        # User portal with messaging
│   ├── .gitignore
│   ├── index.html                     # Main public website (SPA-style sections)
│   ├── script.js                      # Frontend logic, API calls, i18n, theming
│   └── style.css                      # Complete CSS design system with dark mode
│
├── .gitignore                         # Root gitignore
├── DEPLOYMENT_RENDER.md               # Step-by-step Render deployment guide
└── render.yaml                        # Render Blueprint (both services)
```

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check (returns JSON status) |
| `GET` | `/api/health` | API status with timestamp |
| `POST` | `/api/create-order` | Create Razorpay order (amount in paise) |
| `POST` | `/api/razorpay/create-order` | Create Razorpay order (amount in rupees, auto-converts) |
| `POST` | `/api/verify-payment` | Verify Razorpay payment signature |
| `POST` | `/api/webhook` | Razorpay webhook handler (signature-verified) |

### User Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/register` | User registration with 2FA enrollment |
| `POST` | `/api/users/login` | User login (returns temp token for 2FA) |
| `POST` | `/api/users/verify-2fa` | Verify TOTP code and complete login |
| `POST` | `/api/users/logout` | Clear user session cookie |
| `GET` | `/api/users/me` | Get current user profile (authenticated) |

### Staff & Admin Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/staff/login` | Staff/admin login (admin gets 2FA challenge) |
| `POST` | `/api/staff/verify-2fa` | Admin 2FA verification |
| `POST` | `/api/staff/logout` | Clear staff session cookie |
| `GET` | `/api/staff/session-check` | Verify active admin session |
| `GET` | `/api/staff/security-events` | View admin security audit log (admin-only) |

### Donations — `/api/donations`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Staff | List all donations (filterable by status, method, date range) |
| `GET` | `/stats` | Public | Aggregated donation statistics |
| `GET` | `/:id` | Public | Get single donation |
| `POST` | `/` | Rate-limited | Record a new donation |
| `PUT` | `/:id` | Staff | Update donation |
| `DELETE` | `/:id` | Staff | Delete donation |

### Volunteers — `/api/volunteers`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Staff | List all volunteers (filterable by status, interest) |
| `GET` | `/:id` | Public | Get single volunteer |
| `POST` | `/` | Rate-limited | Submit volunteer application |
| `PUT` | `/:id` | Staff | Update volunteer status |
| `DELETE` | `/:id` | Staff | Delete volunteer |

### Events — `/api/events`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Public | List all events (filterable by status, upcoming) |
| `GET` | `/:id` | Public | Get single event |
| `POST` | `/` | Staff | Create event |
| `PUT` | `/:id` | Staff | Update event |
| `POST` | `/:id/register` | Public | Register for event (respects capacity limits) |
| `DELETE` | `/:id` | Staff | Delete event |

### Institutions — `/api/institutions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Public | List all institutions (filterable by sector, status, city) |
| `GET` | `/stats` | Public | Institution statistics by sector |
| `GET` | `/:id` | Public | Get single institution |
| `POST` | `/` | Staff | Create institution |
| `PUT` | `/:id` | Staff | Update institution |
| `DELETE` | `/:id` | Staff | Delete institution |

### Disbursements — `/api/disbursements`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Staff | List all disbursements (filterable by category, status, date) |
| `GET` | `/stats` | Public | Disbursement statistics by category |
| `GET` | `/:id` | Public | Get single disbursement |
| `POST` | `/` | Staff | Create disbursement |
| `PUT` | `/:id` | Staff | Update disbursement |
| `DELETE` | `/:id` | Staff | Delete disbursement |

### Messages — `/api/messages`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Staff | List all contact form messages |
| `GET` | `/stats` | Staff | Message counts (total, unread, replied) |
| `GET` | `/:id` | Public | Get single message |
| `POST` | `/` | Rate-limited | Submit contact form message |
| `PUT` | `/:id` | Staff | Update message status/reply |
| `PUT` | `/:id/read` | Staff | Mark message as read |
| `DELETE` | `/:id` | Staff | Delete message |

### Portal Messaging — `/api/messages/portal`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/portal` | Authenticated | Fetch messages for current user (audience-filtered) |
| `GET` | `/portal/stream` | Authenticated | SSE live stream for real-time message delivery |
| `POST` | `/portal` | Authenticated | Send portal message with recipient targeting |

### Staff Management — `/api/staff`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Admin | List all staff (filterable by role, status) |
| `POST` | `/register` | Admin | Register new staff member |
| `GET` | `/:id` | Authenticated | Get staff profile (self or admin) |
| `PUT` | `/:id` | Admin | Update staff details |
| `PUT` | `/:id/password` | Authenticated | Change password (self or admin) |
| `DELETE` | `/:id` | Admin | Delete staff account |

---

## Local Development Setup

### Prerequisites
- **Node.js** 18 or higher
- **MongoDB Atlas** account (free tier works)
- **Razorpay** test account (for payment testing)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section below)

# Seed the database (creates default accounts + sample data)
node seed.js

# Start development server (uses nodemon for hot-reload)
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Serve with any static server
# Option 1: VS Code Live Server extension (port 5500)
# Option 2: Python
python -m http.server 5500

# Option 3: Node serve
npx serve -p 5500
```

Frontend runs on `http://localhost:5500`

> **Note:** The `script.js` file auto-detects `localhost` and routes API calls to `http://localhost:3000`. No manual configuration is needed for local development.

---

## Environment Variables

Create a `.env` file in the `backend/` directory using `.env.example` as a template:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT token signing |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay public key (`rzp_test_` for testing) |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay private key |
| `RAZORPAY_WEBHOOK_SECRET` | ❌ | For webhook signature verification |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS (e.g., `http://localhost:5500`) |
| `FRONTEND_URLS` | ❌ | Additional comma-separated allowed origins |
| `ADMIN_EMAIL` | ❌ | Admin account email for seeding (default: `admin@hopefoundation.org`) |
| `ADMIN_PASSWORD` | ❌ | Admin account password for seeding |
| `STAFF_EMAIL` | ❌ | Staff account email for seeding |
| `STAFF_PASSWORD` | ❌ | Staff account password for seeding |
| `MANAGER_EMAIL` | ❌ | Manager account email for seeding |
| `MANAGER_PASSWORD` | ❌ | Manager account password for seeding |
| `HR_EMAIL` | ❌ | HR staff account email for seeding |
| `HR_PASSWORD` | ❌ | HR staff account password for seeding |
| `SMTP_HOST` | ❌ | SMTP server for security alert emails |
| `SMTP_PORT` | ❌ | SMTP port (default: 587) |
| `SMTP_USER` | ❌ | SMTP authentication username |
| `SMTP_PASS` | ❌ | SMTP authentication password |
| `ALERT_FROM_EMAIL` | ❌ | Sender address for security alerts |
| `SECURITY_ALERT_EMAIL` | ❌ | Recipient for security alert notifications |
| `ADMIN_MAX_FAILED_ATTEMPTS` | ❌ | Login attempts before lockout (default: 5) |
| `ADMIN_LOCKOUT_MINUTES` | ❌ | Lockout duration in minutes (default: 30) |
| `PORT` | ❌ | Server port (default: 3000, auto-set by Render) |

---

## Database Seeding

The seed script creates default accounts and sample data:

```bash
cd backend
node seed.js
```

**Creates:**
- **Admin account** — role: `admin`, department: Administration
- **Staff account** — role: `staff`, department: Operations
- **Manager account** — role: `manager`, department: Programs
- **HR account** — role: `staff`, department: Human Resources
- **Sample data** — 3 volunteers, 5 donations, 3 disbursements, 4 events, 4 institutions, 2 messages

The seed script is **idempotent** — re-running it syncs existing staff credentials from environment variables and only inserts sample data if collections are empty.

---

## Security Architecture

### Authentication & Authorization
- **Dual JWT token system** — separate cookies for staff (`staffAuthToken`) and users (`userAuthToken`), both HTTP-only with `Secure` and `SameSite` attributes in production
- **Role-based access control** with three staff roles: Admin, Manager, Staff
- **TOTP two-factor authentication** — mandatory for all admin logins and all user registrations, powered by `speakeasy` with QR code enrollment via `qrcode`
- **Password hashing** with bcryptjs (10 salt rounds)
- **Refresh token support** with 30-day expiry for long-lived sessions

### Rate Limiting
| Limiter | Window | Max Requests | Applied To |
|---------|--------|-------------|------------|
| API (general) | 15 min | 100 | All `/api/*` routes |
| Login | 15 min | 5 | Login endpoints (skips successful requests) |
| Registration | 1 hour | 5 | User/staff registration |
| Contact form | 1 hour | 10 | Message submission |
| Donations | 1 hour | 20 | Donation creation |
| Volunteer | 24 hours | 3 | Volunteer application |

### Attack Prevention
- **NoSQL injection protection** — `express-mongo-sanitize` strips `$` and `.` from request data
- **XSS attack prevention** — `xss-clean` sanitizes user input in body, query, and params
- **HTTP parameter pollution** — `hpp` prevents duplicate parameter attacks
- **Secure HTTP headers** — `helmet` sets CSP, HSTS, X-Frame-Options, and more
- **Strict CORS** — explicit origin whitelist in production, permissive localhost in development
- **Input validation** — `validator` library with custom middleware for email, phone, amount, password strength, and MongoDB ObjectId validation
- **Request body size limit** — 10KB maximum to prevent large payload attacks
- **Content Security Policy** — configured in `render.yaml` headers for the static frontend

### Monitoring & Incident Response
- **Security event audit trail** — every auth attempt (success, failure, blocked) logged to `SecurityEvent` collection with IP, user agent, and metadata
- **Account lockout** — configurable threshold and duration; lockout clears failed attempt counter
- **Suspicious login detection** — compares current IP and user agent against previous login; triggers email alert on mismatch
- **SMTP email alerts** — HTML-formatted security notifications with metadata table sent to configured recipients
- **`.well-known/security.txt`** — public security disclosure policy

---

## Deployment

### Render Blueprint (Recommended)

This project uses Render Blueprint for one-click deployment:

1. Fork this repository
2. Connect to [Render Dashboard](https://dashboard.render.com)
3. Create a **New Blueprint** and select the repo
4. Render auto-detects `render.yaml` and creates:
   - **`ooc-backend`** — Node.js web service
   - **`HopeFoundation`** — Static site with security headers
5. Set environment variables in the Render Dashboard

See [`DEPLOYMENT_RENDER.md`](./DEPLOYMENT_RENDER.md) for detailed step-by-step instructions.

### Manual Deployment

1. Set up a MongoDB Atlas cluster
2. Configure Razorpay production keys (`rzp_live_` prefix)
3. Set all environment variables in your hosting platform
4. Deploy backend as a Node.js web service
5. Deploy frontend as a static site
6. Update `FRONTEND_URL` in backend environment to match the deployed frontend URL
7. Configure Razorpay webhook URL to point to `https://your-backend/api/webhook`

### Test Payment Credentials

Use Razorpay test mode for development:

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `1234` |

---

## Future Roadmap

- [ ] **Email automation** — Monthly impact newsletters for donors
- [ ] **AI chatbot** — Instant query resolution using NLP
- [ ] **Blockchain ledger** — Immutable proof of fund utilization
- [ ] **Mobile app** — React Native companion app
- [ ] **Advanced analytics** — Exportable reports with filters and date ranges
- [ ] **Multi-language support** — Expand beyond English/Hindi

---

## Team

| Name | Role |
|------|------|
| **Riya Ghoshi** | Frontend Developer |
| **Lavay Garg** | Full Stack Developer & Cybersecurity Expert |
| **Jatin** | Frontend Developer & UI/UX Designer |
| **Aarchi** | Frontend Developer |

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
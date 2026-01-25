# Hope Foundation  
### *Empowering Underprivileged Children Through Education, Nutrition, and Healthcare*

![Banner Image](https://images.unsplash.com/photo-1488521787991-ed7fe863a665?w=1200&h=400&fit=crop)

---

## 📖 About The Project

**Hope Foundation** is not just a website; it is a full-stack digital ecosystem designed to modernize the operations of non-profit organizations. 

We identified a critical gap in how NGOs operate: managing donations transparency, coordinating volunteers efficiently, and maintaining secure records is often chaotic. This project was conceived and built from the ground up to address these specific challenges.

Our platform serves as a bridge between compassionate donors, dedicated volunteers, and the administration, ensuring that every resource—whether time or money—reaches the children who need it most.

---

## 🌟 Comprehensive Functionality Guide

We have built a feature-rich platform catering to four distinct user groups: Public Visitors, Donors, Volunteers, and Administrators.

### 1. 🌏 Public User Interface (Frontend)
Designed for accessibility and engagement.
*   **Dynamic Landing Page:** Features a hero section with a visual impact summary and quick access to core actions (Donate, Volunteer).
*   **Program Showcase:** Detailed cards displaying various NGO initiatives like Education, Nutrition, and Healthcare.
*   **Media Gallery:** A masonry-style gallery showing real photos of on-ground activities.
*   **Events Calendar:** Upcoming events listing with dates, locations, and descriptions.
*   **Impact Stories:** Real testimonials and success stories to build trust.
*   **Contact & Inquiry:** Integrated contact form for general queries.
*   **Accessibility Features:**
    *   **Bilingual Support (English/Hindi):** Instant content translation toggle for wider reach.
    *   **Dark/Light Mode:** Reduces eye strain and saves battery on mobile devices.

### 2. 💳 Donor Ecosystem
Focused on trust, speed, and security.
*   **Seamless Donation Process:**
    *   One-click donation button accessible from all pages.
    *   Integration with **Razorpay** for secure Credit Card, NetBanking, and UPI transactions.
*   **Transparency & Trust:**
    *   Instant digital receipt generation upon successful payment.
    *   History of recent donations shown on the impact page.
*   **Tax Benefits:** Automated generation of 80G tax exemption certificates (simulated).

### 3. 🤝 Volunteer Management System
Streamlining the workforce.
*   **Digital Recruitment:**
    *   Online application form collecting skills, availability, and interests.
*   **Dedicated Volunteer Portal:**
    *   **Personal Dashboard:** View assigned tasks and upcoming schedules.
    *   **Event Registration:** RSVP for specific NGO drives.
    *   **Hours Tracking:** Log service hours for certification.

### 4. 🛡️ Administration & Operations (Staff Portal)
The backend powerhouse for managing the organization.
*   **Secure Authentication:** Role-based login (RBAC) ensuring only authorized personnel access sensitive data.
*   **Dashboard Analytics:** Visual charts (**Chart.js**) displaying:
    *   Total Donations (Monthly/Yearly).
    *   Active Volunteer Count.
    *   Distribution of funds across programs.
*   **Entity Management Modules:**
    *   **Donation Manager:** View all transaction logs, filter by date, and export reports.
    *   **Volunteer Manager:** Approve/Reject applications and assign roles.
    *   **Staff Registry:** HR management for internal employees.
    *   **Institution Partnering:** Manage relationships with schools and orphanages receiving aid.
    *   **Disbursement Tracker:** Log every rupee spent to ensure financial transparency.
*   **Message Center:** Centralized inbox for website contact form submissions.

### 5. 🔒 Security & Infrastructure
*   **Secure REST API:** Built with **Node.js & Express**, featuring strictly defined routes and controller logic.
*   **Advanced Security:** 
    *   **Helmet.js** for secure HTTP headers.
    *   **Rate Limiting** to prevent brute-force attacks.
    *   **NoSQL Injection Protection** using `express-mongo-sanitize`.
    *   **XSS Protection** mechanisms.
*   **Database:** Scalable **MongoDB** architecture with complex relationships (Donors, Volunteers, Events).

---

## 🛠️ Technology Stack

This project was built using the MERN stack ecosystem, optimized for performance and security.

| Category | Technologies Used |
|----------|-------------------|
| **Frontend** | HTML5, CSS3 (Custom variable system), JavaScript (ES6+), Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Security** | Helmet, HPP, CORS, Express-Rate-Limit, Mongo-Sanitize |
| **Payment** | Razorpay SDK |
| **Deployment** | Render (Backend), Netlify (Frontend) |

---

## 📁 Project Architecture

The codebase is structured for scalability and separation of concerns:

```
OOC-Project-2/
├── backend/                  # The API Heart
│   ├── config/              # Database connections
│   ├── middleware/          # Auth, Validation, Rate Limiters
│   ├── models/              # Mongoose Schemas (Donation, User, Event)
│   ├── routes/              # API Endpoints
│   └── server.js            # Entry point
│
└── frontend/                 # The User Interface
    ├── portals/             # Dashboards (Admin, Staff, User)
    ├── data/                # Static data resources
    ├── style.css            # Custom CSS system
    └── script.js            # Frontend logic & API consumption
```

---

## 🚀 Getting Started (Local Setup)

Follow these steps to run the complete system locally for development.

### Prerequisites
*   Node.js (v14 or higher)
*   MongoDB Account (Atlas)
*   Razorpay Test Account

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure Environment
# Create a .env file and add details (See .env.example)

# Start the Server
npm run dev
```

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Simply serve the static files
# You can use Live Server (VS Code) or:
npx serve .
```

*Note: Update the `API_BASE_URL` in `frontend/script.js` to `http://localhost:3000` when running locally.*

---

## 🔮 Future Roadmap

We are constantly working to improve this platform. Upcoming features include:
*   **Automated Email Reports**: Monthly impact newsletters for donors.
*   **Chatbot Integration**: AI-driven support for instant queries.
*   **Blockchain Ledger**: For immutable proof of fund utilization.

---

## 👥 Team Members

This project was passionately developed by:
*   **Riya Ghoshi** - *Frontend Developer*
*   **Lavay Garg** - *Full Stack Developer*
*   **Jatin** - *UI and UX Designer*
*   **Bhaskar Sarate** - *Full Stack Developer*

---

## 🤝 Contribution

This project is the result of dedicated teamwork. We welcome contributions to help us make a bigger impact.

---

*“We make a living by what we get, but we make a life by what we give.”*

Based on **OOC Project Guidelines** | Created by **[Pathway]**
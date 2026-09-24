# Campus Placement Automation System

A modern, full-stack **Campus Placement Automation System** built with **Node.js (Express)**, **React.js**, and **MySQL / Built-in SQLite**.  
It automates end-to-end college placements: students can explore campus drives, apply with one click, and track their application status, while administrators and recruiters can post job openings, monitor placement metrics, and shortlist candidates.

---

## 🚀 Tech Stack

- **Frontend:** React 18, React Router v6, Axios, Modern Vanilla CSS Design System
- **Backend:** Node.js, Express 5, JWT Authentication, bcryptjs, CORS, dotenv
- **Database:** MySQL (production/local) with automatic built-in zero-config SQLite fallback
- **Schema:** Pre-configured SQL schema and auto-migration script

---

## 📂 Project Structure

```
Campus-Placement-Automation-System/
│
├── backend/
│   ├── config/
│   │   └── db.js            # Smart hybrid DB connector (MySQL + auto SQLite fallback)
│   ├── controllers/         # Business logic controllers
│   ├── middleware/          # JWT auth & role authorization middleware
│   ├── routes/              # Auth, Jobs, Applications, and Admin routes
│   ├── .env                 # Environment configuration
│   ├── server.js            # Express API server entry point
│   └── package.json
│
├── frontend/
│   ├── public/              # Static HTML & assets
│   ├── src/
│   │   ├── components/      # JobList & interactive application tracking
│   │   ├── pages/           # AdminDashboard, Login, Signup
│   │   ├── services/        # Axios API client with auth interceptor
│   │   ├── App.js           # App router, nav header & dynamic auth state
│   │   ├── index.css        # Modern design system & responsive styles
│   │   └── index.js
│   └── package.json
│
└── schema.sql               # Complete MySQL schema & initial seed data
```

---

## ⚡ Quick Start (Currently Running)

Both backend and frontend servers are configured and running:

| Service | URL | Notes |
|---|---|---|
| **Frontend UI** | [http://localhost:3000](http://localhost:3000) | React Single Page Application |
| **Backend API** | [http://localhost:5000](http://localhost:5000) | Express REST API |

---

## 🔑 Pre-Configured Demo Credentials

The system automatically initializes and seeds demo accounts with 1-click autofill on the login page:

| Role | Email | Password | Permissions |
|---|---|---|---|
| 🎓 **Student** | `student@placement.com` | `student123` | Browse jobs, 1-click apply, track application status |
| 🛡️ **Admin** | `admin@placement.com` | `admin123` | Full dashboard, post jobs, review & shortlist candidates, view statistics |
| 💼 **Recruiter** | `recruiter@placement.com` | `recruiter123` | Post new drives, manage applicants |

---

## ⚙️ Manual Setup & Execution

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```
*The backend runs on `http://localhost:5000`.*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```
*The frontend runs on `http://localhost:3000`.*

---

## 🗄️ Database Options

### Option A: Zero-Config Out-of-the-Box Mode (Active)
If MySQL is not installed or running, the backend automatically falls back to Node.js's built-in SQLite engine (`backend/placement.sqlite`). All features, tables, relations, and seed data work immediately without installing any external database server.

### Option B: MySQL Mode
To use MySQL:
1. Start MySQL (e.g. via XAMPP, WampServer, or local MySQL Service).
2. Create the database and import [`schema.sql`](file:///c:/Users/arman/Desktop/Campus-Placement-Automation-System-main/schema.sql):
   ```sql
   CREATE DATABASE campus_placement;
   ```
3. Update `backend/.env` with your MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=campus_placement
   JWT_SECRET=supersecret_campus_placement_jwt_key_2026
   ```
4. Restart the backend server. It will detect MySQL and connect automatically.

---

## ✨ Features

- **Authentication & Security:** JWT tokens with role-based access control (`student`, `recruiter`, `admin`), hashed passwords with `bcryptjs`.
- **Student Experience:** Responsive drive browsing, real-time keyword search, single-click application, and "My Applications" tracking with status pills (Applied, Shortlisted, Rejected).
- **Admin & Recruiter Experience:** Interactive dashboard with live recruitment metrics, "Post New Job" modal form, and applicant review table with instant shortlist/reject actions.
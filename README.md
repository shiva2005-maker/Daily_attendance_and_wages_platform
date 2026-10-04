# Daily Attendance and Wages Platform

A full-stack web application for managing contractor accounts, workers, work sites, daily attendance, wages, and payments. Administrators can review platform-wide records and view dashboard statistics.

## 🚀 Live Project

### Frontend
[https://your-frontend-url.vercel.app](https://daily-attendance-and-wages-platform-8ah7u94l5.vercel.app/)

### Backend API
[https://your-backend-url.onrender.com](https://daily-attendance-and-wages-platform.onrender.com)


## Features

- Contractor registration and login
- Worker and work-site management
- Daily attendance tracking
- Wage calculations and payment records
- Reports and contractor dashboard
- Admin dashboard for managing contractors, workers, sites, and payments
- Cookie-based authentication with role-protected admin pages
  ## 👤 Authentication & Authorization

- Contractor registration
- Contractor login
- Admin login
- Secure password hashing
- JWT-based authentication
- HTTP-only cookies
- Logout functionality
- Session authentication
- Role-based authorization
- Protected routes

---

## 🏗️ Site Management

Contractors can manage their construction sites.

### Features

- Create construction sites
- View site details
- Update site information
- Delete sites
- Assign workers to sites
- Track site status

### Site Status

- Active
- Completed
- On Hold

The application prevents deletion of sites that still contain active workers.

---

## 👷 Worker Management

Contractors can manage workers assigned to construction sites.

### Features

- Add workers
- View workers
- Edit worker details
- Assign workers to sites
- Set daily wages
- Track worker roles
- Deactivate workers
- View worker information

### Worker Information

- Name
- Phone number
- Role
- Daily wage
- Joining date
- Assigned site
- Worker status

---

## 📅 Attendance Management

The attendance module allows contractors to record and manage daily worker attendance.

### Attendance Types

| Status | Wage Calculation |
|--------|------------------|
| Present | 100% of daily wage |
| Half-Day | 50% of daily wage |
| Absent | 0% of daily wage |

### Features

- Select construction site
- Select attendance date
- View workers assigned to the selected site
- Mark Present
- Mark Half-Day
- Mark Absent
- Load previously saved attendance
- Update existing attendance
- Prevent duplicate attendance
- Prevent future-date attendance
- Validate worker-site relationship

---

## 💰 Wage Management

The system automatically calculates worker earnings based on attendance.

### Example

If a worker's daily wage is:

```text
total wages ₹800

## Tech stack

- **Frontend:** React, Vite, React Router, Tailwind CSS, Recharts
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose

## Requirements

- Node.js and npm
- MongoDB running locally or a MongoDB Atlas connection string

## Run locally

### 1. Configure the backend

In a terminal, go to the backend directory and install dependencies:

```bash
cd Backend
npm install
```

Create `Backend/.env` with the following settings. Replace `MONGO_URI` with your MongoDB connection string and set a private `JWT_KEY`.

```dotenv
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/daily-wages-platform
JWT_KEY=replace-this-with-a-long-random-secret
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin@123
```

Create the admin account once the database is available:

```bash
npm run create-admin
```

The script stores a hashed password in the database. It fails if an account with the configured admin email already exists.

### 2. Start the backend

From `Backend`, run:

```bash
node index.js
```

The API uses port `5000` by default.

### 3. Configure and start the frontend

Open a second terminal, then run:

```bash
cd Frontend
npm install
```

Create `Frontend/.env` with:

```dotenv
VITE_API_URL=http://localhost:5000/
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Admin login

Use these credentials on the login page after creating the admin account:

```text
Email:    admin@gmail.com
Password: admin@123
```

These are development/demo credentials. Change the password and use a unique admin email before deploying or exposing the application publicly. Never commit real `.env` files, database credentials, or production secrets to GitHub.

## API routes

| Area | Base route |
| --- | --- |
| Authentication | `/auth` |
| Sites | `/sites` |
| Workers | `/workers` |
| Attendance | `/attendance` |
| Wages | `/wages` |
| Payments | `/payments` |
| Dashboard | `/dashboard` |
| Admin | `/admin` |
| Reports | `/reports` |

The backend root route (`/`) returns a simple API welcome message.

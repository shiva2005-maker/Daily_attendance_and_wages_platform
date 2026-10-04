# 🏗️ Daily Wage Labour Attendance & Payment Platform

A full-stack MERN web application designed to simplify workforce management for construction contractors by digitizing worker attendance, wage calculation, payment tracking, and reporting.

The platform helps contractors maintain transparent and organized records of workers, attendance, earnings, and payments while providing administrators with centralized management capabilities.

---

## 🚀 Live Project

### Frontend
[https://your-frontend-url.vercel.app](https://daily-attendance-and-wages-platform-8ah7u94l5.vercel.app/)

### Backend API
[https://daily-attendance-and-wages-platform.onrender.com](https://daily-attendance-and-wages-platform.onrender.com)


---

## 📌 Problem Statement

Construction contractors often manage daily labour attendance and wage payments manually using notebooks, spreadsheets, or informal records.

This can lead to:

- Incorrect attendance records
- Wage calculation errors
- Difficulty tracking pending payments
- Loss of historical records
- Lack of transparency
- Difficulty generating reports
- Time-consuming workforce management

This project provides a centralized digital platform to solve these problems.

---

## 💡 Solution

The Daily Wage Labour Attendance & Payment Platform provides:

- 👤 Contractor authentication
- 👷 Worker management
- 🏗️ Construction site management
- 📅 Daily attendance tracking
- 💰 Automatic wage calculation
- 💳 Payment management
- 📊 Reports and financial summaries
- 🛡️ Admin management
- 🔐 Role-based authorization
- 📱 Responsive user interface

---

# ✨ Features

## 👤 Authentication

- Contractor registration
- Contractor login
- Secure password hashing
- JWT-based authentication
- HTTP-only authentication cookies
- Logout functionality
- Session validation
- Role-based authorization

---

## 🏗️ Site Management

Contractors can:

- Create construction sites
- View site details
- Update site information
- Delete sites
- Track site status

### Site Status

- Active
- Completed
- On Hold

A site with active workers cannot be deleted.

---

## 👷 Worker Management

Contractors can:

- Add workers
- Assign workers to sites
- Edit worker details
- Set daily wages
- View worker information
- Deactivate workers
- Manage worker roles

Example worker roles:

- Labourer
- Mason
- Carpenter
- Electrician
- Plumber
- Other

---

## 📅 Attendance Management

Contractors can record daily attendance for workers.

### Attendance Types

| Status | Wage |
|--------|------|
| Present | 100% |
| Half-Day | 50% |
| Absent | 0% |

### Attendance Features

- Select construction site
- Select date
- View workers assigned to site
- Mark Present / Half-Day / Absent
- Load previously saved attendance
- Update existing attendance
- Prevent duplicate attendance
- Prevent future-date attendance
- Validate worker-site relationship

---

## 💰 Wage Management

The system automatically calculates worker earnings based on attendance.

### Example

If a worker earns:

```text
Daily Wage = ₹800

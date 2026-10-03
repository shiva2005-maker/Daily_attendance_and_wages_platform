const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('./Config/mongooseConfig');
const authRoutes = require('./Routes/authRoutes');
const siteRoutes = require('./Routes/siteRoutes');
const workerRoutes = require('./Routes/workerRoutes');
const attendanceRoutes = require('./Routes/attendanceRoutes');
const wageRoutes = require('./Routes/wageRoutes');
const paymentRoutes = require("./Routes/paymentRoutes");
const dashboardRoutes = require("./Routes/dashboardRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const reportRoutes = require("./Routes/reportRoutes");



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,                
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());

//routes
app.get('/', (req, res) => {
    res.send('Welcome to the Worker Attendance Platform API');
});

app.use('/auth', authRoutes);
app.use('/sites', siteRoutes);
app.use('/workers', workerRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/wages', wageRoutes);
app.use('/payments', paymentRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/reports', reportRoutes);

//server
app.listen(process.env.PORT || 5000);

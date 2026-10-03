const User = require("../Models/User");
const Worker = require("../Models/Worker");
const Site = require("../Models/Site");
const Attendance = require("../Models/Attendance");
const Payment = require("../Models/Payment");

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
    try {
        const [
            totalContractors,
            totalWorkers,
            activeWorkers,
            totalSites,
            activeSites,
            totalAttendance,
            totalPayments
        ] = await Promise.all([
            User.countDocuments({ role: "contractor" }),

            Worker.countDocuments(),

            Worker.countDocuments({ status: "Active" }),

            Site.countDocuments(),

            Site.countDocuments({ status: "Active" }),

            Attendance.countDocuments(),

            Payment.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ])
        ]);

        res.status(200).json({
            stats: {
                totalContractors,
                totalWorkers,
                activeWorkers,
                totalSites,
                activeSites,
                totalAttendance,
                totalPayments: totalPayments[0]?.total || 0
            }
        });
    } catch (error) {
        console.error("Admin stats error:", error);

        res.status(500).json({
            message: "Failed to fetch admin statistics"
        });
    }
};


// Get all contractors
const getAllContractors = async (req, res) => {
    try {
        const contractors = await User.find({
            role: "contractor"
        })
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            contractors
        });
    } catch (error) {
        console.error("Get contractors error:", error);

        res.status(500).json({
            message: "Failed to fetch contractors"
        });
    }
};


// Get all workers
const getAllWorkers = async (req, res) => {
    try {
        const workers = await Worker.find()
            .populate("contractorId", "name email")
            .populate("siteId", "siteName location")
            .sort({ createdAt: -1 });

        res.status(200).json({
            workers
        });
    } catch (error) {
        console.error("Get all workers error:", error);

        res.status(500).json({
            message: "Failed to fetch workers"
        });
    }
};


// Get all sites
const getAllSites = async (req, res) => {
    try {
        const sites = await Site.find()
            .populate("contractorId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            sites
        });
    } catch (error) {
        console.error("Get all sites error:", error);

        res.status(500).json({
            message: "Failed to fetch sites"
        });
    }
};


// Get all payments
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate("workerId", "name role dailyWage")
            .populate("contractorId", "name email")
            .sort({ paymentDate: -1 });

        res.status(200).json({
            payments
        });
    } catch (error) {
        console.error("Get all payments error:", error);

        res.status(500).json({
            message: "Failed to fetch payments"
        });
    }
};


module.exports = {
    getAdminStats,
    getAllContractors,
    getAllWorkers,
    getAllSites,
    getAllPayments
};
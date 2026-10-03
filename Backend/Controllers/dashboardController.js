const Worker = require("../Models/Worker");
const Site = require("../Models/Site");
const Attendance = require("../Models/Attendance");
const Payment = require("../Models/Payment");

const getDashboardSummary = async (req, res) => {
    try {
        const contractorId = req.user._id;

        // 1. Basic counts

        const activeWorkers = await Worker.countDocuments({
            contractorId,
            status: "Active"
        });

        const activeSites = await Site.countDocuments({
            contractorId,
            status: "Active"
        });

        // 2. Today's attendance

        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const todayAttendance = await Attendance.find({
            contractorId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        const todayPresent = todayAttendance.filter(
            item => item.status === "Present"
        ).length;

        const todayHalfDay = todayAttendance.filter(
            item => item.status === "Half-Day"
        ).length;

        const todayAbsent = todayAttendance.filter(
            item => item.status === "Absent"
        ).length;

        // 3. Total earnings

        const attendanceRecords = await Attendance.find({
            contractorId
        }).populate("workerId", "dailyWage");

        let totalEarned = 0;

        attendanceRecords.forEach(record => {
            const dailyWage = record.workerId?.dailyWage || 0;

            if (record.status === "Present") {
                totalEarned += dailyWage;
            } else if (record.status === "Half-Day") {
                totalEarned += dailyWage * 0.5;
            }
        });

        // 4. Total payments

        const payments = await Payment.find({
            contractorId
        });

        const totalPaid = payments.reduce(
            (total, payment) => total + payment.amount,
            0
        );

        const pendingAmount = totalEarned - totalPaid;

        // 5. Recent payments

        const recentPayments = await Payment.find({
            contractorId
        })
            .populate("workerId", "name role")
            .sort({ paymentDate: -1 })
            .limit(5);

        // 6. Response

        res.status(200).json({
            summary: {
                activeWorkers,
                activeSites,

                todayAttendance: {
                    present: todayPresent,
                    halfDay: todayHalfDay,
                    absent: todayAbsent
                },

                totalEarned,
                totalPaid,
                pendingAmount
            },

            recentPayments
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Failed to fetch dashboard data"
        });
    }
};

module.exports = {
    getDashboardSummary
};
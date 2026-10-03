const mongoose = require("mongoose");

const Worker = require("../Models/Worker");
const Attendance = require("../Models/Attendance");
const Payment = require("../Models/Payment");


const getWorkerWageSummary = async (req, res) => {
    try {
        const { workerId } = req.params;

        const {
            startDate,
            endDate
        } = req.query;

        // Validate worker ID
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                message: "Invalid worker ID"
            });
        }

        // Find worker belonging to contractor
        const worker = await Worker.findOne({
            _id: workerId,
            contractorId: req.user._id
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found or access denied"
            });
        }

        // Build attendance query
        const attendanceQuery = {
            workerId,
            contractorId: req.user._id
        };

        // Date filtering
        if (startDate || endDate) {

            attendanceQuery.date = {};

            if (startDate) {
                const start = new Date(startDate);

                if (isNaN(start.getTime())) {
                    return res.status(400).json({
                        message: "Invalid start date"
                    });
                }

                start.setHours(0, 0, 0, 0);

                attendanceQuery.date.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                if (isNaN(end.getTime())) {
                    return res.status(400).json({
                        message: "Invalid end date"
                    });
                }

                end.setHours(23, 59, 59, 999);

                attendanceQuery.date.$lte = end;
            }
        }

        // Get attendance
        const attendance = await Attendance.find(
            attendanceQuery
        ).sort({
            date: 1
        });

        // Count attendance
        let presentDays = 0;
        let halfDays = 0;
        let absentDays = 0;

        attendance.forEach((record) => {

            if (record.status === "Present") {
                presentDays++;
            }

            else if (record.status === "Half-Day") {
                halfDays++;
            }

            else if (record.status === "Absent") {
                absentDays++;
            }
        });

        // Wage calculation
        const dailyWage = worker.dailyWage;

        const presentEarnings =
            presentDays * dailyWage;

        const halfDayEarnings =
            halfDays * dailyWage * 0.5;

        const totalEarned =
            presentEarnings + halfDayEarnings;

        // Payment query
        const paymentQuery = {
            workerId,
            contractorId: req.user._id
        };

        // Apply same date range to payments
        if (startDate || endDate) {

            paymentQuery.paymentDate = {};

            if (startDate) {
                const start = new Date(startDate);

                start.setHours(0, 0, 0, 0);

                paymentQuery.paymentDate.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                end.setHours(23, 59, 59, 999);

                paymentQuery.paymentDate.$lte = end;
            }
        }

        // Get payments
        const payments = await Payment.find(
            paymentQuery
        );

        // Calculate paid amount
        const totalPaid = payments.reduce(
            (sum, payment) => {
                return sum + payment.amount;
            },
            0
        );

        // Pending
        const pendingAmount =
            totalEarned - totalPaid;

        res.status(200).json({
            worker: {
                id: worker._id,
                name: worker.name,
                role: worker.role,
                dailyWage: worker.dailyWage
            },

            period: {
                startDate: startDate || null,
                endDate: endDate || null
            },

            attendance: {
                presentDays,
                halfDays,
                absentDays,
                totalRecords: attendance.length
            },

            earnings: {
                presentEarnings,
                halfDayEarnings,
                totalEarned
            },

            payments: {
                totalPaid,
                pendingAmount
            }
        });
        

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getWorkerWageSummary
};
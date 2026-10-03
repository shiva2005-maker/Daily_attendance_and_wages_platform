const mongoose = require("mongoose");

const Payment = require("../Models/Payment");
const Worker = require("../Models/Worker");
const Attendance = require("../Models/Attendance");


const createPayment = async (req, res) => {
    try {

        const {
            workerId,
            amount,
            paymentDate,
            paymentMethod,
            notes
        } = req.body;

        if (!workerId || !amount || !paymentMethod) {
            return res.status(400).json({
                message:
                    "Worker, amount and payment method are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                message: "Invalid worker ID"
            });
        }

        const paymentAmount = Number(amount);

        if (
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {
            return res.status(400).json({
                message:
                    "Payment amount must be greater than 0"
            });
        }

        const validMethods = [
            "Cash",
            "UPI",
            "Bank Transfer"
        ];

        if (!validMethods.includes(paymentMethod)) {
            return res.status(400).json({
                message: "Invalid payment method"
            });
        }

        const worker = await Worker.findOne({
            _id: workerId,
            contractorId: req.user._id
        });

        if (!worker) {
            return res.status(404).json({
                message:
                    "Worker not found or access denied"
            });
        }

        const attendance = await Attendance.find({
            workerId,
            contractorId: req.user._id
        });

        let totalEarned = 0;

        attendance.forEach((record) => {

            if (record.status === "Present") {
                totalEarned += worker.dailyWage;
            }

            else if (record.status === "Half-Day") {
                totalEarned += worker.dailyWage * 0.5;
            }

        });

        const previousPayments = await Payment.find({
            workerId,
            contractorId: req.user._id
        });

        const totalPaid = previousPayments.reduce(
            (sum, payment) => {
                return sum + payment.amount;
            },
            0
        );

        const pendingAmount =
            totalEarned - totalPaid;

        if (paymentAmount > pendingAmount) {
            return res.status(400).json({
                message:
                    "Payment cannot exceed pending amount",

                totalEarned,
                totalPaid,
                pendingAmount
            });
        }

        let finalPaymentDate = new Date();

        if (paymentDate) {

            finalPaymentDate =
                new Date(paymentDate);

            if (
                isNaN(
                    finalPaymentDate.getTime()
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid payment date"
                });
            }
        }

        const payment = await Payment.create({
            workerId,
            contractorId:
                req.user._id,
            amount: paymentAmount,
            paymentDate:
                finalPaymentDate,
            paymentMethod,
            notes
        });

        res.status(201).json({
            message:
                "Payment recorded successfully",

            payment,

            summary: {
                totalEarned,

                previousPaid:
                    totalPaid,

                currentPayment:
                    paymentAmount,

                remainingPending:
                    pendingAmount -
                    paymentAmount
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getPayments = async (req, res) => {
    try {

        const payments =
            await Payment.find({
                contractorId:
                    req.user._id
            })
                .populate(
                    "workerId",
                    "name role dailyWage"
                )
                .sort({
                    paymentDate: -1
                });

        res.status(200).json({
            payments
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getWorkerPayments = async (
    req,
    res
) => {

    try {

        const {
            workerId
        } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                workerId
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid worker ID"
            });
        }

        const worker =
            await Worker.findOne({
                _id: workerId,
                contractorId:
                    req.user._id
            });

        if (!worker) {
            return res.status(404).json({
                message:
                    "Worker not found or access denied"
            });
        }

        const payments =
            await Payment.find({
                workerId,
                contractorId:
                    req.user._id
            })
                .sort({
                    paymentDate: -1
                });

        const totalPaid =
            payments.reduce(
                (sum, payment) =>
                    sum + payment.amount,
                0
            );

        res.status(200).json({
            worker: {
                id: worker._id,
                name: worker.name,
                role: worker.role
            },

            totalPaid,

            payments
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createPayment,
    getPayments,
    getWorkerPayments
};
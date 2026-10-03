const Attendance = require("../Models/Attendance");
const Worker = require("../Models/Worker");
const Payment = require("../Models/Payment");
const Site = require("../Models/Site");

const getReports = async (req, res) => {
    try {
        const contractorId = req.user._id;

        const { startDate, endDate, siteId } = req.query;


        const attendanceFilter = {
            contractorId
        };

        const paymentFilter = {
            contractorId
        };

        if (siteId) {
            const site = await Site.findOne({
                _id: siteId,
                contractorId
            });

            if (!site) {
                return res.status(404).json({
                    message: "Site not found"
                });
            }

            attendanceFilter.siteId = siteId;
        }

        if (startDate || endDate) {
            attendanceFilter.date = {};

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);

                attendanceFilter.date.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                attendanceFilter.date.$lte = end;
            }

            paymentFilter.paymentDate = {};

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);

                paymentFilter.paymentDate.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                paymentFilter.paymentDate.$lte = end;
            }
        }

        

        const attendance = await Attendance.find(
            attendanceFilter
        ).populate(
            "workerId",
            "name role dailyWage"
        );

        let present = 0;
        let halfDay = 0;
        let absent = 0;

        let totalEarned = 0;

        attendance.forEach((record) => {
            const wage = Number(
                record.workerId?.dailyWage || 0
            );

            if (record.status === "Present") {
                present++;
                totalEarned += wage;
            }

            if (record.status === "Half-Day") {
                halfDay++;
                totalEarned += wage * 0.5;
            }

            if (record.status === "Absent") {
                absent++;
            }
        });

        
        const payments = await Payment.find(
            paymentFilter
        )
            .populate(
                "workerId",
                "name role"
            )
            .sort({
                paymentDate: -1
            });

        const totalPaid = payments.reduce(
            (total, payment) =>
                total + Number(payment.amount || 0),
            0
        );


        const workerMap = {};

        attendance.forEach((record) => {
            if (!record.workerId) return;

            const workerId =
                record.workerId._id.toString();

            if (!workerMap[workerId]) {
                workerMap[workerId] = {
                    workerId,
                    name: record.workerId.name,
                    role: record.workerId.role,
                    dailyWage:
                        record.workerId.dailyWage,
                    present: 0,
                    halfDay: 0,
                    absent: 0,
                    earned: 0
                };
            }

            const worker =
                workerMap[workerId];

            const wage = Number(
                record.workerId.dailyWage || 0
            );

            if (record.status === "Present") {
                worker.present++;
                worker.earned += wage;
            }

            if (record.status === "Half-Day") {
                worker.halfDay++;
                worker.earned += wage * 0.5;
            }

            if (record.status === "Absent") {
                worker.absent++;
            }
        });

        const workerSummary =
            Object.values(workerMap);

        

        const siteAttendance = await Attendance.find(
            attendanceFilter
        ).populate(
            "siteId",
            "siteName location"
        );

        const siteMap = {};

        siteAttendance.forEach((record) => {
            if (!record.siteId) return;

            const id =
                record.siteId._id.toString();

            if (!siteMap[id]) {
                siteMap[id] = {
                    siteId: id,
                    siteName:
                        record.siteId.siteName,
                    location:
                        record.siteId.location,
                    present: 0,
                    halfDay: 0,
                    absent: 0
                };
            }

            if (record.status === "Present") {
                siteMap[id].present++;
            }

            if (record.status === "Half-Day") {
                siteMap[id].halfDay++;
            }

            if (record.status === "Absent") {
                siteMap[id].absent++;
            }
        });

        const siteSummary =
            Object.values(siteMap);

        res.status(200).json({
            period: {
                startDate: startDate || null,
                endDate: endDate || null
            },

            attendance: {
                total: attendance.length,
                present,
                halfDay,
                absent
            },

            financial: {
                totalEarned,
                totalPaid,
                pendingAmount:
                    totalEarned - totalPaid
            },

            workerSummary,

            siteSummary,

            recentPayments: payments.slice(
                0,
                10
            )
        });
    } catch (error) {
        console.error(
            "Reports error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to generate report"
        });
    }
};

module.exports = {
    getReports
};
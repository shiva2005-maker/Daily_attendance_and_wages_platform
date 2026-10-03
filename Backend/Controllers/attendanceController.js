const mongoose = require("mongoose");

const Attendance = require("../Models/Attendance");
const Worker = require("../Models/Worker");
const Site = require("../Models/Site");


const createAttendance = async (req, res) => {
    try {
        const {
            workerId,
            siteId,
            date,
            status
        } = req.body;

        // Required fields
        if (!workerId || !siteId || !date || !status) {
            return res.status(400).json({
                message: "Worker, site, date and status are required"
            });
        }

        // Validate IDs
        if (
            !mongoose.Types.ObjectId.isValid(workerId) ||
            !mongoose.Types.ObjectId.isValid(siteId)
        ) {
            return res.status(400).json({
                message: "Invalid worker ID or site ID"
            });
        }

        // Validate status
        const validStatuses = [
            "Present",
            "Absent",
            "Half-Day"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid attendance status"
            });
        }

        // Validate date
        const attendanceDate = new Date(date);

        if (isNaN(attendanceDate.getTime())) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        // Prevent future attendance
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (attendanceDate > today) {
            return res.status(400).json({
                message: "Future attendance is not allowed"
            });
        }

        // Check worker
        const worker = await Worker.findOne({
            _id: workerId,
            contractorId: req.user._id
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found or access denied"
            });
        }

        // Worker must be active
        if (worker.status !== "Active") {
            return res.status(400).json({
                message: "Cannot mark attendance for inactive worker"
            });
        }

        // Check site
        const site = await Site.findOne({
            _id: siteId,
            contractorId: req.user._id
        });

        if (!site) {
            return res.status(404).json({
                message: "Site not found or access denied"
            });
        }

        // Worker must belong to selected site
        if (worker.siteId.toString() !== siteId.toString()) {
            return res.status(400).json({
                message: "Worker does not belong to this site"
            });
        }

        // Normalize date to start of day
        attendanceDate.setHours(0, 0, 0, 0);

        // Check duplicate attendance
        const existingAttendance = await Attendance.findOne({
            workerId,
            date: attendanceDate
        });

        if (existingAttendance) {
            return res.status(409).json({
                message: "Attendance already exists for this worker on this date"
            });
        }

        // Create attendance
        const attendance = await Attendance.create({
            workerId,
            siteId,
            contractorId: req.user._id,
            date: attendanceDate,
            status
        });

        res.status(201).json({
            message: "Attendance marked successfully",
            attendance
        });

    } catch (error) {
        console.error(error);

        // Duplicate index error
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Attendance already exists for this worker on this date"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getAttendance = async (req, res) => {
    try {
        const {
            siteId,
            workerId,
            startDate,
            endDate
        } = req.query;

        const query = {
            contractorId: req.user._id
        };

        // Site filter
        if (siteId) {
            if (!mongoose.Types.ObjectId.isValid(siteId)) {
                return res.status(400).json({
                    message: "Invalid site ID"
                });
            }

            query.siteId = siteId;
        }

        // Worker filter
        if (workerId) {
            if (!mongoose.Types.ObjectId.isValid(workerId)) {
                return res.status(400).json({
                    message: "Invalid worker ID"
                });
            }

            query.workerId = workerId;
        }

        // Date filter
        if (startDate || endDate) {
            const dateFilter = {};

            if (startDate) {
                const start = new Date(`${startDate}T00:00:00`);
                dateFilter.$gte = start;
            }

            if (endDate) {
                const end = new Date(`${endDate}T00:00:00`);

                const nextDay = new Date(end);
                nextDay.setDate(nextDay.getDate() + 1);

                dateFilter.$lt = nextDay;
            }

            query.date = dateFilter;
        }

        const attendance = await Attendance.find(query)
            .populate("workerId", "name role dailyWage")
            .populate("siteId", "siteName location")
            .sort({
                date: -1
            });

        res.status(200).json({
            attendance
        });

    } catch (error) {
        console.error("Get attendance error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getWorkerAttendance = async (req, res) => {
    try {
        const { workerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                message: "Invalid worker ID"
            });
        }

        // Check worker ownership
        const worker = await Worker.findOne({
            _id: workerId,
            contractorId: req.user._id
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found or access denied"
            });
        }

        const attendance = await Attendance.find({
            workerId,
            contractorId: req.user._id
        })
            .populate("siteId", "siteName location")
            .sort({
                date: -1
            });

        res.status(200).json({
            worker: {
                id: worker._id,
                name: worker.name,
                role: worker.role,
                dailyWage: worker.dailyWage
            },
            attendance
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};



const getTodayAttendance = async (req, res) => {
    try {
        const startOfDay = new Date();

        startOfDay.setHours(
            0,
            0,
            0,
            0
        );

        const endOfDay = new Date();

        endOfDay.setHours(
            23,
            59,
            59,
            999
        );

        const attendance = await Attendance.find({
            contractorId: req.user._id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        })
            .populate(
                "workerId",
                "name role dailyWage"
            )
            .populate(
                "siteId",
                "siteName"
            );

        res.status(200).json({
            attendance
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Attendance status is required"
            });
        }

        if (!["Present", "Absent", "Half-Day"].includes(status)) {
            return res.status(400).json({
                message: "Invalid attendance status"
            });
        }

        const attendance = await Attendance.findOne({
            _id: id,
            contractorId: req.user._id
        });

        if (!attendance) {
            return res.status(404).json({
                message: "Attendance record not found"
            });
        }

        attendance.status = status;

        await attendance.save();

        const updatedAttendance = await Attendance.findById(attendance._id)
            .populate("workerId", "name role dailyWage")
            .populate("siteId", "siteName location");

        res.status(200).json({
            message: "Attendance updated successfully",
            attendance: updatedAttendance
        });

    } catch (error) {
        console.error("Update attendance error:", error);

        res.status(500).json({
            message: "Failed to update attendance"
        });
    }
};

module.exports = {
    createAttendance,
    getAttendance,
    getWorkerAttendance,
    getTodayAttendance,
    updateAttendance
}
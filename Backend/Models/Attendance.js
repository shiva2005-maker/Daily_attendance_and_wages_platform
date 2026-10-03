const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            required: true
        },

        siteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Site",
            required: true
        },

        contractorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["Present", "Absent", "Half-Day"],
            required: true
        }
    },
    {
        timestamps: true
    }
);

attendanceSchema.index(
    {
        workerId: 1,
        date: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
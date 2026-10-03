const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        contractorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        siteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Site",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        role: {
            type: String,
            enum: [
                "Mason",
                "Labourer",
                "Electrician",
                "Plumber",
                "Carpenter",
                "Painter",
                "Welder",
                "Helper",
                "Supervisor"
            ],
            required: true
        },

        dailyWage: {
            type: Number,
            required: true,
            min: 0
        },

        joiningDate: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Worker", workerSchema);


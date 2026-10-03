const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema(
    {
        contractorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        siteName: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        clientName: {
            type: String,
            trim: true
        },

        startDate: {
            type: Date
        },

        status: {
            type: String,
            enum: ["Active", "Completed", "On Hold"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Site", siteSchema);
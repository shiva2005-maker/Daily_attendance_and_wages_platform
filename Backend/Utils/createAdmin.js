require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../Models/User");

const createAdmin = async () => {
    try {
        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !MONGO_URI) {
            throw new Error("ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD and MONGO_URI are required");
        }

        if (ADMIN_PASSWORD.length < 6) {
            throw new Error("ADMIN_PASSWORD must contain at least 6 characters");
        }

        await mongoose.connect(MONGO_URI);

        const email = ADMIN_EMAIL.trim().toLowerCase();
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error("An account with ADMIN_EMAIL already exists");
        }

        const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

        await User.create({
            name: ADMIN_NAME.trim(),
            email,
            password,
            role: "admin",
            status: "Active"
        });

        console.log("Admin account created");
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

void createAdmin();
module.exports = createAdmin;
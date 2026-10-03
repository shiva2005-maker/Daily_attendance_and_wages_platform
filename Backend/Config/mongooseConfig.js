const mongoose = require("mongoose");
require("dotenv").config();
const debug = require("debug")("app:mongooseConfig");

mongoose.connect(process.env.MONGO_URI).then(() => {
        debug("Connected to MongoDB");
    })
    .catch((err) => {
        debug("Error connecting to MongoDB:", err);
    }); 

module.exports = mongoose.connection;

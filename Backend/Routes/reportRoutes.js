const express = require("express");

const {
    getReports
} = require("../Controllers/reportController");

const {
    isLoggedIn,
    authorizeRoles
} = require("../Middlewares/authMiddleware");

const router = express.Router();

router.get(
    "/",
    isLoggedIn,
    authorizeRoles("contractor"),
    getReports
);

module.exports = router;
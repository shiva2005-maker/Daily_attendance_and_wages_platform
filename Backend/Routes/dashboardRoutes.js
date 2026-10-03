const express = require("express");

const {
    getDashboardSummary
} = require("../Controllers/dashboardController");

const {
    isLoggedIn,
    authorizeRoles
} = require("../Middlewares/authMiddleware");

const router = express.Router();

router.get(
    "/summary",
    isLoggedIn,
    authorizeRoles("contractor"),
    getDashboardSummary
);

module.exports = router;
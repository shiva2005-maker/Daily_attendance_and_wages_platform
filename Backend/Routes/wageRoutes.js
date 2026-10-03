const express = require("express");

const {
    getWorkerWageSummary
} = require("../Controllers/wageController");

const {
    isLoggedIn,
    authorizeRoles
} = require("../Middlewares/authMiddleware");

const router = express.Router();


// Worker wage summary
router.get(
    "/worker/:workerId",
    isLoggedIn,
    authorizeRoles("contractor"),
    getWorkerWageSummary
);


module.exports = router;
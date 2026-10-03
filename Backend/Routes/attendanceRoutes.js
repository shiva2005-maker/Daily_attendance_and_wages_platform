const express = require("express");

const {
    createAttendance,
    getAttendance,
    getWorkerAttendance,
    getTodayAttendance,
    updateAttendance
} = require("../Controllers/attendanceController");

const {
    isLoggedIn,
    authorizeRoles
} = require("../Middlewares/authMiddleware");

const router = express.Router();


// Mark attendance
router.post(
    "/",
    isLoggedIn,
    authorizeRoles("contractor"),
    createAttendance
);


// Get attendance
router.get(
    "/",
    isLoggedIn,
    authorizeRoles("contractor"),
    getAttendance
);


// Today's attendance
router.get(
    "/today",
    isLoggedIn,
    authorizeRoles("contractor"),
    getTodayAttendance
);


// Worker attendance history
router.get(
    "/worker/:workerId",
    isLoggedIn,
    authorizeRoles("contractor"),
    getWorkerAttendance
);

router.put("/:id", isLoggedIn, authorizeRoles("contractor"), updateAttendance);

module.exports = router;
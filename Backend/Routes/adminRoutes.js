const express = require("express");

const {
    getAdminStats,
    getAllContractors,
    getAllWorkers,
    getAllSites,
    getAllPayments
} = require("../Controllers/adminController");

const {
    isLoggedIn,
    authorizeRoles
} = require("../Middlewares/authMiddleware");

const router = express.Router();

router.use(isLoggedIn, authorizeRoles("admin"));

router.get("/stats", getAdminStats);

router.get("/contractors", getAllContractors);

router.get("/workers", getAllWorkers);

router.get("/sites", getAllSites);

router.get("/payments", getAllPayments);

module.exports = router;
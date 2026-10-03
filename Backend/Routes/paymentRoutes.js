const express = require("express");

const {
    createPayment,
    getPayments,
    getWorkerPayments
} = require("../Controllers/paymentController");

const {
    isLoggedIn,
    authorizeRoles
} = require("../Middlewares/authMiddleware");

const router = express.Router();


// Record payment
router.post(
    "/",
    isLoggedIn,
    authorizeRoles("contractor"),
    createPayment
);


// Get all payments
router.get(
    "/",
    isLoggedIn,
    authorizeRoles("contractor"),
    getPayments
);


// Get worker payments
router.get(
    "/worker/:workerId",
    isLoggedIn,
    authorizeRoles("contractor"),
    getWorkerPayments
);


module.exports = router;
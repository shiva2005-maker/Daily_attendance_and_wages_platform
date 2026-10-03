const express = require("express");

const {
    createWorker,
    getMyWorkers,
    getWorkerById,
    updateWorker,
    deleteWorker
} = require("../Controllers/workerController");

const {
    isLoggedIn,
    authorizeRoles
} = require("../Middlewares/authMiddleware");

const router = express.Router();


// Create worker
router.post(
    "/",
    isLoggedIn,
    authorizeRoles("contractor"),
    createWorker
);


// Get all workers
router.get(
    "/",
    isLoggedIn,
    authorizeRoles("contractor"),
    getMyWorkers
);


// Get single worker
router.get(
    "/:id",
    isLoggedIn,
    authorizeRoles("contractor"),
    getWorkerById
);


// Update worker
router.put(
    "/:id",
    isLoggedIn,
    authorizeRoles("contractor"),
    updateWorker
);


// Deactivate worker
router.delete(
    "/:id",
    isLoggedIn,
    authorizeRoles("contractor"),
    deleteWorker
);


module.exports = router;
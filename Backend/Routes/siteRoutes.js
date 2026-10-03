const express = require("express");

const {
    createSite,
    getMySites,
    getSiteById,
    updateSite,
    deleteSite
} = require("../Controllers/siteController");

const {
    isLoggedIn,
    authorizeRoles
} = require("../Middlewares/authMiddleware");

const router = express.Router();


// Create site
router.post(
    "/",
    isLoggedIn,
    authorizeRoles("contractor"),
    createSite
);


// Get all my sites
router.get(
    "/",
    isLoggedIn,
    authorizeRoles("contractor"),
    getMySites
);


// Get single site
router.get(
    "/:id",
    isLoggedIn,
    authorizeRoles("contractor"),
    getSiteById
);


// Update site
router.put(
    "/:id",
    isLoggedIn,
    authorizeRoles("contractor"),
    updateSite
);


// Delete site
router.delete(
    "/:id",
    isLoggedIn,
    authorizeRoles("contractor"),
    deleteSite
);


module.exports = router;
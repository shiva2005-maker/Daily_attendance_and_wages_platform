const Site = require("../Models/Site");
const Worker = require("../Models/Worker");


// CREATE SITE
const createSite = async (req, res) => {
    try {
        const {
            siteName,
            location,
            clientName,
            startDate
        } = req.body;

        if (!siteName || !location) {
            return res.status(400).json({
                message: "Site name and location are required"
            });
        }

        const site = await Site.create({
            contractorId: req.user._id,
            siteName,
            location,
            clientName,
            startDate
        });

        res.status(201).json({
            message: "Site created successfully",
            site
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// GET ALL MY SITES
const getMySites = async (req, res) => {
    try {
        const sites = await Site.find({
            contractorId: req.user._id
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            sites
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// GET SINGLE SITE
const getSiteById = async (req, res) => {
    try {
        const site = await Site.findOne({
            _id: req.params.id,
            contractorId: req.user._id
        });

        if (!site) {
            return res.status(404).json({
                message: "Site not found"
            });
        }

        res.status(200).json({
            site
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// UPDATE SITE
const updateSite = async (req, res) => {
    try {
        const {
            siteName,
            location,
            clientName,
            startDate,
            status
        } = req.body;

        const site = await Site.findOne({
            _id: req.params.id,
            contractorId: req.user._id
        });

        if (!site) {
            return res.status(404).json({
                message: "Site not found"
            });
        }

        if (siteName !== undefined) {
            site.siteName = siteName;
        }

        if (location !== undefined) {
            site.location = location;
        }

        if (clientName !== undefined) {
            site.clientName = clientName;
        }

        if (startDate !== undefined) {
            site.startDate = startDate;
        }

        if (status !== undefined) {
            site.status = status;
        }

        await site.save();

        res.status(200).json({
            message: "Site updated successfully",
            site
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// DELETE SITE
const deleteSite = async (req, res) => {
    try {
        const site = await Site.findOne({
            _id: req.params.id,
            contractorId: req.user._id
        });

        if (!site) {
            return res.status(404).json({
                message: "Site not found"
            });
        }

        const workersCount = await Worker.countDocuments({
            siteId: site._id,
            status: "Active"
        });

        if (workersCount > 0) {
            return res.status(400).json({
                message: "Cannot delete site with active workers"
            });
        }

        await Site.findByIdAndDelete(site._id);

        res.status(200).json({
            message: "Site deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createSite,
    getMySites,
    getSiteById,
    updateSite,
    deleteSite
};
const Worker = require("../Models/Worker");
const Site = require("../Models/Site");


// CREATE WORKER
const createWorker = async (req, res) => {
    try {
        const {
            name,
            phone,
            role,
            dailyWage,
            siteId,
            joiningDate
        } = req.body;

        if (!name || !role || !dailyWage || !siteId) {
            return res.status(400).json({
                message: "Name, role, daily wage and site are required"
            });
        }

        if (Number(dailyWage) <= 0) {
            return res.status(400).json({
                message: "Daily wage must be greater than 0"
            });
        }

        const site = await Site.findOne({
            _id: siteId,
            contractorId: req.user._id
        });

        if (!site) {
            return res.status(404).json({
                message: "Site not found or access denied"
            });
        }

        const worker = await Worker.create({
            contractorId: req.user._id,
            siteId,
            name,
            phone,
            role,
            dailyWage,
            joiningDate
        });

        res.status(201).json({
            message: "Worker added successfully",
            worker
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// GET ALL WORKERS
const getMyWorkers = async (req, res) => {
    try {
        const workers = await Worker.find({
            contractorId: req.user._id
        })
            .populate("siteId", "siteName location")
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            workers
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// GET SINGLE WORKER
const getWorkerById = async (req, res) => {
    try {
        const worker = await Worker.findOne({
            _id: req.params.id,
            contractorId: req.user._id
        })
            .populate("siteId", "siteName location");

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }

        res.status(200).json({
            worker
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// UPDATE WORKER
const updateWorker = async (req, res) => {
    try {
        const {
            name,
            phone,
            role,
            dailyWage,
            siteId,
            joiningDate,
            status
        } = req.body;

        const worker = await Worker.findOne({
            _id: req.params.id,
            contractorId: req.user._id
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }

        if (
            dailyWage !== undefined &&
            Number(dailyWage) <= 0
        ) {
            return res.status(400).json({
                message: "Daily wage must be greater than 0"
            });
        }

        if (siteId !== undefined) {

            const site = await Site.findOne({
                _id: siteId,
                contractorId: req.user._id
            });

            if (!site) {
                return res.status(404).json({
                    message: "Site not found or access denied"
                });
            }

            worker.siteId = siteId;
        }

        if (name !== undefined) {
            worker.name = name;
        }

        if (phone !== undefined) {
            worker.phone = phone;
        }

        if (role !== undefined) {
            worker.role = role;
        }

        if (dailyWage !== undefined) {
            worker.dailyWage = dailyWage;
        }

        if (joiningDate !== undefined) {
            worker.joiningDate = joiningDate;
        }

        if (status !== undefined) {
            worker.status = status;
        }

        await worker.save();

        res.status(200).json({
            message: "Worker updated successfully",
            worker
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// DEACTIVATE WORKER
const deleteWorker = async (req, res) => {
    try {
        const worker = await Worker.findOne({
            _id: req.params.id,
            contractorId: req.user._id
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }

        worker.status = "Inactive";

        await worker.save();

        res.status(200).json({
            message: "Worker deactivated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createWorker,
    getMyWorkers,
    getWorkerById,
    updateWorker,
    deleteWorker
};
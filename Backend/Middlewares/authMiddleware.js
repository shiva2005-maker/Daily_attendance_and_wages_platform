const jwt = require("jsonwebtoken");
const UserModel = require("../Models/User");


const isLoggedIn = async(req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_KEY
        );
        const user = await UserModel.findOne({email:decoded.email}).select("-password")
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};



const authorizeRoles = (...roles) => {
    return async (req, res, next) => {
        try {
            

            const user = await UserModel.findById(req.user._id);

            if (!user) {
                return res.status(401).json({
                    message: "User not found"
                });
            }

            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    message: "Access denied"
                });
            }

            req.currentUser = user;

            next();

        } catch (error) {
            res.status(500).json({
                message: "Server error"
            });
        }
    };
};

module.exports = {
    isLoggedIn,
    authorizeRoles
};
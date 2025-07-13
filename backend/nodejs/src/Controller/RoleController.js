const RoleModel = require("../Model/RoleModel");

const createRole = async (req, res) => {
    try {
        const savedRole = await RoleModel.create(req.body);

        res.status(200).json({
            message: "Role Added Successfully",
            data: savedRole,
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error in createRole",
            data: err,
        });
    }
};

const getAllRoles = async (req, res) => {
    try {
        const roles = await RoleModel.find();

        if (roles.length > 0) {
            res.json({
                message: "Roles fetch Successfully",
                data: roles,
            });
        } else {
            res.json({
                message: "No Roles Found",
                data: {},
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error in getAllRoles",
            data: err,
        });
    }
};

module.exports = {
    createRole,
    getAllRoles,
};

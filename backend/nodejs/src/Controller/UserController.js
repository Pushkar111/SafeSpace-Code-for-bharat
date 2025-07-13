const UserModel = require("../Model/UserModel");
const MailUtil = require("../Utils/MailUtil");
const EncryptUtil = require("../Utils/EncryptUtil");

// getAllUsers
const getAllUsers = async (req, res) => {
    console.log("getAllUsers controller called...");

    const users = await UserModel.find({}).populate("role", "_id name"); // db.users.find({});    role --> roleId    only shows _id name in postman from role Table

    if (users.length > 0) {
        res.json({
            message: "User Fetched Successfully",
            data: users,
        });
    } else {
        res.json({
            message: "No User Found",
            data: [],
        });
    }
};

// getUserById
const getUserById = async (req, res) => {
    console.log("getUserById controller called...");

    const id = req.params.id;
    const users = await UserModel.findById(id).populate("role", "_id name"); // db.users.find({_id: id});    role --> roleId    only shows _id name in postman from role Table

    if (users) {
        console.log("getUserById function called...");
        res.json({
            message: "User Fetched Successfully",
            data: users,
        });
    } else {
        res.json({
            message: "No User Found",
            data: [],
        });
    }
};

// getCurrentUser for authenticated user in Google Callback
const getCurrentUser = async (req, res) => {
    console.log("getCurrentUser controller called...");
    
    try {
        // req.user is set by the auth middleware
        const userId = req.user._id;
        console.log("Current user ID:", userId);
        const user = await UserModel.findById(userId).populate("role", "_id name");
        
        if (user) {
            return res.status(200).json({
                message: "Current user fetched successfully",
                data: user
            });
        } else {
            return res.status(404).json({
                message: "Current user not found",
                data: {}
            });
        }
    } catch (error) {
        console.error("Error in getCurrentUser:", error);
        return res.status(500).json({
            message: "Error fetching current user",
            error: error.message
        });
    }
};

// getUserByMobile
const getUserByMobile = async (req, res) => {
    console.log("getUserByMobile controller called...");
    const mobile = req.query.mobile;

    if (!mobile) {
        return res.status(400).json({
            message: "Mobile number is required for getUserByMobile",
            data: {},
        });
    }

    try {
        const user = await UserModel.findOne({ mobile: mobile }).populate("role", "_id name"); 
        console.log(`User found with mobile ${mobile}:`, user.name);
        if (user) {
            return res.status(200).json({
                message: "User found with this mobile number",
                data: user,
            });
        } else {
            return res.status(404).json({
                message: "User not found with this mobile number",
                data: {},
            });
        }
    } catch (error) {
        console.error("Error fetching user by mobile:", error);
        return res.status(500).json({
            message: "Internal Server Error for getUserByMobile!",
            data: error,
        });
    }
};

// getUserByName
const getUserByName = async (req, res) => {
    console.log("getUserByName controller called...");

    const name = req.query.name;
    const age = parseInt(req.query.age);
    console.log(name, age);
    console.log(typeof name, typeof age);

    const users = await UserModel.find({ name, age }); // db.users.find({name: name, age: age});
    console.log(users);
    if (users.length > 0) {
        console.log("getUserByName function called...");
        res.json({
            message: "User Fetched Successfully",
            data: users,
        });
    } else {
        res.json({
            message: "No User Found",
            data: [],
        });
    }
};

// getUserByEmail
const getUserByEmail = async (req, res) => {
    const { email } = req.query;

    console.log("getUserByEmail controller called...");
    try {
        const userFromEmail = await UserModel.findOne({ email: email }).populate("role", "_id name");
        if (userFromEmail) {
            res.status(200).json({
                message: "User found with this email",
                data: userFromEmail,
            });
        } else {
            res.status(404).json({
                message: "User not found with this email",
                data: {},
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error for getUserByEmail!",
            data: err,
        });
    }
};

// delete user
const deleteUser = async (req, res) => {
    console.log("deleteUser controller called...");

    const id = req.params.id;

    try {
        const deletedUser = await UserModel.findByIdAndDelete(id);

        if (deletedUser) {
            res.status(204).json({
                message: "User Deleted Successfully",
                data: deletedUser,
            });
        } else {
            res.status(404).json({
                message: "User not found for Delete!",
                data: err,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error for Delete!",
            data: err,
        });
    }
};

// update user
const updateUser = async (req, res) => {
    console.log("updateUser controller called...");

    const id = req.params.id;
    const dataToUpdate = req.body;

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(id, dataToUpdate, { new: true }); // {new: true} will return the updated data after update

        if (updatedUser) {
            res.status(200).json({
                message: "User Updated Successfully",
                data: updatedUser,
            });
        } else {
            res.status(404).json({
                message: "User not found for Update!",
                data: {},
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error for Update!",
            data: err,
        });
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    getCurrentUser,
    getUserByMobile,
    getUserByName,
    getUserByEmail,
    deleteUser,
    updateUser,
 
};

const multer = require("multer");
const CloudinaryUtil = require("../Utils/CloudinaryUtil");
const UserModel = require("../Model/UserModel");

/*
------ Local File Upload Storage ------

const storage = multer.diskStorage({
    filename: (req, file, db) => {
        db(null, file.originalname);
    },
    destination: "./uploads",
});

*/

const storage = multer.memoryStorage();

/* upload single File */
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB=10^6 Bytes limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype); // regex
        const extname = filetypes.test(file.originalname.split(".").pop().toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: File upload only supports the following filetypes - " + filetypes);
        }
    },
}).single("profilePic"); // fieldname

// uploadSingleFile
const uploadSingleFile = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        } else {
            if (req.file) {
                try {
                    const { userId } = req.params;
                    const userFromId = await UserModel.findById(userId);

                    if (userFromId) {
                        /* db logic */
                        // Convert buffer to base64 string for Cloudinary
                        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
                        const cloudinaryResponse = await CloudinaryUtil.uploadFile(userFromId, fileStr);

                        console.log("cloudinaryResponse: ", cloudinaryResponse);

                        if (cloudinaryResponse) {
                            // save the db fields
                            userFromId.profilePic = {
                                url: cloudinaryResponse.secure_url,
                                cloudinaryId: cloudinaryResponse.public_id,
                                uploadAt: new Date(),
                            };

                            await userFromId.save();

                            res.status(200).json({
                                message: "File uploaded successfully",
                                // localFile: req.file,
                                data: cloudinaryResponse,
                            });
                        } else {
                            return res.status(500).json({
                                error: "Error uploading file to Cloudinary",
                                data: err,
                            });
                        }
                    } else {
                        return res.status(404).json({
                            error: "User not found",
                        });
                    }
                } catch (error) {
                    console.error("Error in uploadProfilePic:", error);
                    res.status(500).json({ error: "Server error" });
                }
            } else {
                return res.status(400).json({
                    error: "No file uploaded",
                });
            }
        }
    });
};

/* upload Multiple Files */
const uploadMultiple = multer({
    storage: storage,
    limits: { fieldSize: 1000000 }, // 1MB=10^6 Bytes limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const mimetype = fileTypes.test(file.mimetype); // using regex test method
        const extname = fileTypes.test(file.originalname.split(".").pop().toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: File upload only supports the following filetypes - " + fileTypes);
        }
    },
}).array("gallery", 5); // max 5 files, fieldname is "gallery"

// uploadMultipleFiles
const uploadMultipleFiles = (req, res) => {
    uploadMultiple(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        } else {
            if (req.files && req.files.length > 0) {
                try {
                    // db logic
                    const { userId } = req.params;
                    const userFromId = await UserModel.findById(userId);

                    if (userFromId) {
                        const fileStrs = req.files.map((file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`);

                        const cloudinaryResponse = await CloudinaryUtil.uploadMultipleFile(userFromId, fileStrs);
                        console.log("cloudinaryResponse: ", cloudinaryResponse);

                        if (cloudinaryResponse) {
                            // save the db fields
                            const galleryFields = cloudinaryResponse.map((file) => {
                                return {
                                    url: file.secure_url,
                                    cloudinaryId: file.public_id,
                                    uploadAt: new Date(), // UTC date
                                };
                            });

                            userFromId.gallery.push(...galleryFields);

                            await userFromId.save();
                            
                            res.status(200).json({
                                message: "Multitple Files uploaded successfully",
                                data: cloudinaryResponse,
                            });
                        } else {
                            return res.status(500).json({
                                error: "Error uploading files to Cloudinary",
                                data: err,
                            });
                        }
                    } else {
                        return res.status(404).json({
                            error: "User not found",
                        });
                    }
                } catch (error) {
                    console.error("Error in uploadMultipleFiles:", error);
                    return res.status(500).json({
                        error: "Server error in uploadMultipleFiles UploadController",
                    });
                }
            } else {
                return res.status(400).json({
                    error: "No files uploaded",
                });
            }
        }
    });
};

module.exports = {
    uploadSingleFile,
    uploadMultipleFiles,
};

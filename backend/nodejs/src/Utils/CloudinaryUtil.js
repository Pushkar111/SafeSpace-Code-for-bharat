const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (userObject, filePath) => {
    try {
        const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
            // filename with name of user
            folder: `nodejs-learning/users/${userObject._id}/profile-pics`,
            public_id: `nodejs-learning/users/${userObject._id}/profile-pics/${userObject.name}`,
            resource_type: "image",
            overwrite: true,
        });

        console.log("Image uploaded to Cloudinary successfully : ", cloudinaryResponse.secure_url);

        return cloudinaryResponse;
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);

        return null;
    }
};

const uploadMultipleFile = async (userObject, filePaths) => {
    try {
        const uploadPromises = filePaths.map((filePath, index) => {
            return cloudinary.uploader.upload(filePath, {
                folder: `nodejs-learning/users/${userObject._id}/multiple-files`,
                public_id: `nodejs-learning/users/${userObject._id}/multiple-files/${userObject.name}-${index + 1}`,
                resource_type: "image",
                overwrite: true,
            });
        });

        const cloudinaryResponses = await Promise.all(uploadPromises);
        
        console.log("Multiple files uploaded to Cloudinary successfully:", cloudinaryResponses);
        return cloudinaryResponses;
    } catch (error) {
        console.error("Error uploading multiple files to Cloudinary:", error);
        return null;
    }
};

module.exports = {
    uploadFile,
    uploadMultipleFile,
};

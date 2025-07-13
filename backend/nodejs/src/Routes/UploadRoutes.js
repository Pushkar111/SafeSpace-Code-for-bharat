const router = require("express").Router();
const uploadController = require("../Controller/UploadController")
const authMiddleware = require("../Middleware/AuthMiddleware")

/* PUBLIC ROUTES */

router.use(authMiddleware.validateToken)


/* PROTECTED ROUTES */

// uploadSingleFile
router.post("/profile/:userId", uploadController.uploadSingleFile)

// uploadMultipleFiles
router.post("/gallery/:userId", uploadController.uploadMultipleFiles)


module.exports = router
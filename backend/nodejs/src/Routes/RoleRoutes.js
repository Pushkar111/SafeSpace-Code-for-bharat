const router = require("express").Router();
const roleController = require("../Controller/RoleController")

// 04-05-2024
router.post("/create", roleController.createRole)
router.get("/all", roleController.getAllRoles)

module.exports = router;
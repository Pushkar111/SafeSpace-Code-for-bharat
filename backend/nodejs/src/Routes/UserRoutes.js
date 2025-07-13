const router = require("express").Router();
const userController = require("../Controller/UserController");
const zodValidationMiddleware = require("../Middleware/ZodValidationMiddleware");
const UserValidationSchema = require("../ValidationSchema/UserValidationSchema");
const authMiddleware = require("../Middleware/AuthMiddleware")


// PUBLIC ROUTES

router.get("/me", authMiddleware.validateToken, userController.getCurrentUser)

// PROTECTED ROUTES
router.use(authMiddleware.validateToken)



// router.get("/getAllUsers",authMiddleware.validateToken, userController.getAllUsers); // 25-04-25 ---> getAllUsers ---> This route is protected by the validateToken middleware
router.get("/getAllUsers", userController.getAllUsers); 
router.get("/user/:id", userController.getUserById)
router.get("/getUserByMobile", userController.getUserByMobile)
router.get("/getUserByName", userController.getUserByName)
router.get("/getUserByEmail", userController.getUserByEmail)


// 20-04-25  ===> deleteUser
router.delete("/user/:id", userController.deleteUser)


// 03-05-25  ===> updateUser
router.put("/user/:id", userController.updateUser)






module.exports = router;    
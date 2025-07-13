const router = require("express").Router();
const authController = require("../Controller/AuthController");
const zodValidationMiddleware = require("../Middleware/ZodValidationMiddleware");
const UserValidationSchema = require("../ValidationSchema/UserValidationSchema");
const rateLimitMiddleware = require("../Middleware/RateLimitMiddleware");
const passport = require("passport");
const jwtUtil = require("../Utils/JwtUtil");
const UserModel = require("../Model/UserModel");


const authRateLimit = rateLimitMiddleware(5, 60); // 5 requests per minute
const generalRateLimit = rateLimitMiddleware(20, 60); // 20 requests per minute


// 19-04-25  ===> addUser, with jwt 
router.post("/addUser", generalRateLimit, zodValidationMiddleware(UserValidationSchema), authController.addUser)

// 24-05-25 ====> Authentication, Authorization

// 1. login with Email + Password 
router.post("/login/email-password", authRateLimit, authController.loginUserWithEmailPassword);

// 2. login with Mobile + Password 
router.post("/login/mobile-password", authRateLimit, authController.loginUserWithMobilePassword);

// 3. login with Email + OTP 
router.post("/login/email-otp/send", authRateLimit, authController.loginUserWithEmailOTP)
router.post("/login/email-otp/verify", authRateLimit, authController.verifyEmailOTP);

// 4. login with Mobile + OTP 
router.post("/login/mobile-otp/send", authRateLimit, authController.loginUserWithMobileOTP);
router.post("/login/mobile-otp/verify", authRateLimit, authController.verifyMobileOTP);

// 5. Google OAuth Login With Passport
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}))
router.get("/google/callback", passport.authenticate("google", {
    session: false, 
    failureRedirect: "/login"
}), 
    async (req, res) => {
        try {
            const user = req.user;

            const accessToken = jwtUtil.generateAccessToken(user._id);
            const refreshToken = jwtUtil.generateRefreshToken(user._id);

            await UserModel.findByIdAndUpdate(user._id, {refreshToken: refreshToken}, {new: true});

            console.log("Google OAuth callback successful:", user);

            res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        } catch (error) {
            console.error("Error in Google OAuth callback:", error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
    }
)

// 14-06-25 ===> refreshAccessToken, logoutUser
router.post("/refreshAccessToken", generalRateLimit, authController.refreshAccessToken);
router.post("/logout", generalRateLimit, authController.logoutUser); 

// 18-05-25 ===> forgetPassword, resetPassword
router.post("/forgetPassword", authRateLimit, authController.forgetPassword)
router.post("/resetPassword", authRateLimit, authController.resetPassword)



module.exports = router;    
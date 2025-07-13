const router = require("express").Router();
const passport = require("passport");
const authController = require("../Controller/AuthController");
const jwtUtil = require("../Utils/JwtUtil");
const UserModel = require("../Model/UserModel");
const EncryptUtil = require("../Utils/EncryptUtil");
const rateLimitMiddleware = require("../Middleware/RateLimitMiddleware");

const authRateLimit = rateLimitMiddleware(5, 60); // 5 requests per minute
const generalRateLimit = rateLimitMiddleware(20, 60); // 20 requests per minute

// SafeSpace specific auth routes
router.post("/register", authRateLimit, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Hash password
        const hashedPassword = EncryptUtil.encryptPassword(password);

        // Create user
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role: "user"
        });

        // Generate tokens
        const accessToken = jwtUtil.generateAccessToken(newUser._id);
        const refreshToken = jwtUtil.generateRefreshToken(newUser._id);

        // Update user with refresh token
        await UserModel.findByIdAndUpdate(newUser._id, { refreshToken });

        // Send welcome email asynchronously
        try {
            const emailQueue = require("../Redis/Queue/EmailQueue");
            await emailQueue.add("send-welcome-email", {
                name: newUser.name,
                email: newUser.email,
                userId: newUser._id
            });
        } catch (emailError) {
            console.error("Failed to queue welcome email:", emailError);
            // Don't fail registration if email fails
        }

        // Set HTTP-only cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post("/login", authRateLimit, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordValid = EncryptUtil.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate tokens
        const accessToken = jwtUtil.generateAccessToken(user._id);
        const refreshToken = jwtUtil.generateRefreshToken(user._id);

        // Update user with refresh token
        await UserModel.findByIdAndUpdate(user._id, { refreshToken });

        // Set HTTP-only cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post("/logout", async (req, res) => {
    try {
        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/me", async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "No access token provided"
            });
        }

        // Verify token
        const decoded = jwtUtil.verifyAccessToken(accessToken);
        const user = await UserModel.findById(decoded.userId).select('-password -refreshToken');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Auth check error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
});

// Routes for saved threats
router.get("/saved-threats", async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded = jwtUtil.verifyAccessToken(accessToken);
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Return saved threats (stored in user document)
        const savedThreats = user.savedThreats || [];
        res.status(200).json(savedThreats);
    } catch (error) {
        console.error("Get saved threats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post("/saved-threats", async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded = jwtUtil.verifyAccessToken(accessToken);
        const { threatId } = req.body;

        // Add threat to user's saved threats
        await UserModel.findByIdAndUpdate(decoded.userId, {
            $addToSet: { savedThreats: { id: threatId, savedAt: new Date() } }
        });

        res.status(200).json({
            success: true,
            message: "Threat saved successfully"
        });
    } catch (error) {
        console.error("Save threat error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Notification settings
router.put("/notifications/settings", async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded = jwtUtil.verifyAccessToken(accessToken);
        const { settings } = req.body;

        // Update user notification settings
        await UserModel.findByIdAndUpdate(decoded.userId, {
            notificationSettings: settings
        });

        res.status(200).json({
            success: true,
            message: "Notification settings updated"
        });
    } catch (error) {
        console.error("Update notification settings error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Google OAuth routes
router.get("/google", 
    generalRateLimit,
    passport.authenticate("google", { 
        scope: ["profile", "email"] 
    })
);

router.get("/google/callback", 
    generalRateLimit,
    passport.authenticate("google", { session: false }),
    async (req, res) => {
        try {
            const user = req.user;
            
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
            }
            
            // Generate tokens
            const accessToken = jwtUtil.generateAccessToken(user._id);
            const refreshToken = jwtUtil.generateRefreshToken(user._id);
            
            // Update user with refresh token
            await UserModel.findByIdAndUpdate(user._id, { refreshToken });
            
            // Set HTTP-only cookie
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            
            // Redirect to frontend dashboard
            res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        } catch (error) {
            console.error("Google OAuth callback error:", error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=token_error`);
        }
    }
);

module.exports = router;

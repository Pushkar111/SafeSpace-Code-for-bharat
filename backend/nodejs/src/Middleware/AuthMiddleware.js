const jwtUtils = require("../Utils/JwtUtil");
const UserModel = require("../Model/UserModel")

const validateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        if (authHeader.startsWith("Bearer ")) {
            const accessToken = authHeader.split(" ")[1];
            try {
                // 1. First check the accessToken is Blacklisted[logout] or not
                if (jwtUtils.isTokenBlacklisted(accessToken)) {
                    return res.status(401).json({
                        message: "Unauthorized access. Token has been revoked.",
                        code: "TOKEN_REVOKED"
                    });
                }

                // 2. Verify the accessToken
                const user = jwtUtils.verifyAccessToken(accessToken); // {userId, iat, exp}
                console.log("Authenticated User [AuthMiddleware]: ", user);

                // 3. Authorization logic can be added here if needed
                // For Example, Only allow access to certain roles
                const foundUser = await UserModel.findById(user.userId).populate("role", "name");
                console.log("Found User: ", foundUser);
                if(foundUser && foundUser.refreshToken && (foundUser.role.name === "ADMIN" || foundUser.role.name === "USER")) {
                    req.user = foundUser; // Attach user to request object for further use
                    next();
                } else if (foundUser.refreshToken === null) {
                    return res.status(401).json({
                        message: "Unauthorized access. User has no refresh token.",
                        code: "NO_REFRESH_TOKEN_IN_DB"
                    });
                } 
                else {
                    return res.status(403).json({
                        message: "Forbidden access. You do not have the required permissions.",
                        code: "FORBIDDEN"
                    }); 
                }
  
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        message: "Access token expired. Please refresh your token.",
                        code: "TOKEN_EXPIRED"
                    });
                } else {
                    return res.status(401).json({
                        message: "Unauthorized access. Invalid token.",
                        error: error.message
                    });
                }
            }
        } else {
            return res.status(401).json({
                message: "Unauthorized access. Token must start with 'Bearer '.",
            })
        }
    } else {
        return res.status(401).json({
            message: "Unauthorized access. No token provided.",
        });
    }
};


module.exports = {
    validateToken
}

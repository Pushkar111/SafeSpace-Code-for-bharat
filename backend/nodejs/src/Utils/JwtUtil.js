const jwt = require("jsonwebtoken");
const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || "test";
const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m";
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || "test";
const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d";

const refreshTokens = new Set();
const blacklistedTokens = new Set();

// generate access token [short time]
const generateAccessToken = (userId) => {
    const accessToken = jwt.sign({ userId }, JWT_ACCESS_TOKEN_SECRET, { expiresIn: JWT_ACCESS_TOKEN_EXPIRY });
    return accessToken;
};

// generate refresh token [long time]
const generateRefreshToken = (userId) => {
    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_TOKEN_SECRET, { expiresIn: JWT_REFRESH_TOKEN_EXPIRY });
    refreshTokens.add(refreshToken);
    return refreshToken;
};

// verify accessToken
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);
        return decoded;
    } catch (error) {
        throw error;
    }
};

// verify refreshToken
const verifyRefreshToken = (token) => {
    try {
        // check token is present in the refreshTokens store or not
        if (refreshTokens.has(token)) {
            const decoded = jwt.verify(token, JWT_REFRESH_TOKEN_SECRET);
            return decoded;
        } else {
            throw new Error("Invalid refresh token");
        }
    } catch (error) {
        throw error;
    }
};

// refreshAccessToken using refreshToken [for re-login]
const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return true; // Token is invalid or does not have an expiration
        }
        const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
        return currentTimestamp > decoded.exp; // Check if token is expired
    } catch (error) {
        return true; // If there's an error decoding, consider it expired
    }
};
const refreshAccessToken = (refreshToken) => {
    try {
        const decoded = verifyRefreshToken(refreshToken);
        const userId = decoded.userId;

        const newAccessTokenFromRefresh = generateAccessToken({ _id: userId });
        return newAccessTokenFromRefresh;
    } catch (error) {
        throw error;
    }
};

// Invalidate Refresh token [for logout]
const invalidateRefreshToken = (token) => {
    try {
        // check token is present in the refreshTokens store or not
        if (refreshTokens.has(token)) {
            refreshTokens.delete(token);
            return true; // Successfully invalidated
        } else {
            throw new Error("Invalid refresh token");
        }
    } catch (error) {
        throw error;
    }
};
// Blacklist access token
const blacklistAccessToken = (token) => {
    blacklistedTokens.add(token);
    return true;
};
const isTokenBlacklisted = (token) => {
    return blacklistedTokens.has(token);
}


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    isTokenExpired,
    refreshAccessToken,
    invalidateRefreshToken,
    blacklistAccessToken,
    isTokenBlacklisted
};

// const generateToken = (userObject) => {
//     const token = jwt.sign(userObject, JWT_SECRET, {expiresIn: JWT_EXPIRY})

//     return token;
// }

// const verifyToken = (token) => {
//     const decoded = jwt.verify(token, JWT_SECRET);

//     return decoded;
// }

// module.exports = {
//     generateToken,
//     verifyToken
// }

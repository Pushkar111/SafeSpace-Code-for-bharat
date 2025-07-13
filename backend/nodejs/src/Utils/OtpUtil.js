const redisConnection = require("../Redis/Config/RedisConfig")
const Redis = require("ioredis")

const redisClient = new Redis(redisConnection)

// Generate 6-Digit OTP 
const generateOTP = ()=> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
}

// Store OTP in Redis with a TTL(Time to live) of 5 minutes
const storeOTP = async (key, otp) => {
    try {
        await redisClient.set(`otp:${otp}`, otp, 'EX', 300); // 300 seconds = 5 minutes
        return true;
    } catch (error) {
        console.error("OtpUtil :: Error storing OTP in Redis:", error);
        return false;
    }
}

// Verify OTP from Redis
const verifyOTP = async (key, otp) => { // key - email or mobile
    try {
        const storedOTP = await redisClient.get(`otp:${otp}`);

        if (!storedOTP) {
            return {
                valid: false,
                message: "OTP expired or not found."
            }
        }

        if (storedOTP === otp) {
            // delete the OTP (means OTP expired) after successful verification
            await redisClient.del(`otp:${otp}`);
            return {
                valid: true,
                message: "OTP verified successfully."
            }
        } else {
            return {
                valid: false,
                message: "Invalid OTP."
            }
        }
    } catch (error ){
        console.error("OtpUtil :: Error verifying OTP in Redis:", error);
        return false;
    }
}

module.exports = {
    generateOTP, 
    storeOTP, 
    verifyOTP
}
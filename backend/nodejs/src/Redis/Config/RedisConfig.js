const Redis = require("ioredis")
const dotenv = require("dotenv")
dotenv.config()

const redisConnection = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || "",
    maxRetriesPerRequest: null, // ioredis redisConnection will retry forever unless you manually stop the connection,  by default - 20 [will retry failed commands 20 times then shows error]
})

redisConnection.on("connect", () => {
    console.log("Redis connected successfully")
})

redisConnection.on("error", (error) => {
    console.log(`Redis connection error: ${error.message}`);
})


module.exports = redisConnection
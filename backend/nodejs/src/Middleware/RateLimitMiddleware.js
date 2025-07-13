/*
    use this middleware to limit the number of requests a user can make to the API
    limit: max requests allows per window
    duration: time window in seconds
*/
const redisConnection = require("../Redis/Config/RedisConfig")

const rateLimitMiddleware = (limit = 100, duration = 60) => {
    return async (req, res, next) => {
        try {
// get ip address
        const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    
        // unique key
        const rateLimitKey = `rate_limit:${clientId}`;

        console.log(`RateLimitMiddleware :: Rate Limit check for client ID: ${clientId} with rateLimitKey: ${rateLimitKey}`);
    
        const currentCount = await redisConnection.get(rateLimitKey);

        if (currentCount == null) {
            // first request, set the count and expiration
            await redisConnection.set(rateLimitKey, 1, 'EX', duration);
            console.log(`RateLimitMiddleware :: First request for client ID: ${clientId}, setting count to 1/${limit} `);
        
            res.set({
                'X-RateLimit-Limit': limit,
                'X-RateLimit-Remaining': limit - 1,
                'X-RateLimit-Reset': new Date(Date.now() + duration * 1000).toISOString()
            })
            
            return next();
        } else {
            // increment the count
            const newCount = await redisConnection.incr(rateLimitKey);
            console.log(`RateLimitMiddleware :: Incremented request count for client ID: ${clientId} to ${newCount}/${limit}`);

            if (newCount > limit) {
                console.log(`RateLimitMiddleware :: Rate limit exceeded for client ID: ${clientId}`);
                return res.status(429).json({
                    message: "Rate limit exceeded. Please try again later.",
                    status: "error"
                });
            }

            res.set({
                'X-RateLimit-Limit': limit,
                'X-RateLimit-Remaining': limit - newCount,
                'X-RateLimit-Reset': new Date(Date.now() + duration * 1000).toISOString()
            });

            return next();
        }
        } catch (error) {
            console.error(`RateLimitMiddleware :: Error in rate limiting middleware: ${error.message}`);
            return res.status(500).json({
                message: "Internal server error",
                status: "error"
            });
        }
    }
}

module.exports = rateLimitMiddleware;
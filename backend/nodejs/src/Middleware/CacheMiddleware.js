const { getCache, setCache } = require("../Redis/Cache/RedisCache");

/*
    prefix: cache key prefix (e.g., 'user:', 'product:')
    ttl: time to live in seconds (default is 3600 seconds or 1 hour)
*/
const cacheMiddleware = (prefix, ttl = 3600) => {
    return async(req, res, next) => {

        if (req.method !== 'GET') {
            return next();
        }
        const cacheKey = `${prefix}:${req.originalUrl}`;
        try {
            const cachedData = await getCache(cacheKey);

            if(cachedData) {
                console.log(`Cache HIT for key: ${cacheKey}`);
                return res.status(200).json({
                    message: "Cache HIT: Data retrieved from cache",
                    data: cachedData,
                    fromCache: true // Indicate that the response is from cache
                })
            } else {
                // if cache MISS, replace the original res.json method
                console.log(`Cache MISS for key: ${cacheKey}`);
                const originalJson = res.json.bind(res);
                res.json = function(body) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        setCache(cacheKey, body.data, ttl).catch(err => console.error(`Error setting cache for key ${cacheKey}:`, err));
                    }

                    return originalJson.call(res, body)
                } 
                next();
            }
        } catch (error) {
            console.log(`cacheMiddleware error for key ${cacheKey}:${error.message}`);
            next();   
        }
    }
}


module.exports = cacheMiddleware
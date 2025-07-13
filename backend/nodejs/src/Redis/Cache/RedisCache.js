const redisConnection = require("../Config/RedisConfig");

const getCache = async(key) => {
    try {
        const cachedData = await redisConnection.get(key);
        
        if(cachedData) {
            console.log(`Cache HIT for key: ${key}`);
            return JSON.parse(cachedData);
        }else {
            console.log(`Cache MISS for key: ${key}`);
            return null;
        }
    } catch (error) {
        console.error(`Error getting cache for key ${key}:`, error);
        return null;
    }
}

/*
    key   = cache key
    value = data to cache
    ttl   = time to live in seconds (default is 3600 seconds or 1 hour)
*/
const setCache = async(key, value, ttl = 3600) => {
    try {
        await redisConnection.set(key, JSON.stringify(value), 'EX', ttl);
        console.log(`Cache set for key: ${key} with TTL: ${ttl} seconds`);
        return true;
    } catch(error) {
        console.log(`Error setting cache for key ${key}: `, error);
        return false;
    }
}


const deleteCache = async(key) => {
    try {
        const result = await redisConnection.del(key);
        if(result === 1) {
            console.log(`Cache deleted for key: ${key}`);
            return true;
        } else {
            console.log(`No cache found for key: ${key}`);
            return false;
        }
    } catch(error) {
        console.log(`Error deleting cache for key ${key}: `, error);
        return false;
    }
}


const deleteCacheByPattern = async(pattern) => {
    try {
        const keys = await redisConnection.keys(pattern);
        if(keys.length > 0) {
            const result = await redisConnection.del(keys);
            console.log(`Cache deleted for keys matching pattern: ${pattern}`);
            return result;
        } else {
            console.log(`No cache found for pattern: ${pattern}`);
            return 0;
        }
    } catch(error) {
        console.log(`Error deleting cache for pattern ${pattern}: `, error);
        return 0;
    }
}



// implementing this in cache middleware
module.exports = {
    getCache, 
    setCache,
    deleteCache, 
    deleteCacheByPattern
}
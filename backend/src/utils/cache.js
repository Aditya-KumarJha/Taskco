import redis from '../config/redis.js';
import logger from './logger.js';

/**
 * Cache utility functions for Redis operations
 */

// Default TTL values (in seconds)
export const TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  DAY: 86400,      // 24 hours
};

/**
 * Generate cache key with prefix
 */
export const generateKey = (prefix, id) => {
  return `${prefix}:${id}`;
};

/**
 * Set cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds
 */
export const setCache = async (key, value, ttl = TTL.MEDIUM) => {
  try {
    if (!redis) return false;
    
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.set(key, stringValue, 'EX', ttl);
    return true;
  } catch (error) {
    logger.error(`Redis SET error: ${error.message}`);
    return false;
  }
};

/**
 * Get cache value
 * @param {string} key - Cache key
 * @param {boolean} parse - Whether to JSON.parse the result
 */
export const getCache = async (key, parse = true) => {
  try {
    if (!redis) return null;
    
    const value = await redis.get(key);
    if (!value) return null;
    
    return parse ? JSON.parse(value) : value;
  } catch (error) {
    logger.error(`Redis GET error: ${error.message}`);
    return null;
  }
};

/**
 * Delete cache by key
 * @param {string} key - Cache key or pattern
 */
export const deleteCache = async (key) => {
  try {
    if (!redis) return false;
    
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error(`Redis DEL error: ${error.message}`);
    return false;
  }
};

/**
 * Delete cache by pattern
 * @param {string} pattern - Pattern to match (e.g., 'user:*')
 */
export const deleteCachePattern = async (pattern) => {
  try {
    if (!redis) return false;
    
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    logger.error(`Redis DEL pattern error: ${error.message}`);
    return false;
  }
};

/**
 * Check if cache exists
 * @param {string} key - Cache key
 */
export const cacheExists = async (key) => {
  try {
    if (!redis) return false;
    
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    logger.error(`Redis EXISTS error: ${error.message}`);
    return false;
  }
};

/**
 * Cache middleware factory
 * Creates a middleware that caches responses
 */
export const cacheMiddleware = (ttl = TTL.MEDIUM, keyGenerator) => {
  return async (req, res, next) => {
    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req) 
        : generateKey(req.path, req.user?._id || 'guest');
      
      // Check if cached
      const cached = await getCache(cacheKey);
      
      if (cached) {
        logger.debug(`Cache HIT: ${cacheKey}`);
        return res.status(200).json(cached);
      }
      
      logger.debug(`Cache MISS: ${cacheKey}`);
      
      // Store original json function
      const originalJson = res.json.bind(res);
      
      // Override json to cache response
      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode < 400) {
          setCache(cacheKey, data, ttl).catch(err => {
            logger.error(`Cache set error: ${err.message}`);
          });
        }
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error.message}`);
      next();
    }
  };
};

/**
 * Invalidate user-related caches
 */
export const invalidateUserCache = async (userId) => {
  try {
    await deleteCachePattern(`user:${userId}*`);
    await deleteCachePattern(`profile:${userId}*`);
    await deleteCachePattern(`tasks:${userId}*`);
    return true;
  } catch (error) {
    logger.error(`Invalidate user cache error: ${error.message}`);
    return false;
  }
};

/**
 * Invalidate admin caches
 */
export const invalidateAdminCache = async () => {
  try {
    await deleteCachePattern('admin:*');
    return true;
  } catch (error) {
    logger.error(`Invalidate admin cache error: ${error.message}`);
    return false;
  }
};

/**
 * Invalidate task-related caches
 */
export const invalidateTaskCache = async (userId, taskId = null) => {
  try {
    await deleteCachePattern(`tasks:${userId}*`);
    if (taskId) {
      await deleteCache(`task:${taskId}`);
    }
    // Also invalidate admin task caches
    await deleteCachePattern('admin:tasks*');
    return true;
  } catch (error) {
    logger.error(`Invalidate task cache error: ${error.message}`);
    return false;
  }
};

export default {
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  cacheExists,
  cacheMiddleware,
  invalidateUserCache,
  invalidateAdminCache,
  invalidateTaskCache,
  generateKey,
  TTL,
};

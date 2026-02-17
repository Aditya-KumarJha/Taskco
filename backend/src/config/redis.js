class FakeRedis {
    constructor() {
        this.store = new Map();
        this.expires = new Map();
        this.sets = new Map(); 
    }
    async set(key, value, ...args) {
        if (args && args.length >= 2) {
            const exIndex = args.findIndex(a => String(a).toUpperCase() === 'EX');
            if (exIndex !== -1 && args[exIndex + 1] != null) {
                const seconds = Number(args[exIndex + 1]);
                const expireAt = Date.now() + seconds * 1000;
                this.expires.set(key, expireAt);
            } else {
                this.expires.delete(key);
            }
        } else {
            this.expires.delete(key);
        }
        this.store.set(key, value);
        return 'OK';
    }
    async get(key) {
        const exp = this.expires.get(key);
        if (exp && Date.now() > exp) {
            this.store.delete(key);
            this.expires.delete(key);
            return null;
        }
        return this.store.has(key) ? this.store.get(key) : null;
    }
    async del(key) {
        const existed = this.store.has(key) ? 1 : 0;
        this.store.delete(key);
        this.expires.delete(key);
        this.sets.delete(key);
        return existed;
    }
    async exists(key) {
        const exp = this.expires.get(key);
        if (exp && Date.now() > exp) {
            this.store.delete(key);
            this.expires.delete(key);
            return 0;
        }
        return this.store.has(key) ? 1 : 0;
    }
    async expire(key, seconds) {
        if (this.store.has(key) || this.sets.has(key)) {
            const expireAt = Date.now() + seconds * 1000;
            this.expires.set(key, expireAt);
            return 1;
        }
        return 0;
    }
    async sadd(key, ...members) {
        if (!this.sets.has(key)) {
            this.sets.set(key, new Set());
        }
        const set = this.sets.get(key);
        let added = 0;
        for (const member of members) {
            if (!set.has(member)) {
                set.add(member);
                added++;
            }
        }
        return added;
    }
    async srem(key, ...members) {
        if (!this.sets.has(key)) {
            return 0;
        }
        const set = this.sets.get(key);
        let removed = 0;
        for (const member of members) {
            if (set.has(member)) {
                set.delete(member);
                removed++;
            }
        }
        if (set.size === 0) {
            this.sets.delete(key);
        }
        return removed;
    }
    async smembers(key) {
        const exp = this.expires.get(key);
        if (exp && Date.now() > exp) {
            this.sets.delete(key);
            this.expires.delete(key);
            return [];
        }
        if (!this.sets.has(key)) {
            return [];
        }
        return Array.from(this.sets.get(key));
    }
    async keys(pattern) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return Array.from(this.store.keys()).filter(key => regex.test(key));
    }
    on() { /* no-op in tests */ }
    quit() { return Promise.resolve(); }
}

import logger from '../utils/logger.js';

let redisClient = null;

async function initializeRedis() {
    if (process.env.NODE_ENV === 'test') {
        return new FakeRedis();
    }
    
    try {
        const Redis = await import('ioredis');
        const RedisClient = Redis.default || Redis.Redis;

        const redis = new RedisClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            retryStrategy: (times) => {
                if (times > 3) {
                    logger.error('Redis connection failed after 3 retries. Continuing without cache.');
                    return null;
                }
                const delay = Math.min(times * 200, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
        });

        redis.on('connect', () => {
            logger.info('Connected to Redis');
        });

        redis.on('error', (err) => {
            logger.error(`Redis connection error: ${err.message}`);
        });

        redis.on('close', () => {
            logger.warn('Redis connection closed');
        });

        await redis.connect().catch((err) => {
            logger.error(`Failed to connect to Redis: ${err.message}`);
            logger.warn('Application will continue without Redis cache.');
        });

        return redis;
    } catch (error) {
        logger.error(`Redis initialization error: ${error.message}`);
        return null;
    }
}

if (!redisClient) {
    redisClient = await initializeRedis();
}

export default redisClient;

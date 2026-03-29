import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { createClient } from 'redis'

// Connecting to Upstash Serverless Redis
const redisClient = createClient({
    url: process.env.UPSTASH_REDIS_CONNECTION_STRING
})

// If error connecting
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect 
await redisClient.connect();

// limits 3 request per user per minute
export const aiBurstLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    keyGenerator: (req) => req.auth.userId,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'limit:burst:'
    }),
    message: { error: "Slow down! Too many uploads at once." }
})

// limits 20 request per day per user
export const aiDailyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 20,
    keyGenerator: (req) => req.auth.userId,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'limit:daily:'
    }),
    message: { message: "Daily entry limit reached." }
})

// limits 100 requests  per min per user
export const standardDbLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    keyGenerator: (req) => req.auth.userId,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'limit:db:'
    }),
    message: { error: "Too many database requests. Please slow down." }
})

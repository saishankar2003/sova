import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisOptional } from '../config/redis';

function makeStore() {
  const redis = getRedisOptional();
  if (!redis) return undefined; // falls back to in-memory
  return new RedisStore({
    // @ts-expect-error — sendCommand signature differs between ioredis versions
    sendCommand: (...args: string[]) => redis.call(...args),
  });
}

/** General API rate limiter: 100 requests per minute */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please try again later.',
    },
  },
});

/** Strict rate limiter for auth endpoints: 5 requests per minute */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});

/** Upload rate limiter: 20 uploads per minute */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many uploads. Please try again later.',
    },
  },
});

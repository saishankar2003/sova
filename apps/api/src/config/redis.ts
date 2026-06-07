import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export function initRedis(): Redis | null {
  if (!env.REDIS_URL) {
    logger.warn('⚠️  Redis not configured — job queues will not work');
    return null;
  }

  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis error:', err.message);
  });

  return redisClient;
}

export function getRedis(): Redis {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initRedis() first.');
  }
  return redisClient;
}

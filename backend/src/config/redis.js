const { createClient } = require('redis');
require('dotenv').config();

/**
 * Redis client configuration for Bull queue and caching
 */
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  // Silently ignore connection errors - Redis is optional
  if (!err.message.includes('ECONNREFUSED')) {
    console.error('❌ Redis Client Error:', err.message);
  }
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

/**
 * Initialize Redis connection
 */
const initializeRedis = async () => {
  try {
    // Add timeout to prevent hanging
    const connectWithTimeout = Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
    ]);
    await connectWithTimeout;
    return redisClient;
  } catch (error) {
    // Silently fail - Redis is optional
    return null;
  }
};

/**
 * Redis connection options for Bull
 */
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

module.exports = { redisClient, initializeRedis, redisConfig };

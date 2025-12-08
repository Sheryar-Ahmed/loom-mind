const Bull = require('bull');
const { redisConfig } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Bull Queue Configuration
 * Handles background job processing
 */

// Check if Redis is configured
const isRedisConfigured = redisConfig.host && redisConfig.port;

let captureQueue = null;

if (isRedisConfigured) {
  try {
    // Create capture processing queue
    captureQueue = new Bull('capture-processing', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    // Queue event listeners
    captureQueue.on('completed', (job, result) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    captureQueue.on('failed', (job, err) => {
      logger.error(`Job ${job.id} failed:`, err.message);
    });

    captureQueue.on('error', (error) => {
      // Silently handle Redis connection errors - they're expected without Redis
      if (!error.message.includes('ECONNREFUSED')) {
        logger.error('Queue error:', error);
      }
    });

    logger.info('✅ Bull queue initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize Bull queue:', error.message);
    logger.warn('⚠️  Background processing will not be available');
  }
} else {
  logger.warn('⚠️  Redis not configured. Background processing disabled.');
}

/**
 * Mock queue for when Redis is not available
 */
const mockQueue = {
  add: async (name, data) => {
    logger.warn(`Mock queue: Job "${name}" would be processed if Redis was configured`);
    return { id: 'mock-job-id' };
  },
  process: () => {
    logger.warn('Mock queue: Processor registered but will not execute');
  },
};

module.exports = {
  captureQueue: captureQueue || mockQueue,
  isQueueEnabled: !!captureQueue,
};

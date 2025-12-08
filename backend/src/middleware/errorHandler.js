const { ApiError } = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Catches all errors and sends standardized error responses
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  if (err.statusCode >= 500) {
    logger.error(`${err.message}`, { stack: err.stack, url: req.url, method: req.method });
  } else {
    logger.warn(`${err.message}`, { url: req.url, method: req.method });
  }

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle TypeORM errors
  if (err.name === 'QueryFailedError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Database query failed',
        code: 'DATABASE_ERROR',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
    });
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds limit';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    }
    return res.status(400).json({
      success: false,
      error: {
        message,
        code: 'UPLOAD_ERROR',
      },
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'development' ? message : 'Something went wrong',
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'NOT_FOUND',
    },
  });
};

module.exports = { errorHandler, notFoundHandler };

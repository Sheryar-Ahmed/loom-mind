/**
 * Custom API Error Class
 * Provides structured error handling with error codes
 */
class ApiError extends Error {
  /**
   * Create an API error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - User-friendly error message
   * @param {string} code - Error code for client handling
   * @param {Object} details - Additional error details (e.g., validation errors)
   */
  constructor(statusCode, message, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.success = false;
    
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    const error = {
      success: false,
      error: {
        message: this.message,
        code: this.code,
      },
    };

    if (this.details) {
      error.error.details = this.details;
    }

    return error;
  }
}

/**
 * Pre-defined error factory functions
 */

const BadRequestError = (message, details = null) => {
  return new ApiError(400, message, 'BAD_REQUEST', details);
};

const ValidationError = (message, details = null) => {
  return new ApiError(400, message, 'VALIDATION_ERROR', details);
};

const UnauthorizedError = (message = 'Authentication required') => {
  return new ApiError(401, message, 'UNAUTHORIZED');
};

const ForbiddenError = (message = 'Access denied') => {
  return new ApiError(403, message, 'FORBIDDEN');
};

const NotFoundError = (resource = 'Resource') => {
  return new ApiError(404, `${resource} not found`, 'NOT_FOUND');
};

const ConflictError = (message) => {
  return new ApiError(409, message, 'CONFLICT');
};

const InternalError = (message = 'Internal server error') => {
  return new ApiError(500, message, 'INTERNAL_ERROR');
};

const RateLimitError = (message = 'Too many requests') => {
  return new ApiError(429, message, 'RATE_LIMIT_EXCEEDED');
};

module.exports = {
  ApiError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
  RateLimitError,
};

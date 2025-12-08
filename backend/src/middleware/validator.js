const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/ApiError');

/**
 * Validation Middleware
 * Checks express-validator results and throws ApiError if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = {};
    
    errors.array().forEach((error) => {
      if (!errorDetails[error.path]) {
        errorDetails[error.path] = [];
      }
      errorDetails[error.path].push(error.msg);
    });

    throw ValidationError('Validation failed', errorDetails);
  }
  
  next();
};

module.exports = validate;

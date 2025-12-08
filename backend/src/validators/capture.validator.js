const { body, query } = require('express-validator');

/**
 * Validation rules for capture endpoints
 */

const createCaptureValidation = [
  body('type')
    .isIn(['url', 'text', 'image', 'file', 'note'])
    .withMessage('Type must be one of: url, text, image, file, note'),
  
  body('url')
    .if(body('type').equals('url'))
    .notEmpty()
    .withMessage('URL is required for URL captures')
    .isURL()
    .withMessage('Invalid URL format'),
  
  body('text')
    .if(body('type').equals('text'))
    .notEmpty()
    .withMessage('Text is required for text captures')
    .isLength({ max: 50000 })
    .withMessage('Text cannot exceed 50,000 characters'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Title cannot exceed 500 characters'),
  
  body('tags')
    .optional()
    .customSanitizer((value) => {
      // Parse JSON string from FormData
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return [];
        }
      }
      return value;
    })
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('collectionIds')
    .optional()
    .customSanitizer((value) => {
      // Parse JSON string from FormData
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return [];
        }
      }
      return value;
    })
    .isArray()
    .withMessage('Collection IDs must be an array'),
];

const updateCaptureValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Title cannot exceed 500 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
];

const listCapturesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('type')
    .optional()
    .isIn(['url', 'text', 'image', 'file', 'note'])
    .withMessage('Invalid capture type'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Order must be ASC or DESC'),
];

module.exports = {
  createCaptureValidation,
  updateCaptureValidation,
  listCapturesValidation,
};

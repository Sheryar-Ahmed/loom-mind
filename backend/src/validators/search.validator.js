const { body, query } = require('express-validator');

/**
 * Validation rules for search endpoints
 */

const searchValidation = [
  body('query')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Search query must be between 1 and 500 characters'),
  
  body('types')
    .optional()
    .isArray()
    .withMessage('Types must be an array'),
  
  body('types.*')
    .optional()
    .isIn(['url', 'text', 'image', 'file', 'note'])
    .withMessage('Invalid capture type'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('collectionId')
    .optional()
    .isUUID()
    .withMessage('Invalid collection ID'),
  
  body('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateFrom'),
  
  body('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateTo'),
  
  body('sortBy')
    .optional()
    .isIn(['relevance', 'createdAt', 'updatedAt', 'title'])
    .withMessage('Invalid sort field'),
  
  body('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Order must be ASC or DESC'),
  
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  searchValidation,
};

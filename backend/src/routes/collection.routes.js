const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collection.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { body, param, query } = require('express-validator');

// Validation rules
const createCollectionValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Collection name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

const updateCollectionValidation = [
  param('id').isUUID().withMessage('Invalid collection ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Collection name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

const capturesValidation = [
  param('id').isUUID().withMessage('Invalid collection ID'),
  body('captureIds')
    .isArray({ min: 1 })
    .withMessage('captureIds must be a non-empty array'),
  body('captureIds.*')
    .isUUID()
    .withMessage('Each capture ID must be a valid UUID'),
];

// Routes
router.post(
  '/',
  authenticate,
  createCollectionValidation,
  validate,
  collectionController.createCollection
);

router.get(
  '/',
  authenticate,
  collectionController.getUserCollections
);

router.get(
  '/public',
  collectionController.getPublicCollections
);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid collection ID')],
  validate,
  collectionController.getCollection
);

router.put(
  '/:id',
  authenticate,
  updateCollectionValidation,
  validate,
  collectionController.updateCollection
);

router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid collection ID')],
  validate,
  collectionController.deleteCollection
);

router.post(
  '/:id/captures',
  authenticate,
  capturesValidation,
  validate,
  collectionController.addCaptures
);

router.delete(
  '/:id/captures',
  authenticate,
  capturesValidation,
  validate,
  collectionController.removeCaptures
);

module.exports = router;

const express = require('express');
const router = express.Router();
const captureController = require('../controllers/capture.controller');
const { authenticate } = require('../middleware/auth');
const { uploadFile } = require('../middleware/upload');
const validate = require('../middleware/validator');
const {
  createCaptureValidation,
  updateCaptureValidation,
  listCapturesValidation,
} = require('../validators/capture.validator');

/**
 * Capture Routes
 */

// All routes require authentication
router.use(authenticate);

router.get('/recent', captureController.getRecentCaptures);
router.get('/', listCapturesValidation, validate, captureController.listCaptures);
router.post(
  '/',
  uploadFile.single('file'),
  createCaptureValidation,
  validate,
  captureController.createCapture
);
router.get('/:id', captureController.getCaptureById);
router.put('/:id', updateCaptureValidation, validate, captureController.updateCapture);
router.delete('/:id', captureController.deleteCapture);
router.post('/:id/reprocess', captureController.reprocessCapture);

module.exports = router;

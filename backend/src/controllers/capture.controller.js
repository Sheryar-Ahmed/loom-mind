const asyncHandler = require('../utils/asyncHandler');
const { success, created, updated, deleted, paginated } = require('../utils/ApiResponse');
const captureService = require('../services/capture.service');
const storageService = require('../services/storage.service');
const { captureQueue, isQueueEnabled } = require('../jobs/queue');
const { processCaptureSync } = require('../jobs/syncProcessor');
const logger = require('../utils/logger');

/**
 * Capture Controller
 * Handles capture-related HTTP requests
 */

/**
 * @route   POST /api/captures
 * @desc    Create new capture
 * @access  Private
 */
exports.createCapture = asyncHandler(async (req, res) => {
  const { type, title, url, text, tags, collectionIds } = req.body;
  const userId = req.user.id;

  let imageUrl = null;

  // Handle file upload
  if (req.file && (type === 'image' || type === 'file')) {
    imageUrl = await storageService.uploadFile(req.file, type === 'image' ? 'images' : 'files');
  }

  // Create capture
  const capture = await captureService.createCapture(userId, {
    type,
    title,
    url,
    text,
    imageUrl,
    tags,
    collectionIds,
  });

  // Process capture (async with queue or sync without Redis)
  if (isQueueEnabled) {
    try {
      await captureQueue.add('processCapture', {
        captureId: capture.id,
        type,
        url,
        imageUrl,
      });
      logger.info(`Queued processing for capture ${capture.id}`);
    } catch (error) {
      logger.error('Failed to queue capture processing:', error);
    }
  } else {
    // Process synchronously without blocking response
    processCaptureSync(capture.id, type, url, imageUrl).catch(error => {
      logger.error('Sync processing failed:', error);
    });
    logger.info(`Started sync processing for capture ${capture.id}`);
  }

  created(res, capture, 'Capture created successfully');
});

/**
 * @route   GET /api/captures
 * @desc    List user's captures
 * @access  Private
 */
exports.listCaptures = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page, limit, type, tags, collectionId, sortBy, order, search } = req.query;

  const result = await captureService.listCaptures(userId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    type,
    tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
    collectionId,
    sortBy,
    order,
    search,
  });

  paginated(res, result.captures, result.pagination);
});

/**
 * @route   GET /api/captures/recent
 * @desc    Get recent captures
 * @access  Private
 */
exports.getRecentCaptures = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;

  const captures = await captureService.getRecentCaptures(userId, limit);

  success(res, captures);
});

/**
 * @route   GET /api/captures/:id
 * @desc    Get single capture
 * @access  Private
 */
exports.getCaptureById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const captureId = req.params.id;

  const capture = await captureService.getCaptureById(captureId, userId);

  success(res, capture);
});

/**
 * @route   PUT /api/captures/:id
 * @desc    Update capture
 * @access  Private
 */
exports.updateCapture = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const captureId = req.params.id;
  const updates = req.body;

  const capture = await captureService.updateCapture(captureId, userId, updates);

  updated(res, capture, 'Capture updated successfully');
});

/**
 * @route   DELETE /api/captures/:id
 * @desc    Delete capture
 * @access  Private
 */
exports.deleteCapture = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const captureId = req.params.id;

  // Get capture to delete associated files
  const capture = await captureService.getCaptureById(captureId, userId);

  // Delete associated files
  if (capture.imageUrl) {
    await storageService.deleteFile(capture.imageUrl);
  }
  if (capture.thumbnailUrl) {
    await storageService.deleteFile(capture.thumbnailUrl);
  }

  await captureService.deleteCapture(captureId, userId);

  deleted(res, 'Capture deleted successfully');
});

/**
 * @route   POST /api/captures/:id/reprocess
 * @desc    Reprocess failed capture
 * @access  Private
 */
exports.reprocessCapture = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const captureId = req.params.id;

  const capture = await captureService.getCaptureById(captureId, userId);

  // Update status to pending
  await captureService.updateProcessingResult(captureId, {
    status: 'pending',
  });

  // Re-queue or reprocess synchronously
  if (isQueueEnabled) {
    await captureQueue.add('processCapture', {
      captureId: capture.id,
      type: capture.type,
      url: capture.url,
      imageUrl: capture.imageUrl,
    });
    success(res, null, 'Capture reprocessing queued');
  } else {
    processCaptureSync(capture.id, capture.type, capture.url, capture.imageUrl).catch(error => {
      logger.error('Sync reprocessing failed:', error);
    });
    success(res, null, 'Capture reprocessing started');
  }
});

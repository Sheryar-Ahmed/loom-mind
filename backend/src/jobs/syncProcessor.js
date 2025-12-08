const captureService = require('../services/capture.service');
const urlFetcherService = require('../services/urlFetcher.service');
const ocrService = require('../services/ocr.service');
const storageService = require('../services/storage.service');
const logger = require('../utils/logger');
const path = require('path');

/**
 * Synchronous Capture Processor
 * Processes captures immediately without Redis/Bull queue
 */

async function processCaptureSync(captureId, type, url, imageUrl) {
  logger.info(`Synchronously processing capture ${captureId} of type ${type}`);

  try {
    // Update status to processing
    await captureService.updateProcessingResult(captureId, {
      status: 'processing',
    });

    let result = {};

    switch (type) {
      case 'url':
        result = await processUrl(url);
        break;

      case 'image':
        result = await processImage(imageUrl);
        break;

      case 'text':
      case 'note':
        result = { status: 'completed' };
        break;

      case 'file':
        result = await processFile(imageUrl);
        break;

      default:
        result = { status: 'completed' };
    }

    // Update capture with results
    await captureService.updateProcessingResult(captureId, {
      status: 'completed',
      ...result,
    });

    logger.info(`Capture ${captureId} processed successfully`);
    return { success: true, captureId };
  } catch (error) {
    logger.error(`Failed to process capture ${captureId}:`, error);

    // Update status to failed
    await captureService.updateProcessingResult(captureId, {
      status: 'failed',
      metadata: { error: error.message },
    });

    throw error;
  }
}

/**
 * Process URL capture
 */
async function processUrl(url) {
  try {
    const data = await urlFetcherService.fetchUrl(url);

    return {
      title: data.title,
      text: data.text,
      domain: data.domain,
      summary: data.summary,
      author: data.author,
      publishedDate: data.publishedDate,
      language: data.language,
      favicon: data.favicon,
      imageUrl: data.imageUrl,
    };
  } catch (error) {
    logger.error('URL processing failed:', error);
    return {
      title: url,
      domain: new URL(url).hostname,
    };
  }
}

/**
 * Process image capture (OCR)
 */
async function processImage(imageUrl) {
  try {
    // Only run OCR on local files
    if (imageUrl && imageUrl.includes('/uploads/')) {
      const relativePath = imageUrl.split('/uploads/')[1];
      const imagePath = path.join(__dirname, '..', '..', 'uploads', relativePath);

      // Run OCR
      const ocrResult = await ocrService.extractText(imagePath);

      // Generate thumbnail
      const thumbnailUrl = await storageService.generateThumbnail(imagePath);

      return {
        ocrText: ocrResult.text,
        text: ocrResult.text,
        thumbnailUrl,
      };
    }

    return {};
  } catch (error) {
    logger.error('Image processing failed:', error);
    return {};
  }
}

/**
 * Process file capture
 */
async function processFile(fileUrl) {
  try {
    if (fileUrl && fileUrl.includes('/uploads/')) {
      const relativePath = fileUrl.split('/uploads/')[1];
      const filePath = path.join(__dirname, '..', '..', 'uploads', relativePath);

      // Check if it's an image file that needs OCR
      const ext = path.extname(filePath).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'].includes(ext)) {
        return await processImage(fileUrl);
      }

      // For other files, just mark as completed
      return {};
    }

    return {};
  } catch (error) {
    logger.error('File processing failed:', error);
    return {};
  }
}

module.exports = {
  processCaptureSync,
};

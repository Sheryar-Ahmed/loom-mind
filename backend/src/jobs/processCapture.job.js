const { captureQueue, isQueueEnabled } = require('./queue');
const captureService = require('../services/capture.service');
const urlFetcherService = require('../services/urlFetcher.service');
const ocrService = require('../services/ocr.service');
const imageDescriptionService = require('../services/imageDescription.service');
const storageService = require('../services/storage.service');
const logger = require('../utils/logger');
const path = require('path');

/**
 * Process Capture Job
 * Background job to process newly created captures
 */

if (isQueueEnabled) {
  captureQueue.process('processCapture', async (job) => {
    const { captureId, type, url, imageUrl } = job.data;

    logger.info(`Processing capture ${captureId} of type ${type}`);

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
  });

  logger.info('✅ Capture processing job registered');
}

/**
 * Process URL capture
 */
async function processUrl(url) {
  try {
    const data = await urlFetcherService.fetchUrl(url);
    
    // Check if fetch was successful
    if (data.error) {
      logger.error(`URL fetch had errors: ${data.error}`);
      throw new Error(`Failed to fetch URL: ${data.error}`);
    }

    // Validate we got meaningful content
    if (!data.text || data.text.length < 50) {
      logger.warn(`URL fetch returned very little content (${data.text?.length || 0} chars)`);
      // Still proceed but log warning
    }

    logger.info(`✅ URL processed - Title: "${data.title}", Content: ${data.text?.length || 0} chars`);

    return {
      title: data.title,
      text: data.text,
      rawText: data.text,
      domain: data.domain,
      summary: data.summary,
      author: data.author,
      publishedDate: data.publishedDate,
      language: data.language,
      favicon: data.favicon,
      imageUrl: data.imageUrl,
    };
  } catch (error) {
    logger.error(`❌ URL processing failed: ${error.message}`);
    // Re-throw to mark capture as failed
    throw error;
  }
}

/**
 * Process image capture (OCR + AI Description)
 */
async function processImage(imageUrl) {
  try {
    // Only process local files
    if (imageUrl && imageUrl.includes('/uploads/')) {
      const relativePath = imageUrl.split('/uploads/')[1];
      const imagePath = path.join(__dirname, '..', '..', 'uploads', relativePath);

      logger.info('Processing image: OCR + AI Description');

      // Run OCR to extract any text
      const ocrResult = await ocrService.extractText(imagePath);
      const ocrText = ocrResult.text || '';
      const ocrConfidence = ocrResult.confidence || 0;
      
      logger.info(`OCR extracted ${ocrText.length} characters with ${ocrConfidence}% confidence`);

      // Generate thumbnail
      const thumbnailUrl = await storageService.generateThumbnail(imagePath);

      // Determine if OCR text is usable (check length, confidence, and quality)
      const hasUsableOcrText = ocrText.length >= 50 && ocrConfidence >= 60;
      const isGarbageText = ocrText.length > 0 && ocrConfidence < 50; // Low confidence = garbage
      
      // If OCR found little/no text OR low confidence garbage, use AI to describe the image
      let aiDescription = null;
      let aiTags = [];
      let aiObjects = [];
      
      if (!hasUsableOcrText || isGarbageText) {
        if (isGarbageText) {
          logger.info(`OCR text is low quality (${ocrConfidence}% confidence), using AI instead...`);
        } else {
          logger.info('OCR found little/no text, using AI image description...');
        }
        
        const aiResult = await imageDescriptionService.describeImage(imagePath);
        
        if (aiResult.description) {
          aiDescription = aiResult.description;
          aiTags = aiResult.tags || [];
          aiObjects = aiResult.objects || [];
          logger.info(`✅ AI generated: "${aiDescription}"`);
          logger.info(`✅ AI tags: ${aiTags.join(', ')}`);
        }
      } else {
        logger.info('OCR text is good quality, skipping AI description');
      }

      // Determine what text to store
      let finalText;
      let finalSummary;
      let finalTitle;
      let processingMethod;
      
      if (aiDescription) {
        // AI description available - prefer it over low-quality OCR
        if (hasUsableOcrText) {
          // Good OCR + AI description
          finalText = [ocrText, `\n\nImage description: ${aiDescription}`].join('\n');
          finalSummary = ocrText.substring(0, 200);
          finalTitle = ocrText.split('\n')[0].substring(0, 100); // First line as title
          processingMethod = 'ocr+ai';
        } else {
          // Only AI description (OCR was poor/absent)
          finalText = aiDescription;
          finalSummary = aiDescription;
          finalTitle = aiDescription.substring(0, 100); // Use AI description as title
          processingMethod = 'ai-description';
        }
      } else if (hasUsableOcrText) {
        // Only good quality OCR text
        finalText = ocrText;
        finalSummary = ocrText.substring(0, 200);
        finalTitle = ocrText.split('\n')[0].substring(0, 100); // First line as title
        processingMethod = 'ocr';
      } else {
        // Nothing useful - generic fallback
        finalText = 'Image with no detectable content';
        finalSummary = 'Image file';
        finalTitle = 'Untitled Image';
        processingMethod = 'none';
      }

      return {
        title: finalTitle,
        ocrText: hasUsableOcrText ? ocrText : null, // Only store if good quality
        text: finalText,
        summary: finalSummary,
        thumbnailUrl,
        metadata: {
          ocrConfidence: ocrConfidence,
          hasOcrText: hasUsableOcrText,
          hasGarbageOcr: isGarbageText,
          aiDescription: aiDescription || null,
          aiTags: aiTags,
          aiObjects: aiObjects,
          processingMethod: processingMethod,
        },
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
    // For now, just mark as completed
    // In future, could extract text from PDFs, etc.
    return {
      title: 'Uploaded File',
    };
  } catch (error) {
    logger.error('File processing failed:', error);
    return {};
  }
}

module.exports = {
  processUrl,
  processImage,
  processFile,
};

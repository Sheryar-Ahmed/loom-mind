const Tesseract = require('tesseract.js');
const logger = require('../utils/logger');

/**
 * OCR Service
 * Extracts text from images using Tesseract.js
 */
class OcrService {
  /**
   * Extract text from image
   * @param {string} imagePath - Path to image file
   * @param {string} lang - Language code (default: 'eng')
   * @returns {Promise<Object>} OCR result with text and confidence
   */
  async extractText(imagePath, lang = 'eng') {
    try {
      logger.info(`Starting OCR for image: ${imagePath}`);

      const result = await Tesseract.recognize(imagePath, lang, {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            logger.debug(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text.trim();
      const confidence = result.data.confidence;

      logger.info(`OCR completed. Confidence: ${confidence}%, Characters: ${text.length}`);

      return {
        text,
        confidence,
        success: text.length > 0,
      };
    } catch (error) {
      logger.error('OCR extraction failed:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract text from multiple images
   * @param {Array<string>} imagePaths - Array of image paths
   * @param {string} lang - Language code
   * @returns {Promise<Array<Object>>} Array of OCR results
   */
  async extractTextFromMultiple(imagePaths, lang = 'eng') {
    const results = [];

    for (const imagePath of imagePaths) {
      const result = await this.extractText(imagePath, lang);
      results.push({
        imagePath,
        ...result,
      });
    }

    return results;
  }

  /**
   * Get supported languages
   * @returns {Array<string>} Array of language codes
   */
  getSupportedLanguages() {
    return [
      'eng', // English
      'spa', // Spanish
      'fra', // French
      'deu', // German
      'ita', // Italian
      'por', // Portuguese
      'rus', // Russian
      'chi_sim', // Chinese Simplified
      'jpn', // Japanese
      'ara', // Arabic
    ];
  }

  /**
   * Detect if image contains text
   * @param {string} imagePath - Path to image file
   * @returns {Promise<boolean>} True if text detected
   */
  async hasText(imagePath) {
    try {
      const result = await this.extractText(imagePath);
      return result.text.length > 10 && result.confidence > 30;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new OcrService();

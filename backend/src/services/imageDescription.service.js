const logger = require('../utils/logger');
const fs = require('fs').promises;
const sharp = require('sharp');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Image Description Service
 * Uses Google Gemini Vision AI to generate descriptions for images
 */
class ImageDescriptionService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.enabled = false;
    this.isInitialized = false;
    
    // Check for Google API key
    if (process.env.GOOGLE_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      this.enabled = true;
      logger.info('✅ Google Gemini Vision AI enabled (Free tier: 60 requests/min)');
    } else {
      logger.warn('⚠️  AI image captioning disabled: GOOGLE_API_KEY not set');
      logger.info('💡 Get free API key at: https://makersuite.google.com/app/apikey');
      logger.info('💡 Add to .env: GOOGLE_API_KEY=your-key-here');
    }
  }

  /**
   * Initialize the model (lazy loading)
   */
  async initialize() {
    if (this.isInitialized) return;
    
    if (this.enabled) {
      try {
        // Use Gemini Pro Vision model
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        this.isInitialized = true;
        logger.info('✅ Gemini model initialized');
      } catch (error) {
        logger.error('❌ Failed to initialize Gemini:', error.message);
        this.enabled = false;
      }
    } else {
      this.isInitialized = true;
    }
  }

  /**
   * Generate description for an image
   * @param {string} imagePath - Path to image file
   * @returns {Promise<Object>} Description data
   */
  async describeImage(imagePath) {
    if (!this.enabled) {
      logger.warn('Image description disabled');
      return {
        description: null,
        tags: [],
        colors: [],
        objects: [],
      };
    }

    try {
      await this.initialize();

      logger.info(`Analyzing image: ${imagePath}`);

      if (!this.enabled || !this.model) {
        // Fallback to basic analysis
        logger.warn('AI disabled, using basic analysis');
        return await this.basicAnalysis(imagePath);
      }

      // Read and convert image to base64
      const imageBuffer = await fs.readFile(imagePath);
      const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // Call Gemini Vision API
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const prompt = 'Describe what you see in this image in one clear sentence. Focus on the main subject, action, or scene.';
      
      logger.info('Calling Gemini Vision API...');
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const description = response.text().trim();
      
      logger.info(`✅ Gemini AI: "${description}"`);

      // Extract tags from description
      const tags = this.extractTags(description);
      
      // Get colors
      const colors = await this.analyzeColors(imagePath);
      
      // Extract objects
      const objects = this.extractObjects(description);

      return {
        description,
        tags,
        colors,
        objects,
        confidence: 0.95, // Gemini is very accurate
      };
    } catch (error) {
      logger.error('❌ Gemini AI failed, using fallback');
      logger.error(`Error: ${error.message}`);
      
      // Fallback to basic analysis
      return await this.basicAnalysis(imagePath);
    }
  }

  /**
   * Basic image analysis fallback (when AI is unavailable)
   */
  async basicAnalysis(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      const colors = await this.analyzeColors(imagePath);
      
      const width = metadata.width;
      const height = metadata.height;
      const format = metadata.format;
      const orientation = width > height ? 'landscape' : width < height ? 'portrait' : 'square';
      
      const description = `Image (${orientation} ${format}, ${width}x${height})`;
      const tags = [format, orientation, ...colors];
      
      return {
        description,
        tags,
        colors,
        objects: [],
        confidence: 0.3,
        error: 'AI unavailable, using basic analysis'
      };
    } catch (error) {
      return {
        description: null,
        tags: [],
        colors: [],
        objects: [],
        error: error.message,
      };
    }
  }

  /**
   * Extract tags from description
   * @param {string} description - Generated description
   * @returns {Array<string>} Tags
   */
  extractTags(description) {
    if (!description) return [];

    // Common objects and concepts to extract as tags
    const keywords = [
      // Objects
      'person', 'people', 'man', 'woman', 'child', 'baby',
      'dog', 'cat', 'animal', 'bird', 'fish', 'bee', 'insect',
      'car', 'truck', 'vehicle', 'bicycle', 'motorcycle',
      'building', 'house', 'city', 'street', 'road',
      'tree', 'flower', 'plant', 'garden', 'nature',
      'food', 'drink', 'cake', 'ice cream', 'coffee', 'honey',
      'phone', 'computer', 'laptop', 'screen', 'camera',
      'book', 'paper', 'document', 'sign', 'text',
      // Settings
      'indoor', 'outdoor', 'beach', 'mountain', 'ocean', 'sky',
      'sunset', 'sunrise', 'night', 'day', 'sunny', 'cloudy',
      // Colors
      'yellow', 'orange', 'blue', 'red', 'green', 'black', 'white',
      'colorful', 'bright', 'dark',
      // Actions
      'flying', 'sitting', 'standing', 'running', 'walking',
      'eating', 'drinking', 'working', 'playing',
    ];

    const tags = [];
    const lowerDesc = description.toLowerCase();

    keywords.forEach(keyword => {
      if (lowerDesc.includes(keyword)) {
        tags.push(keyword);
      }
    });

    // Remove duplicates and limit to 10 tags
    return [...new Set(tags)].slice(0, 10);
  }

  /**
   * Extract main objects from description
   * @param {string} description - Generated description
   * @returns {Array<string>} Objects
   */
  extractObjects(description) {
    if (!description) return [];

    // Extract nouns (simplified approach)
    const words = description.toLowerCase().split(' ');
    const commonNouns = [
      'ice cream', 'cone', 'bee', 'honey', 'honeycomb',
      'person', 'dog', 'cat', 'car', 'building', 'tree',
      'flower', 'food', 'drink', 'phone', 'computer',
    ];

    const objects = [];
    commonNouns.forEach(noun => {
      if (description.toLowerCase().includes(noun)) {
        objects.push(noun);
      }
    });

    return [...new Set(objects)].slice(0, 5);
  }

  /**
   * Analyze dominant colors in image
   * @param {string} imagePath - Path to image file
   * @returns {Promise<Array<string>>} Dominant colors
   */
  async analyzeColors(imagePath) {
    try {
      const sharp = require('sharp');
      
      // Get image stats
      const stats = await sharp(imagePath)
        .stats();

      // Determine dominant color from RGB channels
      const colors = [];
      
      if (stats.dominant) {
        const { r, g, b } = stats.dominant;
        
        // Simple color mapping
        if (r > 200 && g > 150 && b < 100) colors.push('orange');
        else if (r > 200 && g > 200 && b < 100) colors.push('yellow');
        else if (r > 200 && g < 100 && b < 100) colors.push('red');
        else if (r < 100 && g > 150 && b < 100) colors.push('green');
        else if (r < 100 && g < 100 && b > 200) colors.push('blue');
        else if (r > 200 && g > 200 && b > 200) colors.push('white');
        else if (r < 50 && g < 50 && b < 50) colors.push('black');
      }

      return colors;
    } catch (error) {
      logger.error('Color analysis failed:', error.message);
      return [];
    }
  }

  /**
   * Fallback: Generate simple description from filename and metadata
   * @param {string} imagePath - Path to image file
   * @returns {Promise<Object>} Basic description
   */
  async generateFallbackDescription(imagePath) {
    try {
      const sharp = require('sharp');
      const path = require('path');

      const metadata = await sharp(imagePath).metadata();
      const filename = path.basename(imagePath, path.extname(imagePath));

      const description = `Image ${metadata.width}x${metadata.height}px, ${metadata.format} format`;
      
      return {
        description,
        tags: [metadata.format, 'image'],
        colors: [],
        objects: [],
        fallback: true,
      };
    } catch (error) {
      return {
        description: 'Image file',
        tags: ['image'],
        colors: [],
        objects: [],
        fallback: true,
      };
    }
  }
}

module.exports = new ImageDescriptionService();

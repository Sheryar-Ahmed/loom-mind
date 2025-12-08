const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { s3Client, getBucketName, isS3Enabled } = require('../config/s3');
const { InternalError } = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Storage Service
 * Handles file uploads to S3 or local storage
 */
class StorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '..', '..', 'uploads');
    this.baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  }

  /**
   * Upload file to storage
   * @param {Object} file - Multer file object
   * @param {string} folder - Folder name (e.g., 'images', 'documents')
   * @returns {Promise<string>} File URL
   */
  async uploadFile(file, folder = 'files') {
    try {
      if (isS3Enabled()) {
        return await this.uploadToS3(file, folder);
      } else {
        return await this.uploadToLocal(file, folder);
      }
    } catch (error) {
      logger.error('File upload failed:', error);
      throw new InternalError('File upload failed');
    }
  }

  /**
   * Upload file to S3
   * @param {Object} file - Multer file object
   * @param {string} folder - Folder name
   * @returns {Promise<string>} S3 URL
   */
  async uploadToS3(file, folder) {
    const key = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;

    const params = {
      Bucket: getBucketName(),
      Key: key,
      Body: await fs.readFile(file.path),
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const result = await s3Client.upload(params).promise();

    // Delete local file after upload
    await fs.unlink(file.path);

    return result.Location;
  }

  /**
   * Upload file to local storage
   * @param {Object} file - Multer file object
   * @param {string} folder - Folder name
   * @returns {Promise<string>} Local URL
   */
  async uploadToLocal(file, folder) {
    const folderPath = path.join(this.uploadDir, folder);

    // Ensure folder exists
    await fs.mkdir(folderPath, { recursive: true });

    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(folderPath, filename);

    // Move file to destination
    await fs.rename(file.path, filePath);

    return `${this.baseUrl}/uploads/${folder}/${filename}`;
  }

  /**
   * Generate thumbnail from image
   * @param {string} filePath - Original file path
   * @param {number} width - Thumbnail width
   * @param {number} height - Thumbnail height
   * @returns {Promise<string>} Thumbnail URL
   */
  async generateThumbnail(filePath, width = 300, height = 200) {
    try {
      const filename = `thumb_${uuidv4()}.jpg`;
      const thumbnailPath = path.join(this.uploadDir, 'thumbnails', filename);

      // Ensure thumbnails folder exists
      await fs.mkdir(path.join(this.uploadDir, 'thumbnails'), { recursive: true });

      // Generate thumbnail
      await sharp(filePath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      if (isS3Enabled()) {
        // Upload thumbnail to S3
        const params = {
          Bucket: getBucketName(),
          Key: `thumbnails/${filename}`,
          Body: await fs.readFile(thumbnailPath),
          ContentType: 'image/jpeg',
          ACL: 'public-read',
        };

        const result = await s3Client.upload(params).promise();

        // Delete local thumbnail
        await fs.unlink(thumbnailPath);

        return result.Location;
      } else {
        return `${this.baseUrl}/uploads/thumbnails/${filename}`;
      }
    } catch (error) {
      logger.error('Thumbnail generation failed:', error);
      return null; // Return null if thumbnail generation fails
    }
  }

  /**
   * Delete file from storage
   * @param {string} fileUrl - File URL
   */
  async deleteFile(fileUrl) {
    try {
      if (isS3Enabled() && fileUrl.includes('amazonaws.com')) {
        // Extract S3 key from URL
        const url = new URL(fileUrl);
        const key = url.pathname.substring(1); // Remove leading slash

        await s3Client
          .deleteObject({
            Bucket: getBucketName(),
            Key: key,
          })
          .promise();
      } else if (fileUrl.includes('/uploads/')) {
        // Delete local file
        const relativePath = fileUrl.split('/uploads/')[1];
        const filePath = path.join(this.uploadDir, relativePath);

        try {
          await fs.unlink(filePath);
        } catch (error) {
          // File might not exist, ignore error
        }
      }
    } catch (error) {
      logger.error('File deletion failed:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Get file extension from mimetype
   * @param {string} mimetype - File mimetype
   * @returns {string} File extension
   */
  getExtension(mimetype) {
    const mimeMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    };

    return mimeMap[mimetype] || '';
  }
}

module.exports = new StorageService();

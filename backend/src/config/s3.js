const AWS = require('aws-sdk');
require('dotenv').config();

/**
 * AWS S3 Configuration
 * Used for production file storage
 */
const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
};

let s3Client = null;

/**
 * Initialize S3 client if credentials are provided
 */
const initializeS3 = () => {
  if (process.env.STORAGE_TYPE === 's3' && s3Config.accessKeyId && s3Config.secretAccessKey) {
    AWS.config.update(s3Config);
    s3Client = new AWS.S3();
    console.log('✅ AWS S3 configured successfully');
  } else {
    console.log('ℹ️  Using local storage (S3 not configured)');
  }
  return s3Client;
};

/**
 * Get S3 bucket name
 */
const getBucketName = () => {
  return process.env.AWS_BUCKET_NAME || 'memorylayer-uploads';
};

module.exports = {
  s3Client,
  initializeS3,
  getBucketName,
  isS3Enabled: () => process.env.STORAGE_TYPE === 's3' && s3Client !== null,
};

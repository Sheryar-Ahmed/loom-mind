const { AppDataSource } = require('../config/database');
const { Capture } = require('../entities/Capture');
const { Tag } = require('../entities/Tag');
const { User } = require('../entities/User');
const { Collection } = require('../entities/Collection');
const { NotFoundError, ForbiddenError } = require('../utils/ApiError');
const logger = require('../utils/logger');
const { In } = require('typeorm');

/**
 * Capture Service
 * Handles all capture-related business logic
 */
class CaptureService {
  constructor() {
    this.captureRepository = null;
    this.tagRepository = null;
    this.userRepository = null;
    this.collectionRepository = null;
  }

  /**
   * Initialize repositories
   */
  initialize() {
    if (!this.captureRepository) {
      this.captureRepository = AppDataSource.getRepository(Capture);
      this.tagRepository = AppDataSource.getRepository(Tag);
      this.userRepository = AppDataSource.getRepository(User);
      this.collectionRepository = AppDataSource.getRepository(Collection);
    }
  }

  /**
   * Create a new capture
   * @param {string} userId - User ID
   * @param {Object} captureData - Capture data
   * @returns {Promise<Object>} Created capture
   */
  async createCapture(userId, captureData) {
    this.initialize();

    const { type, title, url, text, imageUrl, tags, collectionIds, metadata } = captureData;

    // Create capture
    const capture = this.captureRepository.create({
      userId,
      type,
      title,
      url,
      rawText: type === 'text' ? text : null,
      text: text || '',
      imageUrl,
      processingStatus: 'pending',
      source: 'web',
      metadata: metadata || {},
    });

    const savedCapture = await this.captureRepository.save(capture);

    // Handle tags
    if (tags && tags.length > 0) {
      await this.addTagsToCapture(savedCapture.id, userId, tags);
    }

    // Handle collections
    if (collectionIds && collectionIds.length > 0) {
      await this.addCaptureToCollections(savedCapture.id, userId, collectionIds);
    }

    // Increment user's capture count
    await this.userRepository.increment({ id: userId }, 'captureCount', 1);

    // Return the saved capture with tags loaded
    const captureWithTags = await this.captureRepository.findOne({
      where: { id: savedCapture.id },
      relations: ['tags'],
    });

    return captureWithTags;
  }

  /**
   * Get capture by ID
   * @param {string} captureId - Capture ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Capture object
   */
  async getCaptureById(captureId, userId) {
    this.initialize();

    const capture = await this.captureRepository.findOne({
      where: { id: captureId, userId },
      relations: ['tags'],
    });

    if (!capture) {
      throw NotFoundError('Capture');
    }

    // Remove user object from response (only needed for check)
    const { user, ...captureWithoutUser } = capture;

    return captureWithoutUser;
  }

  /**
   * List user's captures with filters and pagination
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Paginated captures
   */
  async listCaptures(userId, filters = {}) {
    this.initialize();

    const {
      page = 1,
      limit = 20,
      type,
      tags,
      collectionId,
      sortBy = 'createdAt',
      order = 'DESC',
      search,
    } = filters;

    const queryBuilder = this.captureRepository
      .createQueryBuilder('capture')
      .leftJoinAndSelect('capture.tags', 'tag')
      .leftJoinAndSelect('capture.collections', 'collection')
      .where('capture.userId = :userId', { userId });

    // Apply filters
    if (type) {
      queryBuilder.andWhere('capture.type = :type', { type });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('tag.name IN (:...tags)', { tags });
    }

    if (collectionId) {
      queryBuilder.andWhere('collection.id = :collectionId', { collectionId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(capture.title ILIKE :search OR capture.text ILIKE :search OR capture.domain ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    const validSortFields = ['createdAt', 'updatedAt', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`capture.${sortField}`, order);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [captures, total] = await queryBuilder.getManyAndCount();

    return {
      captures,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get recent captures
   * @param {string} userId - User ID
   * @param {number} limit - Number of captures to return
   * @returns {Promise<Array>} Recent captures
   */
  async getRecentCaptures(userId, limit = 10) {
    this.initialize();

    return this.captureRepository.find({
      where: { user: { id: userId } },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Update capture
   * @param {string} captureId - Capture ID
   * @param {string} userId - User ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated capture
   */
  async updateCapture(captureId, userId, updates) {
    this.initialize();

    const capture = await this.getCaptureById(captureId, userId);

    const { title, tags, ...otherUpdates } = updates;

    // Update basic fields
    if (title !== undefined) otherUpdates.title = title;

    await this.captureRepository.update(captureId, otherUpdates);

    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing tags
      await this.captureRepository
        .createQueryBuilder()
        .relation(Capture, 'tags')
        .of(captureId)
        .remove(capture.tags);

      // Add new tags
      if (tags.length > 0) {
        await this.addTagsToCapture(captureId, userId, tags);
      }
    }

    return this.getCaptureById(captureId, userId);
  }

  /**
   * Delete capture
   * @param {string} captureId - Capture ID
   * @param {string} userId - User ID
   */
  async deleteCapture(captureId, userId) {
    this.initialize();

    const capture = await this.getCaptureById(captureId, userId);

    await this.captureRepository.remove(capture);

    // Decrement user's capture count
    await this.userRepository.decrement({ id: userId }, 'captureCount', 1);
  }

  /**
   * Update capture processing status
   * @param {string} captureId - Capture ID
   * @param {Object} data - Processing result data
   */
  async updateProcessingResult(captureId, data) {
    this.initialize();

    const { 
      status, 
      title, 
      text, 
      rawText,
      ocrText,
      domain, 
      summary, 
      imageUrl, 
      thumbnailUrl,
      favicon,
      author,
      publishedDate,
      language,
      ...metadata 
    } = data;

    const updateData = {
      processingStatus: status,
    };

    if (title) updateData.title = title;
    if (text) updateData.text = text;
    if (rawText) updateData.rawText = rawText;
    if (ocrText) updateData.ocrText = ocrText;
    if (domain) updateData.domain = domain;
    if (summary) updateData.summary = summary;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;
    if (favicon) updateData.favicon = favicon;
    if (author) updateData.author = author;
    if (publishedDate) updateData.publishedDate = publishedDate;
    if (language) updateData.language = language;

    // Merge metadata
    if (Object.keys(metadata).length > 0) {
      const capture = await this.captureRepository.findOne({ where: { id: captureId } });
      updateData.metadata = { ...capture.metadata, ...metadata };
    }

    await this.captureRepository.update(captureId, updateData);

    logger.info(`Capture ${captureId} processing ${status}`);
  }

  /**
   * Add tags to capture
   * @param {string} captureId - Capture ID
   * @param {string} userId - User ID
   * @param {Array<string>} tagNames - Tag names
   */
  async addTagsToCapture(captureId, userId, tagNames) {
    this.initialize();

    const tagObjects = [];

    for (const tagName of tagNames) {
      // Find or create tag
      let tag = await this.tagRepository.findOne({
        where: { name: tagName, user: { id: userId } },
      });

      if (!tag) {
        tag = this.tagRepository.create({
          name: tagName,
          user: { id: userId },
          color: this.generateRandomColor(),
        });
        await this.tagRepository.save(tag);
      }

      tagObjects.push(tag);
    }

    // Add tags to capture
    await this.captureRepository
      .createQueryBuilder()
      .relation(Capture, 'tags')
      .of(captureId)
      .add(tagObjects);
  }

  /**
   * Add capture to collections
   * @param {string} captureId - Capture ID
   * @param {string} userId - User ID
   * @param {Array<string>} collectionIds - Collection IDs
   */
  async addCaptureToCollections(captureId, userId, collectionIds) {
    this.initialize();

    // Verify collections belong to user
    const collections = await this.collectionRepository.find({
      where: { id: In(collectionIds), user: { id: userId } },
    });

    if (collections.length > 0) {
      await this.captureRepository
        .createQueryBuilder()
        .relation(Capture, 'collections')
        .of(captureId)
        .add(collections);
    }
  }

  /**
   * Generate random color for tags
   * @returns {string} Hex color code
   */
  generateRandomColor() {
    const colors = [
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#f43f5e',
      '#f97316',
      '#eab308',
      '#84cc16',
      '#22c55e',
      '#14b8a6',
      '#06b6d4',
      '#0ea5e9',
      '#3b82f6',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

module.exports = new CaptureService();

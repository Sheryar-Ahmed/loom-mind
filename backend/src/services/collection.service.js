const { AppDataSource } = require('../config/database');
const { Collection } = require('../entities/Collection');
const { Capture } = require('../entities/Capture');
const logger = require('../utils/logger');

class CollectionService {
  constructor() {
    this.collectionRepository = null;
    this.captureRepository = null;
  }

  initialize() {
    if (!this.collectionRepository) {
      this.collectionRepository = AppDataSource.getRepository('Collection');
      this.captureRepository = AppDataSource.getRepository('Capture');
    }
  }

  /**
   * Create a new collection
   */
  async createCollection(userId, data) {
    this.initialize();

    const { name, description, isPublic } = data;

    const collection = this.collectionRepository.create({
      userId,
      name,
      description,
      isPublic: isPublic || false,
    });

    await this.collectionRepository.save(collection);

    logger.info(`Collection created: ${collection.id} by user ${userId}`);
    return collection;
  }

  /**
   * Get all collections for a user
   */
  async getUserCollections(userId, options = {}) {
    this.initialize();

    const { page = 1, limit = 50, search } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.collectionRepository
      .createQueryBuilder('collection')
      .where('collection.userId = :userId', { userId })
      .leftJoinAndSelect('collection.captures', 'captures')
      .orderBy('collection.updatedAt', 'DESC')
      .skip(skip)
      .take(limit);

    // Search by name
    if (search) {
      queryBuilder.andWhere('collection.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [collections, total] = await queryBuilder.getManyAndCount();

    // Add capture count to each collection
    const collectionsWithCount = collections.map((collection) => ({
      ...collection,
      captureCount: collection.captures?.length || 0,
      captures: undefined, // Remove the full captures array
    }));

    return {
      collections: collectionsWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single collection by ID
   */
  async getCollectionById(collectionId, userId) {
    this.initialize();

    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
      relations: ['captures', 'captures.tags'],
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    // Check if user has access (owner or public)
    if (collection.userId !== userId && !collection.isPublic) {
      throw new Error('Access denied');
    }

    return collection;
  }

  /**
   * Update a collection
   */
  async updateCollection(collectionId, userId, data) {
    this.initialize();

    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    const { name, description, isPublic } = data;

    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (isPublic !== undefined) collection.isPublic = isPublic;

    await this.collectionRepository.save(collection);

    logger.info(`Collection updated: ${collectionId}`);
    return collection;
  }

  /**
   * Delete a collection
   */
  async deleteCollection(collectionId, userId) {
    this.initialize();

    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    await this.collectionRepository.remove(collection);

    logger.info(`Collection deleted: ${collectionId}`);
    return { success: true };
  }

  /**
   * Add captures to a collection
   */
  async addCapturesToCollection(collectionId, userId, captureIds) {
    this.initialize();

    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId, userId },
      relations: ['captures'],
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    // Get the captures
    const captures = await this.captureRepository.findByIds(captureIds);

    // Filter only captures owned by the user
    const userCaptures = captures.filter((c) => c.userId === userId);

    // Add new captures (avoid duplicates)
    const existingCaptureIds = new Set(collection.captures.map((c) => c.id));
    const newCaptures = userCaptures.filter((c) => !existingCaptureIds.has(c.id));

    collection.captures.push(...newCaptures);
    await this.collectionRepository.save(collection);

    logger.info(`Added ${newCaptures.length} captures to collection ${collectionId}`);
    return collection;
  }

  /**
   * Remove captures from a collection
   */
  async removeCapuresFromCollection(collectionId, userId, captureIds) {
    this.initialize();

    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId, userId },
      relations: ['captures'],
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    // Remove specified captures
    const captureIdsSet = new Set(captureIds);
    collection.captures = collection.captures.filter((c) => !captureIdsSet.has(c.id));

    await this.collectionRepository.save(collection);

    logger.info(`Removed ${captureIds.length} captures from collection ${collectionId}`);
    return collection;
  }

  /**
   * Get public collections (for discovery)
   */
  async getPublicCollections(options = {}) {
    this.initialize();

    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [collections, total] = await this.collectionRepository.findAndCount({
      where: { isPublic: true },
      relations: ['user', 'captures'],
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

    const collectionsWithCount = collections.map((collection) => ({
      ...collection,
      captureCount: collection.captures?.length || 0,
      captures: undefined,
      user: {
        id: collection.user.id,
        name: collection.user.name,
        email: collection.user.email,
      },
    }));

    return {
      collections: collectionsWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new CollectionService();

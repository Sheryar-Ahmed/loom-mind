const collectionService = require('../services/collection.service');

/**
 * Create a new collection
 */
exports.createCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description, isPublic } = req.body;

    const collection = await collectionService.createCollection(userId, {
      name,
      description,
      isPublic,
    });

    res.status(201).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's collections
 */
exports.getUserCollections = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, search } = req.query;

    const result = await collectionService.getUserCollections(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      search,
    });

    res.json({
      success: true,
      data: result.collections,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single collection
 */
exports.getCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const collection = await collectionService.getCollectionById(id, userId);

    res.json({
      success: true,
      data: collection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update collection
 */
exports.updateCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, isPublic } = req.body;

    const collection = await collectionService.updateCollection(id, userId, {
      name,
      description,
      isPublic,
    });

    res.json({
      success: true,
      data: collection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete collection
 */
exports.deleteCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await collectionService.deleteCollection(id, userId);

    res.json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add captures to collection
 */
exports.addCaptures = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { captureIds } = req.body;

    const collection = await collectionService.addCapturesToCollection(
      id,
      userId,
      captureIds
    );

    res.json({
      success: true,
      data: collection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove captures from collection
 */
exports.removeCaptures = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { captureIds } = req.body;

    const collection = await collectionService.removeCapuresFromCollection(
      id,
      userId,
      captureIds
    );

    res.json({
      success: true,
      data: collection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public collections
 */
exports.getPublicCollections = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const result = await collectionService.getPublicCollections({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.json({
      success: true,
      data: result.collections,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

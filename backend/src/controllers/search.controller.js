const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/ApiResponse');
const searchService = require('../services/search.service');

/**
 * Search Controller
 * Handles search-related HTTP requests
 */

/**
 * @route   POST /api/search
 * @desc    Search captures
 * @access  Private
 */
exports.searchCaptures = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const searchParams = req.body;

  const result = await searchService.searchCaptures(userId, searchParams);

  paginated(res, result.results, result.pagination, `Found ${result.pagination.total} results`);
});

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions
 * @access  Private
 */
exports.getSuggestions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { q } = req.query;

  const suggestions = await searchService.getSuggestions(userId, q);

  success(res, suggestions);
});

/**
 * @route   GET /api/search/popular-tags
 * @desc    Get popular tags
 * @access  Private
 */
exports.getPopularTags = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;

  const tags = await searchService.getPopularTags(userId, limit);

  success(res, tags);
});

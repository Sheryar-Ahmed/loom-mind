const { AppDataSource } = require('../config/database');
const { Capture } = require('../entities/Capture');
const logger = require('../utils/logger');

/**
 * Search Service
 * Handles full-text search with PostgreSQL
 */
class SearchService {
  constructor() {
    this.captureRepository = null;
  }

  /**
   * Initialize repository
   */
  initialize() {
    if (!this.captureRepository) {
      this.captureRepository = AppDataSource.getRepository(Capture);
    }
  }

  /**
   * Search captures with filters
   * @param {string} userId - User ID
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchCaptures(userId, searchParams) {
    this.initialize();

    const {
      query = '',
      types = [],
      tags = [],
      collectionId,
      dateFrom,
      dateTo,
      sortBy = 'relevance',
      order = 'DESC',
      page = 1,
      limit = 20,
    } = searchParams;

    const queryBuilder = this.captureRepository
      .createQueryBuilder('capture')
      .leftJoinAndSelect('capture.tags', 'tag')
      .where('capture.userId = :userId', { userId });

    // Full-text search
    if (query && query.trim().length > 0) {
      const searchQuery = query.trim().replace(/\s+/g, ' & ');

      // Use PostgreSQL full-text search with ts_rank for relevance
      queryBuilder.andWhere(
        `(
          to_tsvector('english', COALESCE(capture.title, '')) ||
          to_tsvector('english', COALESCE(capture.text, '')) ||
          to_tsvector('english', COALESCE(capture.summary, ''))
        ) @@ plainto_tsquery('english', :query)`,
        { query: query.trim() }
      );

      // Add relevance score
      if (sortBy === 'relevance') {
        queryBuilder.addSelect(
          `ts_rank(
            to_tsvector('english', COALESCE(capture.title, '') || ' ' || COALESCE(capture.text, '')),
            plainto_tsquery('english', :query)
          )`,
          'rank'
        );
      }
    }

    // Filter by types
    if (types && types.length > 0) {
      queryBuilder.andWhere('capture.type IN (:...types)', { types });
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      queryBuilder.andWhere('tag.name IN (:...tags)', { tags });
    }

    // Filter by collection
    if (collectionId) {
      queryBuilder.andWhere('collection.id = :collectionId', { collectionId });
    }

    // Filter by date range
    if (dateFrom) {
      queryBuilder.andWhere('capture.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('capture.createdAt <= :dateTo', { dateTo });
    }

    // Sorting
    if (sortBy === 'relevance' && query) {
      queryBuilder.orderBy('rank', 'DESC');
    } else {
      const validSortFields = {
        createdAt: 'capture.createdAt',
        updatedAt: 'capture.updatedAt',
        title: 'capture.title',
      };
      const sortField = validSortFields[sortBy] || 'capture.createdAt';
      queryBuilder.orderBy(sortField, order);
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [results, total] = await queryBuilder.getManyAndCount();

    // Generate snippets for text highlighting
    const resultsWithSnippets = results.map((capture) => ({
      ...capture,
      snippet: this.generateSnippet(capture, query),
    }));

    return {
      results: resultsWithSnippets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      query,
    };
  }

  /**
   * Generate text snippet with highlighted search terms
   * @param {Object} capture - Capture object
   * @param {string} query - Search query
   * @returns {string} Text snippet
   */
  generateSnippet(capture, query) {
    if (!query) {
      return this.truncateText(capture.summary || capture.text || '', 200);
    }

    const text = capture.text || capture.summary || '';
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // Find position of query in text
    const position = textLower.indexOf(queryLower);

    if (position === -1) {
      return this.truncateText(text, 200);
    }

    // Extract snippet around the match
    const snippetStart = Math.max(0, position - 100);
    const snippetEnd = Math.min(text.length, position + query.length + 100);
    let snippet = text.substring(snippetStart, snippetEnd);

    // Add ellipsis
    if (snippetStart > 0) snippet = '...' + snippet;
    if (snippetEnd < text.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return text || '';
    }

    return text.substring(0, maxLength) + '...';
  }

  /**
   * Get search suggestions based on user's captures
   * @param {string} userId - User ID
   * @param {string} query - Partial query
   * @returns {Promise<Array>} Suggested search terms
   */
  async getSuggestions(userId, query) {
    this.initialize();

    if (!query || query.length < 2) {
      return [];
    }

    // Get recent captures matching the query
    const captures = await this.captureRepository
      .createQueryBuilder('capture')
      .select(['capture.title', 'capture.domain'])
      .where('capture.userId = :userId', { userId })
      .andWhere('capture.title ILIKE :query', { query: `%${query}%` })
      .orderBy('capture.createdAt', 'DESC')
      .take(5)
      .getMany();

    return captures.map((c) => c.title).filter(Boolean);
  }

  /**
   * Get popular tags for user
   * @param {string} userId - User ID
   * @param {number} limit - Number of tags to return
   * @returns {Promise<Array>} Popular tags
   */
  async getPopularTags(userId, limit = 10) {
    this.initialize();

    const results = await this.captureRepository
      .createQueryBuilder('capture')
      .leftJoin('capture.tags', 'tag')
      .select('tag.name', 'name')
      .addSelect('tag.color', 'color')
      .addSelect('COUNT(capture.id)', 'count')
      .where('capture.userId = :userId', { userId })
      .groupBy('tag.name')
      .addGroupBy('tag.color')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return results;
  }
}

module.exports = new SearchService();

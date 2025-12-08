const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { searchValidation } = require('../validators/search.validator');

/**
 * Search Routes
 */

// All routes require authentication
router.use(authenticate);

router.post('/', searchValidation, validate, searchController.searchCaptures);
router.get('/suggestions', searchController.getSuggestions);
router.get('/popular-tags', searchController.getPopularTags);

module.exports = router;

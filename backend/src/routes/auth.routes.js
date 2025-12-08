const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validator');
const {
  signupValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require('../validators/auth.validator');

/**
 * Authentication Routes
 */

// Public routes
router.post('/signup', signupValidation, validate, authController.signup);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout);
router.get('/me', authController.getProfile);
router.put('/me', updateProfileValidation, validate, authController.updateProfile);
router.post('/change-password', changePasswordValidation, validate, authController.changePassword);

module.exports = router;

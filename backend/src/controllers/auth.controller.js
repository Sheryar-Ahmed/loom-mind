const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user
 * @access  Public
 */
exports.signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const result = await authService.signup({ email, password, name });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  created(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Account created successfully');
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  success(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Login successful');
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  success(res, null, 'Logout successful');
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw UnauthorizedError('Refresh token not found');
  }

  const tokens = await authService.refreshToken(refreshToken);

  // Update refresh token cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  success(res, {
    accessToken: tokens.accessToken,
  }, 'Token refreshed');
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  success(res, user);
});

/**
 * @route   PUT /api/auth/me
 * @desc    Update user profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await authService.updateProfile(req.user.id, { name, email });

  success(res, user, 'Profile updated successfully');
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.user.id, currentPassword, newPassword);

  success(res, null, 'Password changed successfully');
});

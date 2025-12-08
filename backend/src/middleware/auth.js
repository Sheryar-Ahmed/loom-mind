const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { UnauthorizedError } = require('../utils/ApiError');
const { AppDataSource } = require('../config/database');
const { User } = require('../entities/User');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
      select: ['id', 'email', 'name', 'plan', 'captureCount', 'createdAt'],
    });

    if (!user) {
      throw UnauthorizedError('User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw UnauthorizedError('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw UnauthorizedError('Token expired');
    }
    throw error;
  }
});

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't throw error if missing
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
      select: ['id', 'email', 'name', 'plan'],
    });

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
});

module.exports = { authenticate, optionalAuth };

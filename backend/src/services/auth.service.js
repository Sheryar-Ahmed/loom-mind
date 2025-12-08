const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../config/database');
const { User } = require('../entities/User');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/ApiError');

/**
 * Authentication Service
 * Handles user authentication and token management
 */
class AuthService {
  constructor() {
    this.userRepository = null;
  }

  /**
   * Initialize repository
   */
  initialize() {
    if (!this.userRepository) {
      this.userRepository = AppDataSource.getRepository(User);
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User object and tokens
   */
  async signup(userData) {
    this.initialize();

    const { email, password, name } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      plan: 'free',
      captureCount: 0,
      settings: {},
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Save refresh token
    await this.userRepository.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Login user
   * @param {Object} credentials - Email and password
   * @returns {Promise<Object>} User object and tokens
   */
  async login(credentials) {
    this.initialize();

    const { email, password } = credentials;

    // Find user with password
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Save refresh token
    await this.userRepository.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    // Remove password from response
    const { password: _, refreshToken: __, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    this.initialize();

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Find user with refresh token
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id: decoded.userId })
        .addSelect('user.refreshToken')
        .getOne();

      if (!user || user.refreshToken !== refreshToken) {
        throw UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id);

      // Update refresh token
      await this.userRepository.update(user.id, {
        refreshToken: tokens.refreshToken,
      });

      return tokens;
    } catch (error) {
      throw UnauthorizedError('Invalid refresh token');
    }
  }

  /**
   * Logout user
   * @param {string} userId - User ID
   */
  async logout(userId) {
    this.initialize();

    await this.userRepository.update(userId, {
      refreshToken: null,
    });
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUser(userId) {
    this.initialize();

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw NotFoundError('User');
    }

    return user;
  }

  /**
   * Get user profile (alias for getUser)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object without sensitive data
   */
  async getProfile(userId) {
    return this.getUser(userId);
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userId, updates) {
    this.initialize();

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check email uniqueness if email is being updated
    if (updates.email && updates.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updates.email },
      });
      if (existingUser) {
        throw ConflictError('Email already in use');
      }
    }

    // Update user
    await this.userRepository.update(userId, updates);

    // Return updated user
    return this.userRepository.findOne({ where: { id: userId } });
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(userId, currentPassword, newPassword) {
    this.initialize();

    // Get user with password
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: userId })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw NotFoundError('User');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }

  /**
   * Generate JWT tokens
   * @param {string} userId - User ID
   * @returns {Object} Access and refresh tokens
   */
  generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '15m',
    });

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    });

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();

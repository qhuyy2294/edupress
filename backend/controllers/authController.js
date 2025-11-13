/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  // Validate input
  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create user (password will be hashed by pre-save middleware)
  const user = await User.create({
    fullName,
    email,
    password,
    role: 'customer', // Default role
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        status: user.status,
        token: generateToken(user._id),
      },
      message: 'User registered successfully',
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Check for user (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    // Check if account is active
    if (user.status === 'inactive') {
      res.status(403);
      throw new Error('Account is inactive. Please contact support.');
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        status: user.status,
        token: generateToken(user._id),
      },
      message: 'Login successful',
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

    // Only update email if provided and different
    if (req.body.email && req.body.email !== user.email) {
      // Check if new email already exists
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already in use');
      }
      user.email = req.body.email;
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        status: updatedUser.status,
      },
      message: 'Profile updated successfully',
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};

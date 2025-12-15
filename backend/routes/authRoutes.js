/**
 * Authentication Routes
 * Handles user registration, login, and profile endpoints
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  // Import các hàm mới
  forgotPassword, 
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Quên và Đặt lại mật khẩu
router.post('/forgot-password', forgotPassword); // Yêu cầu gửi email (POST)
router.put('/reset-password/:token', resetPassword); // Đặt lại mật khẩu (PUT)

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
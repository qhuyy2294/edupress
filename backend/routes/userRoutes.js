/**
 * User Routes
 * Handles user-specific operations
 */

const express = require('express');
const router = express.Router();
const {
  requestToBeProvider,
  deleteAccount,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Protected routes for customers
router.post(
  '/request-provider',
  protect,
  authorize('customer'),
  requestToBeProvider
);

// Protected routes for all authenticated users
router.delete('/account', protect, deleteAccount);

module.exports = router;

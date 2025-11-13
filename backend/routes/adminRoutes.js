/**
 * Admin Routes
 * Handles administrative operations
 */

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  toggleUserStatus,
  approveProviderRequest,
  rejectProviderRequest,
  getPendingProviders,
  getAllCourses,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  getSystemStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Provider approval management
router.get('/pending-providers', getPendingProviders);
router.put('/approve-provider/:id', approveProviderRequest);
router.put('/reject-provider/:id', rejectProviderRequest);

// Course management
router.get('/courses', getAllCourses);
router.get('/pending-courses', getPendingCourses);
router.put('/approve-course/:id', approveCourse);
router.put('/reject-course/:id', rejectCourse);

// System statistics
router.get('/stats', getSystemStats);

module.exports = router;

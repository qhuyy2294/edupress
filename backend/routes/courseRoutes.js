/**
 * Course Routes
 * Handles course CRUD operations and enrollments
 */

const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses,
  enrollInCourse,
  getEnrolledCourses,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// IMPORTANT: Specific routes must come BEFORE dynamic routes (/:id)

// Protected routes for providers (BEFORE /:id)
router.get('/provider/my-courses', protect, authorize('provider'), getMyCourses);

// Protected routes for customers (BEFORE /:id)
router.get('/customer/enrolled', protect, authorize('customer'), getEnrolledCourses);

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes for course management
router.post('/', protect, authorize('provider'), createCourse);
router.put('/:id', protect, authorize('provider'), updateCourse);
router.delete('/:id', protect, authorize('provider'), deleteCourse);

// Enrollment route
router.post('/:id/enroll', protect, authorize('customer'), enrollInCourse);

module.exports = router;

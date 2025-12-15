/**
 * Review Routes
 */

const express = require('express');
const router = express.Router();
const {
  getCourseReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/course/:courseId', getCourseReviews);

// Protected routes
router.use(protect);

router.post('/', authorize('customer'), createReview);
router.get('/my-review/:courseId', getMyReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;

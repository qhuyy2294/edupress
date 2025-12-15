/**
 * Progress Routes
 */

const express = require('express');
const router = express.Router();
const {
  getCourseProgress,
  markLessonAccessed,
  markLessonCompleted,
  getLessonProgress,
} = require('../controllers/progressController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/course/:courseId', getCourseProgress);
router.get('/lesson/:lessonId', getLessonProgress);
router.post('/lesson/:lessonId/access', markLessonAccessed);
router.post('/lesson/:lessonId/complete', markLessonCompleted);

module.exports = router;

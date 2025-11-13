/**
 * Lesson Routes
 */

const express = require('express');
const router = express.Router();
const {
  getCourseLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/course/:courseId', getCourseLessons);
router.get('/:id', getLessonById);

// Protected routes - Provider only
router.use(protect);
router.use(authorize('provider'));

router.post('/', createLesson);
router.put('/reorder', reorderLessons);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

module.exports = router;

/**
 * Progress Controller
 * Handles student learning progress tracking
 */

const asyncHandler = require('express-async-handler');
const Progress = require('../models/progressModel');
const Enrollment = require('../models/enrollmentModel');
const Course = require('../models/courseModel');
const Lesson = require('../models/lessonModel');

/**
 * @desc    Get user's progress for a course
 * @route   GET /api/progress/course/:courseId
 * @access  Private (Enrolled students only)
 */
const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled in this course');
  }

  const progress = await Progress.getCourseProgress(req.user._id, courseId);
  const completionPercentage = await Progress.getCompletionPercentage(
    req.user._id,
    courseId
  );

  res.json({
    success: true,
    data: {
      progress,
      completionPercentage,
    },
  });
});

/**
 * @desc    Mark lesson as accessed/viewed
 * @route   POST /api/progress/lesson/:lessonId/access
 * @access  Private (Enrolled students only)
 */
const markLessonAccessed = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  // Get lesson and course info
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  // Check if user is enrolled in the course
  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: lesson.course,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled in this course');
  }

  // Find or create progress record
  let progress = await Progress.findOne({
    user: req.user._id,
    lesson: lessonId,
  });

  if (progress) {
    await progress.updateAccess();
  } else {
    progress = await Progress.create({
      user: req.user._id,
      course: lesson.course,
      lesson: lessonId,
    });
  }

  res.json({
    success: true,
    data: progress,
    message: 'Lesson access recorded',
  });
});

/**
 * @desc    Mark lesson as completed
 * @route   POST /api/progress/lesson/:lessonId/complete
 * @access  Private (Enrolled students only)
 */
const markLessonCompleted = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  // Get lesson and course info
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: lesson.course,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled in this course');
  }

  // Find or create progress record
  let progress = await Progress.findOne({
    user: req.user._id,
    lesson: lessonId,
  });

  if (progress) {
    if (!progress.completed) {
      await progress.markCompleted();
    }
  } else {
    progress = await Progress.create({
      user: req.user._id,
      course: lesson.course,
      lesson: lessonId,
      completed: true,
      completedAt: new Date(),
    });
  }

  // Calculate updated completion percentage
  const completionPercentage = await Progress.getCompletionPercentage(
    req.user._id,
    lesson.course
  );

  res.json({
    success: true,
    data: {
      progress,
      completionPercentage,
    },
    message: 'Lesson marked as completed',
  });
});

/**
 * @desc    Get lesson details with progress
 * @route   GET /api/progress/lesson/:lessonId
 * @access  Private (Enrolled students only)
 */
const getLessonProgress = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: lesson.course,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled in this course');
  }

  const progress = await Progress.findOne({
    user: req.user._id,
    lesson: lessonId,
  });

  res.json({
    success: true,
    data: {
      lesson,
      progress,
    },
  });
});

module.exports = {
  getCourseProgress,
  markLessonAccessed,
  markLessonCompleted,
  getLessonProgress,
};

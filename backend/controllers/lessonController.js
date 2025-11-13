/**
 * Lesson Controller
 * Handles lesson CRUD operations for providers
 */

const asyncHandler = require('express-async-handler');
const Lesson = require('../models/lessonModel');
const Course = require('../models/courseModel');

/**
 * @desc    Get all lessons for a course
 * @route   GET /api/lessons/course/:courseId
 * @access  Public
 */
const getCourseLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ course: req.params.courseId }).sort({ order: 1 });

  res.json({
    success: true,
    count: lessons.length,
    data: lessons,
  });
});

/**
 * @desc    Get single lesson by ID
 * @route   GET /api/lessons/:id
 * @access  Public
 */
const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  res.json({
    success: true,
    data: lesson,
  });
});

/**
 * @desc    Create a new lesson
 * @route   POST /api/lessons
 * @access  Private (Provider only - must own the course)
 */
const createLesson = asyncHandler(async (req, res) => {
  const { courseId, title, description, videoUrl, duration, content } = req.body;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if user is the course provider
  if (course.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to add lessons to this course');
  }

  // Get the last order number
  const lastLesson = await Lesson.findOne({ course: courseId }).sort({ order: -1 });
  const order = lastLesson ? lastLesson.order + 1 : 1;

  // Create lesson
  const lesson = await Lesson.create({
    course: courseId,
    title,
    description,
    videoUrl,
    duration: duration || 0,
    content,
    order,
  });

  res.status(201).json({
    success: true,
    data: lesson,
    message: 'Lesson created successfully',
  });
});

/**
 * @desc    Update a lesson
 * @route   PUT /api/lessons/:id
 * @access  Private (Provider only - must own the course)
 */
const updateLesson = asyncHandler(async (req, res) => {
  let lesson = await Lesson.findById(req.params.id).populate('course');

  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  // Check if user is the course provider
  if (lesson.course.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this lesson');
  }

  const { title, description, videoUrl, duration, content, order } = req.body;

  if (title) lesson.title = title;
  if (description) lesson.description = description;
  if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
  if (duration !== undefined) lesson.duration = duration;
  if (content !== undefined) lesson.content = content;
  if (order !== undefined) lesson.order = order;

  lesson = await lesson.save();

  res.json({
    success: true,
    data: lesson,
    message: 'Lesson updated successfully',
  });
});

/**
 * @desc    Delete a lesson
 * @route   DELETE /api/lessons/:id
 * @access  Private (Provider only - must own the course)
 */
const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('course');

  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  // Check if user is the course provider
  if (lesson.course.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this lesson');
  }

  await lesson.remove();

  res.json({
    success: true,
    message: 'Lesson deleted successfully',
  });
});

/**
 * @desc    Reorder lessons
 * @route   PUT /api/lessons/reorder
 * @access  Private (Provider only)
 */
const reorderLessons = asyncHandler(async (req, res) => {
  const { courseId, lessonOrders } = req.body;
  // lessonOrders: [{ lessonId, order }, ...]

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check authorization
  if (course.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Update all lesson orders
  const updatePromises = lessonOrders.map(({ lessonId, order }) =>
    Lesson.findByIdAndUpdate(lessonId, { order }, { new: true })
  );

  await Promise.all(updatePromises);

  res.json({
    success: true,
    message: 'Lessons reordered successfully',
  });
});

module.exports = {
  getCourseLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};

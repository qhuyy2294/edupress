/**
 * Review Controller
 * Handles course review operations
 */

const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');
const Notification = require('../models/notificationModel');

/**
 * @desc    Get all reviews for a course
 * @route   GET /api/reviews/course/:courseId
 * @access  Public
 */
const getCourseReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ course: req.params.courseId })
    .populate('user', 'fullName avatarUrl')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private (Customer only - must be enrolled)
 */
const createReview = asyncHandler(async (req, res) => {
  const { courseId, rating, comment } = req.body;

  // Validate input
  if (!courseId || !rating || !comment) {
    res.status(400);
    throw new Error('Please provide course ID, rating, and comment');
  }

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if user is enrolled in the course
  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled in this course to leave a review');
  }

  // Check if user already reviewed this course
  const existingReview = await Review.findOne({
    user: req.user._id,
    course: courseId,
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this course');
  }

  // Create review
  const review = await Review.create({
    course: courseId,
    user: req.user._id,
    rating,
    comment,
  });

  // Populate user info
  await review.populate('user', 'fullName avatarUrl');

  // Populate course to get provider
  await course.populate('provider', 'fullName');

  // Create notification for course provider
  await Notification.createNotification(
    course.provider._id,
    'review',
    'New Review Received! ⭐',
    `${req.user.fullName || 'A student'} left a ${rating}-star review on your course "${course.title}".`,
    `/courses/${course._id}/review`,
    course._id
  );

  res.status(201).json({
    success: true,
    data: review,
    message: 'Review created successfully',
  });
});

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private (Owner only)
 */
const updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check ownership
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  const { rating, comment } = req.body;

  if (rating) review.rating = rating;
  if (comment) review.comment = comment;

  review = await review.save();
  await review.populate('user', 'fullName avatarUrl');

  res.json({
    success: true,
    data: review,
    message: 'Review updated successfully',
  });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Owner or Admin)
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user is owner or admin
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  await review.remove();

  res.json({
    success: true,
    message: 'Review deleted successfully',
  });
});

/**
 * @desc    Get user's review for a course
 * @route   GET /api/reviews/my-review/:courseId
 * @access  Private
 */
const getMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    user: req.user._id,
    course: req.params.courseId,
  }).populate('user', 'fullName avatarUrl');

  res.json({
    success: true,
    data: review,
  });
});

module.exports = {
  getCourseReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReview,
};

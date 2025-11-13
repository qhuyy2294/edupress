/**
 * Course Controller
 * Handles course CRUD operations
 */

const asyncHandler = require('express-async-handler');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const Enrollment = require('../models/enrollmentModel');
const Notification = require('../models/notificationModel');

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private (Provider only)
 */
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, price, thumbnailUrl, category } = req.body;

  // Validate input
  if (!title || !description || !thumbnailUrl || !category) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if course with same title exists
  const courseExists = await Course.findOne({ title });
  if (courseExists) {
    res.status(400);
    throw new Error('Course with this title already exists');
  }

  // Create course
  const course = await Course.create({
    title,
    description,
    price: price || 0,
    thumbnailUrl,
    category,
    provider: req.user._id,
    status: 'pending', // Requires admin approval
  });

  res.status(201).json({
    success: true,
    data: course,
    message: 'Course created successfully. Waiting for admin approval.',
  });
});

/**
 * @desc    Get all approved courses (public)
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = asyncHandler(async (req, res) => {
  // Query parameters for filtering and searching
  const { search, category, minPrice, maxPrice, sort } = req.query;

  let query = { status: 'approved' };

  // Search by title or description
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sorting
  let sortOption = {};
  switch (sort) {
    case 'price_asc':
      sortOption = { price: 1 };
      break;
    case 'price_desc':
      sortOption = { price: -1 };
      break;
    case 'rating':
      sortOption = { averageRating: -1 };
      break;
    case 'popular':
      sortOption = { enrollmentCount: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const courses = await Course.find(query)
    .populate('provider', 'fullName email avatarUrl')
    .sort(sortOption);

  // console.log(`Found ${courses.length} approved courses.`);

  res.json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('provider', 'fullName email avatarUrl')
    .populate('lessons');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Only show approved courses to non-owners
  if (
    course.status !== 'approved' &&
    (!req.user || req.user._id.toString() !== course.provider._id.toString())
  ) {
    res.status(403);
    throw new Error('Course is not available');
  }

  res.json({
    success: true,
    data: course,
  });
});

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Provider - owner only)
 */
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if user is the course owner
  if (course.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not authorized to update this course');
  }

  // Update fields
  const { title, description, price, thumbnailUrl, category } = req.body;

  if (title) course.title = title;
  if (description) course.description = description;
  if (price !== undefined) course.price = price;
  if (thumbnailUrl) course.thumbnailUrl = thumbnailUrl;
  if (category) course.category = category;

  // If course was rejected and now being updated, reset to pending
  if (course.status === 'rejected') {
    course.status = 'pending';
  }

  const updatedCourse = await course.save();

  res.json({
    success: true,
    data: updatedCourse,
    message: 'Course updated successfully',
  });
});

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Provider - owner only)
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if user is the course owner
  if (course.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not authorized to delete this course');
  }

  await course.deleteOne();

  res.json({
    success: true,
    message: 'Course deleted successfully',
  });
});

/**
 * @desc    Get courses created by logged-in provider
 * @route   GET /api/courses/my-courses
 * @access  Private (Provider only)
 */
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ provider: req.user._id }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * @desc    Enroll in a course
 * @route   POST /api/courses/:id/enroll
 * @access  Private (Customer only)
 */
const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  const { discountCode } = req.body;

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.status !== 'approved') {
    res.status(400);
    throw new Error('This course is not available for enrollment');
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    user: req.user._id,
    course: course._id,
  });

  if (existingEnrollment) {
    res.status(400);
    throw new Error('You are already enrolled in this course');
  }

  // Handle discount code if provided
  let finalPrice = course.price;
  let appliedDiscount = null;

  if (discountCode) {
    const Discount = require('../models/discountModel');
    const discount = await Discount.findValidDiscount(discountCode, course._id);

    if (discount) {
      finalPrice = discount.calculateDiscountedPrice(course.price);
      appliedDiscount = {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        originalPrice: course.price,
        discountedPrice: finalPrice,
      };

      // Increment discount usage
      await discount.incrementUsage();
    }
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    user: req.user._id,
    course: course._id,
    pricePaid: finalPrice,
    discountApplied: appliedDiscount,
  });

  // Update course enrollment count
  course.enrollmentCount += 1;
  await course.save();

  // Create notification for user
  await Notification.createNotification(
    req.user._id,
    'enrollment',
    'Enrollment Successful!',
    `You have successfully enrolled in "${course.title}". Start learning now!`,
    `/courses/${course._id}/lessons`,
    course._id
  );

  // Create notification for course provider
  await Notification.createNotification(
    course.provider,
    'enrollment',
    'New Student Enrolled!',
    `A new student has enrolled in your course "${course.title}".`,
    `/course/${course._id}`,
    course._id
  );

  res.status(201).json({
    success: true,
    data: enrollment,
    message: 'Successfully enrolled in the course',
  });
});

/**
 * @desc    Get enrolled courses for logged-in user
 * @route   GET /api/courses/enrolled
 * @access  Private (Customer only)
 */
const getEnrolledCourses = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id })
    .populate({
      path: 'course',
      populate: {
        path: 'provider',
        select: 'fullName email avatarUrl',
      },
    })
    .sort({ enrollmentDate: -1 });

  res.json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  });
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses,
  enrollInCourse,
  getEnrolledCourses,
};

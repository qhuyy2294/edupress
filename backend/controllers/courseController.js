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
    throw new Error('Vui lòng cung cấp tất cả các trường bắt buộc');
  }

  // Check if course with same title exists
  const courseExists = await Course.findOne({ title });
  if (courseExists) {
    res.status(400);
    throw new Error('Khóa học có tiêu đề này đã tồn tại');
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
    message: 'Khóa học đã được tạo thành công. Đang chờ quản trị viên phê duyệt.',
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
    throw new Error('Không tìm thấy khóa học');
  }

  // Only show approved courses to non-owners
  if (
    course.status !== 'approved' &&
    (!req.user || req.user._id.toString() !== course.provider._id.toString())
  ) {
    res.status(403);
    throw new Error('Khóa học không có sẵn');
  }

  let isEnrolled = false;

  if (req.user) {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });
    // Nếu tìm thấy enrollment thì isEnrolled = true -> user đã đăng ký khóa học
    isEnrolled = !!enrollment;
  }

  res.json({
    success: true,
    data: {
      ...course.toObject(),
      isEnrolled: isEnrolled,
    },
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
    throw new Error('Không tìm thấy khóa học');
  }

  // Check if user is the course owner
  if (course.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Bạn không được phép cập nhật khóa học này');
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
    message: 'Khóa học đã được cập nhật thành công',
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
    throw new Error('Không tìm thấy khóa học');
  }

  // Check if user is the course owner
  if (course.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Bạn không được phép xóa khóa học này');
  }

  await course.deleteOne();

  res.json({
    success: true,
    message: 'Khóa học đã xóa thành công',
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
    throw new Error('Khóa học này không có sẵn để đăng ký');
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    user: req.user._id,
    course: course._id,
  });

  if (existingEnrollment) {
    res.status(400);
    throw new Error('Bạn đã đăng ký khóa học này');
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
    'Đăng ký khóa học thành công!',
    `Bạn đã đăng ký tham gia khóa học "${course.title} thành công!". Vào học ngay bây giờ!`,
    `/courses/${course._id}/lessons`,
    course._id
  );

  // Create notification for course provider
  await Notification.createNotification(
    course.provider,
    'enrollment',
    'Sinh viên mới đã đăng ký!',
    `Một học viên mới đã đăng ký khóa học "${course.title}" của bạn.`,
    `/course/${course._id}`,
    course._id
  );

  res.status(201).json({
    success: true,
    data: enrollment,
    message: 'Đã đăng ký khóa học thành công',
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

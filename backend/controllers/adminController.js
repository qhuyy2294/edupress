/**
 * Admin Controller
 * Handles administrative operations
 */

const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');
const Notification = require('../models/notificationModel');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, search } = req.query;

  let query = {};

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Search by name or email
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

/**
 * @desc    Update user information
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin only)
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { fullName, email, role, status, avatarUrl } = req.body;

  if (fullName) user.fullName = fullName;
  if (email) user.email = email;
  if (role) user.role = role;
  if (status) user.status = status;
  if (avatarUrl) user.avatarUrl = avatarUrl;

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: updatedUser,
    message: 'User updated successfully',
  });
});

/**
 * @desc    Activate or deactivate user account
 * @route   PUT /api/admin/users/:id/toggle-status
 * @access  Private (Admin only)
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot deactivate your own account');
  }

  // Toggle status
  user.status = user.status === 'active' ? 'inactive' : 'active';
  await user.save();

  res.json({
    success: true,
    data: user,
    message: `User account ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`,
  });
});

/**
 * @desc    Approve provider request
 * @route   PUT /api/admin/approve-provider/:id
 * @access  Private (Admin only)
 */
const approveProviderRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.status !== 'pending_provider') {
    res.status(400);
    throw new Error('No pending provider request for this user');
  }

  // Update user role and status
  user.role = 'provider';
  user.status = 'active';
  await user.save();

  // Create notification for user
  await Notification.createNotification(
    user._id,
    'provider_approved',
    'Provider Request Approved! 🎉',
    'Congratulations! Your provider request has been approved. You can now create and manage courses.',
    '/course/create'
  );

  res.json({
    success: true,
    data: user,
    message: 'Provider request approved successfully',
  });
});

/**
 * @desc    Reject provider request
 * @route   PUT /api/admin/reject-provider/:id
 * @access  Private (Admin only)
 */
const rejectProviderRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.status !== 'pending_provider') {
    res.status(400);
    throw new Error('No pending provider request for this user');
  }

  // Reset status to active
  user.status = 'active';
  await user.save();

  // Create notification for user
  await Notification.createNotification(
    user._id,
    'provider_rejected',
    'Provider Request Not Approved',
    'Unfortunately, your provider request was not approved at this time. Please contact support for more information.',
    '/profile'
  );

  res.json({
    success: true,
    data: user,
    message: 'Provider request rejected',
  });
});

/**
 * @desc    Get all pending provider requests
 * @route   GET /api/admin/pending-providers
 * @access  Private (Admin only)
 */
const getPendingProviders = asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({ status: 'pending_provider' })
    .select('-password')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: pendingUsers.length,
    data: pendingUsers,
  });
});

/**
 * @desc    Get all courses (for admin management)
 * @route   GET /api/admin/courses
 * @access  Private (Admin only)
 */
const getAllCourses = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;

  let query = {};

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Search by title or description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const courses = await Course.find(query)
    .populate('provider', 'fullName email avatarUrl')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * @desc    Get all pending courses
 * @route   GET /api/admin/pending-courses
 * @access  Private (Admin only)
 */
const getPendingCourses = asyncHandler(async (req, res) => {
  const pendingCourses = await Course.find({ status: 'pending' })
    .populate('provider', 'fullName email avatarUrl')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: pendingCourses.length,
    data: pendingCourses,
  });
});

/**
 * @desc    Approve course
 * @route   PUT /api/admin/approve-course/:id
 * @access  Private (Admin only)
 */
const approveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.status === 'approved') {
    res.status(400);
    throw new Error('Course is already approved');
  }

  course.status = 'approved';
  await course.save();

  // Populate provider for notification
  await course.populate('provider', 'fullName');

  // Create notification for course provider
  await Notification.createNotification(
    course.provider._id,
    'course_approved',
    'Course Approved! ✅',
    `Your course "${course.title}" has been approved and is now live on the platform!`,
    `/course/${course._id}`,
    course._id
  );

  res.json({
    success: true,
    data: course,
    message: 'Course approved successfully',
  });
});

/**
 * @desc    Reject course
 * @route   PUT /api/admin/reject-course/:id
 * @access  Private (Admin only)
 */
const rejectCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  course.status = 'rejected';
  await course.save();

  // Populate provider for notification
  await course.populate('provider', 'fullName');

  // Create notification for course provider
  await Notification.createNotification(
    course.provider._id,
    'course_rejected',
    'Course Not Approved',
    `Your course "${course.title}" was not approved. Please review our course guidelines and resubmit after making necessary changes.`,
    `/course/${course._id}/edit`,
    course._id
  );

  res.json({
    success: true,
    data: course,
    message: 'Course rejected',
  });
});

/**
 * @desc    Get system statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getSystemStats = asyncHandler(async (req, res) => {
  // Count users by role
  const totalUsers = await User.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalProviders = await User.countDocuments({ role: 'provider' });
  const pendingProviders = await User.countDocuments({ status: 'pending_provider' });

  // Count courses by status
  const totalCourses = await Course.countDocuments();
  const approvedCourses = await Course.countDocuments({ status: 'approved' });
  const pendingCourses = await Course.countDocuments({ status: 'pending' });
  const rejectedCourses = await Course.countDocuments({ status: 'rejected' });

  // Count enrollments
  const totalEnrollments = await Enrollment.countDocuments();

  // Calculate total revenue (sum of all course prices from enrollments)
  const revenueData = await Enrollment.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'courseData',
      },
    },
    {
      $unwind: '$courseData',
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$courseData.price' },
      },
    },
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        providers: totalProviders,
        pendingProviders,
      },
      courses: {
        total: totalCourses,
        approved: approvedCourses,
        pending: pendingCourses,
        rejected: rejectedCourses,
      },
      enrollments: totalEnrollments,
      revenue: totalRevenue,
    },
  });
});

module.exports = {
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
};

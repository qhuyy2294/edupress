/**
 * User Controller
 * Handles user-specific operations
 */

const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

/**
 * @desc    Request to become a course provider
 * @route   POST /api/users/request-provider
 * @access  Private (Customer only)
 */
const requestToBeProvider = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user is already a provider or admin
  if (user.role === 'provider') {
    res.status(400);
    throw new Error('You are already a course provider');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Admin cannot become a provider');
  }

  // Check if request is already pending
  if (user.status === 'pending_provider') {
    res.status(400);
    throw new Error('Your request is already pending approval');
  }

  // Update user status
  user.status = 'pending_provider';
  await user.save();

  res.json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    message: 'Request to become a provider submitted successfully. Waiting for admin approval.',
  });
});

/**
 * @desc    Delete user account request
 * @route   DELETE /api/users/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from deleting their own account
  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be deleted through this endpoint');
  }

  // Soft delete - set status to inactive
  user.status = 'inactive';
  await user.save();

  res.json({
    success: true,
    message: 'Account has been deactivated successfully',
  });
});

module.exports = {
  requestToBeProvider,
  deleteAccount,
};

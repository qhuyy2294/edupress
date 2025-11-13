/**
 * Notification Controller
 * Handle notification CRUD operations
 */

const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');

/**
 * @desc    Get all notifications for logged in user
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const query = { user: req.user._id };
  if (unreadOnly === 'true') {
    query.read = false;
  }

  const notifications = await Notification.find(query)
    .populate('relatedCourse', 'title')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.getUnreadCount(req.user._id);

  res.json({
    notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
    unreadCount,
  });
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user._id);
  res.json({ count });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check ownership
  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this notification');
  }

  await notification.markAsRead();

  res.json({ message: 'Notification marked as read' });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  res.json({ message: 'All notifications marked as read' });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check ownership
  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }

  await notification.deleteOne();

  res.json({ message: 'Notification deleted' });
});

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/clear-read
 * @access  Private
 */
const clearReadNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    user: req.user._id,
    read: true,
  });

  res.json({
    message: 'Read notifications cleared',
    deletedCount: result.deletedCount,
  });
});

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
};

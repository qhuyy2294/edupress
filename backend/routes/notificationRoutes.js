/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

// Get my notifications
router.get('/', getMyNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Clear read notifications
router.delete('/clear-read', clearReadNotifications);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Delete single notification
router.delete('/:id', deleteNotification);

module.exports = router;

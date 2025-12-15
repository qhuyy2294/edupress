/**
 * Notification Model
 * Simple in-app notification system
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['enrollment', 'review', 'course_approved', 'course_rejected', 'provider_approved', 'provider_rejected', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String, // URL to navigate when clicked
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

/**
 * Static method to create notification
 */
notificationSchema.statics.createNotification = async function(userId, type, title, message, link = null, relatedCourse = null) {
  try {
    const notification = await this.create({
      user: userId,
      type,
      title,
      message,
      link,
      relatedCourse,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Static method to get unread count
 */
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ user: userId, read: false });
};

/**
 * Mark notification as read
 */
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  return await this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

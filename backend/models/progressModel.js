/**
 * Progress Model
 * Tracks student's learning progress
 */

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: One progress record per user per lesson
progressSchema.index({ user: 1, lesson: 1 }, { unique: true });

// Index for querying user's progress in a course
progressSchema.index({ user: 1, course: 1 });

/**
 * Mark lesson as completed
 */
progressSchema.methods.markCompleted = function () {
  this.completed = true;
  this.completedAt = new Date();
  return this.save();
};

/**
 * Update last accessed time
 */
progressSchema.methods.updateAccess = function () {
  this.lastAccessedAt = new Date();
  return this.save();
};

/**
 * Static method: Get user's progress for a course
 * @param {ObjectId} userId - User ID
 * @param {ObjectId} courseId - Course ID
 * @returns {Promise} - Progress records
 */
progressSchema.statics.getCourseProgress = async function (userId, courseId) {
  return this.find({ user: userId, course: courseId }).populate('lesson');
};

/**
 * Static method: Calculate completion percentage
 * @param {ObjectId} userId - User ID
 * @param {ObjectId} courseId - Course ID
 * @returns {Promise<Number>} - Completion percentage (0-100)
 */
progressSchema.statics.getCompletionPercentage = async function (userId, courseId) {
  const Course = mongoose.model('Course');
  const course = await Course.findById(courseId).populate('lessons');
  
  if (!course || !course.lessons || course.lessons.length === 0) {
    return 0;
  }

  const totalLessons = course.lessons.length;
  const completedCount = await this.countDocuments({
    user: userId,
    course: courseId,
    completed: true,
  });

  return Math.round((completedCount / totalLessons) * 100);
};

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;

/**
 * Enrollment Model
 * Tracks user enrollments in courses
 */

const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    pricePaid: {
      type: Number,
      default: 0,
    },
    discountApplied: {
      code: String,
      type: String,
      value: Number,
      originalPrice: Number,
      discountedPrice: Number,
    },
    // Additional useful fields
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    completionDate: {
      type: Date,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only enroll once per course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Create and export the model
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;

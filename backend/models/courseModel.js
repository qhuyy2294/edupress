/**
 * Course Model
 * Defines the schema for courses in the platform
 */

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      unique: true,
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a course description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a course price'],
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Please add a thumbnail URL'],
    },
    category: {
      type: String,
      required: [true, 'Please add a course category'],
      trim: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Additional useful fields
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for lessons
courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  justOne: false,
});

// Index for better query performance
courseSchema.index({ title: 'text', description: 'text', category: 'text' });
courseSchema.index({ status: 1, createdAt: -1 });

// Create and export the model
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

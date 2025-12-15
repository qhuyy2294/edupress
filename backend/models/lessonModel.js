/**
 * Lesson Model
 * Defines the schema for lessons within courses
 */

const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a lesson title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    videoUrl: {
      type: String,
      required: [true, 'Please add a video URL'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    duration: {
      type: Number,
      required: [true, 'Please add lesson duration in minutes'],
      min: [0, 'Duration cannot be negative'],
    },
    // Additional useful fields
    order: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['pdf', 'document', 'link', 'other'],
        },
      },
    ],
    isFree: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
lessonSchema.index({ course: 1, order: 1 });

// Create and export the model
const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;

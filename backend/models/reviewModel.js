/**
 * Review Model
 * Defines the schema for course reviews/ratings
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      maxlength: [500, 'Comment cannot be more than 500 characters'],
    },
    // Helpful votes (like feature)
    helpfulVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per course
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Static method to calculate average rating for a course
reviewSchema.statics.calculateAverageRating = async function(courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId }
    },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    // Update the course with new average rating
    if (stats.length > 0) {
      await this.model('Course').findByIdAndUpdate(courseId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: stats[0].totalReviews,
      });
    } else {
      // No reviews, reset to 0
      await this.model('Course').findByIdAndUpdate(courseId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  } catch (error) {
    console.error('Error updating course rating:', error);
  }
};

// Update course rating after save
reviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.course);
});

// Update course rating after remove
reviewSchema.post('remove', async function() {
  await this.constructor.calculateAverageRating(this.course);
});

// Create and export the model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

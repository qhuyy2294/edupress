/**
 * Discount Model
 * Discount codes/coupons for courses
 */

const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide discount code'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Code must be at least 3 characters'],
      maxlength: [20, 'Code cannot exceed 20 characters'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: [true, 'Please provide discount value'],
      min: [0, 'Discount value cannot be negative'],
    },
    maxUses: {
      type: Number,
      default: null, // null = unlimited
      min: [1, 'Max uses must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
discountSchema.index({ course: 1, code: 1 });
discountSchema.index({ provider: 1, active: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });

/**
 * Validate discount dates
 */
discountSchema.pre('validate', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  
  // Validate percentage discount
  if (this.type === 'percentage' && this.value > 100) {
    next(new Error('Percentage discount cannot exceed 100%'));
  }
  
  next();
});

/**
 * Check if discount is valid
 */
discountSchema.methods.isValid = function() {
  const now = new Date();
  
  // Check if active
  if (!this.active) return false;
  
  // Check dates
  if (now < this.startDate || now > this.endDate) return false;
  
  // Check max uses
  if (this.maxUses && this.usedCount >= this.maxUses) return false;
  
  return true;
};

/**
 * Calculate discounted price
 */
discountSchema.methods.calculateDiscountedPrice = function(originalPrice) {
  if (!this.isValid()) return originalPrice;
  
  if (this.type === 'percentage') {
    const discount = (originalPrice * this.value) / 100;
    return Math.max(0, originalPrice - discount);
  } else {
    // fixed amount discount
    return Math.max(0, originalPrice - this.value);
  }
};

/**
 * Increment used count
 */
discountSchema.methods.incrementUsage = async function() {
  this.usedCount += 1;
  
  // Auto-deactivate if max uses reached
  if (this.maxUses && this.usedCount >= this.maxUses) {
    this.active = false;
  }
  
  return await this.save();
};

/**
 * Static method to find valid discount by code and course
 */
discountSchema.statics.findValidDiscount = async function(code, courseId) {
  const discount = await this.findOne({
    code: code.toUpperCase(),
    course: courseId,
    active: true,
  });
  
  if (!discount) return null;
  
  return discount.isValid() ? discount : null;
};

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  discountCode: {
    type: String,
    default: null
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  qrCodeUrl: {
    type: String,
    default: '/images/QR.png'
  },
  paymentNote: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);

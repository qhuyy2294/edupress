const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  subTotal: { 
    type: Number, 
    default: 0 
  },
  discountCode: { 
    type: String, 
    default: null 
  },
  discountAmount: { 
    type: Number, 
    default: 0 
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  finalTotal: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => total + item.price, 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

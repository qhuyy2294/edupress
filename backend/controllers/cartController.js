const Cart = require('../models/cartModel');
const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.course');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add course to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại' });
    }

    // Check if already enrolled
    const enrolled = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (enrolled) {
      return res.status(400).json({ message: 'Bạn đã đăng ký khóa học này rồi' });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if course already in cart
    const itemExists = cart.items.some(item => item.course.toString() === courseId);
    if (itemExists) {
      return res.status(400).json({ message: 'Khóa học đã có trong giỏ hàng' });
    }

    // Add to cart
    cart.items.push({
      course: courseId,
      price: course.price
    });

    await cart.save();
    await cart.populate('items.course');

    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove course from cart
// @route   DELETE /api/cart/:courseId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    cart.items = cart.items.filter(item => item.course.toString() !== courseId);
    await cart.save();
    await cart.populate('items.course');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.json({ message: 'Đã xóa tất cả khóa học khỏi giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart ? cart.items.length : 0;
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

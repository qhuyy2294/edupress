const Cart = require('../models/cartModel');
const Course = require('../models/courseModel');
const Discount = require('../models/discountModel');
const Enrollment = require('../models/enrollmentModel');


// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.course',
        populate: {
          path: 'provider',
          select: 'fullName'
        }
      });
    
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

    cart.subTotal = cart.items.reduce((total, item) => total + item.price, 0);

    // Nếu chưa có mã giảm giá thì giá cuối = giá gốc
    if (!cart.discountCode) {
        cart.discountAmount = 0;
        cart.finalTotal = cart.subTotal;
    } else {
        cart.finalTotal = Math.max(0, cart.subTotal - (cart.discountAmount || 0));
    }
    await cart.save();
    await cart.populate({
      path: 'items.course',
      populate: {
        path: 'provider',
        select: 'fullName'
      }
    });

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
    await cart.populate({
      path: 'items.course',
      populate: {
        path: 'provider',
        select: 'fullName'
      }
    });

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

exports.applyDiscountCode = async (req, res) => {
  try {
    const { discountCode } = req.body;
    const userId = req.user._id;

    // Lấy giỏ hàng
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.course',
      populate: {
        path: 'provider',
        select: 'fullName'
      }
    });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Tính lại subTotal (tổng tiền gốc) để đảm bảo chính xác
    cart.subTotal = cart.items.reduce((sum, item) => sum + item.price, 0);

    if (!discountCode) {
      cart.discountCode = null;
      cart.discountAmount = 0;
      cart.finalTotal = cart.subTotal;
      await cart.save();
      return res.status(200).json({ message: 'Đã hủy mã giảm giá', cart });
    }

    const discount = await Discount.findOne({ code: discountCode.toUpperCase(), active: true });

    // // Validate cơ bản
    // Check mã có hợp lệ không
    if (!discount) {
      return res.status(400).json({
        message: 'Mã giảm giá không đúng. Vui lòng nhập lại!' 
      }); 
    }
    // Check mã có còn thời hạn không
    if (discount.validUntil < new Date()) {
      return res.status(400).json({
        message: 'Mã giảm giá đã hết hạn' 
      });
    } 
    // Check mã có còn lượt sử dụng không
    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      return res.status(400).json({
        message: 'Mã giảm giá đã hết lượt dùng' 
      });
    }

    // Tính toán
    let discountAmount = 0;

    if (discount.type === 'percentage') {
      discountAmount = (cart.subTotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    // Cập nhật cart
    cart.discountCode = discountCode;
    cart.discountAmount = discountAmount;
    cart.finalTotal = Math.max(0, cart.subTotal - discountAmount);

    await cart.save();

    return res.status(200).json({ 
      message: 'Áp dụng mã thành công', 
      cart // Trả về cart mới để FE hiển thị
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

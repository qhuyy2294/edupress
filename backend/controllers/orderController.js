const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');
const Discount = require('../models/discountModel');
const Notification = require('../models/notificationModel');

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private

// exports.createOrder = async (req, res) => {
//   try {
//     const { discountCode } = req.body;

//     console.log('Creating order for user:', req.user._id);

//     // Get cart
//     const cart = await Cart.findOne({ user: req.user._id }).populate('items.course');
//     console.log('Cart found:', cart);
    
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: 'Giỏ hàng trống' });
//     }

//     let totalAmount = cart.totalAmount;
//     let discountAmount = 0;
//     let finalAmount = totalAmount;

//     // Apply discount if provided
//     if (discountCode) {
//       const discount = await Discount.findOne({ 
//         code: discountCode,
//         isActive: true
//       });

//       if (discount) {
//         // Check if discount is valid for any course in cart
//         const validForCart = cart.items.some(item => 
//           discount.applicableCourses.length === 0 || 
//           discount.applicableCourses.includes(item.course._id.toString())
//         );
        
//         if (validForCart) {
//           // Check expiry and usage
//           const now = new Date();
//           if (discount.validFrom <= now && discount.validUntil >= now) {
//             if (!discount.maxUses || discount.currentUses < discount.maxUses) {
//               // Calculate discount
//               if (discount.discountType === 'percentage') {
//                 discountAmount = (totalAmount * discount.discountValue) / 100; 
//               } else {
//                 discountAmount = discount.discountValue;
//               }
//               finalAmount = Math.max(0, totalAmount - discountAmount);

//               // Update discount usage
//               discount.currentUses += 1;
//               await discount.save();
//             }
//           }
//         }
//       }
//     }

//     // Prepare courses data with provider info
//     const coursesData = await Promise.all(cart.items.map(async (item) => {
//       const course = await Course.findById(item.course._id);
//       console.log('Course found:', course);
      
//       if (!course) {
//         throw new Error(`Khóa học không tồn tại: ${item.course._id}`);
//       }
      
//       if (!course.provider) {
//         throw new Error(`Khóa học ${course.title} không có provider`);
//       }
      
//       return {
//         course: item.course._id,
//         price: item.price,
//         provider: course.provider
//       };
//     }));

//     // Create order
//     const order = await Order.create({
//       user: req.user._id,
//       courses: coursesData,
//       totalAmount,
//       discountCode: discountCode || null,
//       discountAmount,
//       finalAmount,
//       status: 'pending',
//       paymentNote: `EDUPRESS${Date.now()}`
//     });
    
//     // Clear cart after creating order
//     cart.items = [];
//     cart.totalAmount = 0;
//     await cart.save();

//     // Populate order data
//     await order.populate('courses.course user');

//     res.status(201).json(order);
//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(500).json({ message: error.message, stack: error.stack });
//   }
// };


exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    // Lấy giỏ hàng
    const cart = await Cart.findOne({ user: userId }).populate('items.course');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    if (cart.discountCode) {
      const discount = await Discount.findOne({ code: cart.discountCode, isActive: true });
      const now = new Date();
      
      if (!discount || discount.validUntil < now || (discount.maxUses && discount.currentUses >= discount.maxUses)) {
        // Reset Cart về giá ban đầu
        cart.discountCode = null;
        cart.discountAmount = 0;
        cart.finalTotal = cart.subTotal;
        await cart.save();
        
        return res.status(400).json({ 
          message: 'Mã giảm giá đã hết hạn hoặc hết lượt dùng. Vui lòng thử lại.' 
        });
      }

      discount.currentUses += 1;
      await discount.save();
    }

    // Tạo Order lấy toàn bộ số liệu tiền từ Cart sang Order
    const newOrder = await orderModel.create({
      user: userId,
      courses: cart.items.map(item => ({
        course: item.course._id,
        price: item.price,
        provider: item.course.provider
      })),
      totalAmount: cart.subTotal,        // Giá gốc
      discountCode: cart.discountCode,   // Mã giảm
      discountAmount: cart.discountAmount, // Tiền giảm
      finalAmount: cart.finalTotal,      // Tiền khách phải trả
      status: 'pending',
      paymentNote: `ORDER_${Date.now()}`
    });

    cart.items = [];
    cart.subTotal = 0;
    cart.discountCode = null;
    cart.discountAmount = 0;
    cart.finalTotal = 0;
    await cart.save();

    return res.status(201).json({ 
      message: 'Tạo đơn hàng thành công', 
      order: newOrder 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('courses.course')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('courses.course user approvedBy');

    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xem đơn hàng này' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark order as paid (user confirms payment)
// @route   PUT /api/orders/:id/paid
// @access  Private
exports.markOrderPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Đơn hàng đã được xử lý' });
    }

    // Status remains pending, waiting for admin approval
    order.paymentNote = `${order.paymentNote} - User confirmed at ${new Date().toLocaleString()}`;
    await order.save();

    // Notify admin (optional - only if you want notifications)
    try {
      await Notification.create({
        user: null, // Will be sent to all admins
        title: 'Đơn hàng mới cần duyệt',
        message: `${req.user.fullName || req.user.email} đã xác nhận thanh toán đơn hàng ${order._id}`,
        type: 'order',
        link: `/admin/orders/${order._id}`
      });
    } catch (notifError) {
      console.log('Notification error (non-critical):', notifError.message);
    }

    res.json({ message: 'Đã xác nhận thanh toán. Đơn hàng đang chờ admin duyệt.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
      .populate('user courses.course approvedBy')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve order (Admin)
// @route   PUT /api/orders/:id/approve
// @access  Private/Admin
exports.approveOrder = async (req, res) => {
  try {
    console.log('Approving order:', req.params.id);
    
    const order = await Order.findById(req.params.id).populate('courses.course user');

    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    console.log('Order found:', order._id, 'Status:', order.status);

    if (order.status !== 'pending') {
      console.log('Order already processed:', order.status);
      return res.status(400).json({ message: 'Đơn hàng đã được xử lý' });
    }

    // Update order status
    order.status = 'approved';
    order.approvedBy = req.user._id;
    order.approvedAt = Date.now();
    await order.save();
    console.log('Order status updated to approved');

    // Create enrollments for all courses
    console.log('Creating enrollments for', order.courses.length, 'courses');
    for (const item of order.courses) {
      if (!item.course) {
        console.error('Course not found in order item:', item);
        continue;
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        user: order.user._id,
        course: item.course._id
      });

      if (existingEnrollment) {
        console.log('Already enrolled in course:', item.course._id);
        continue;
      }

      const enrollment = await Enrollment.create({
        user: order.user._id,
        course: item.course._id,
        pricePaid: item.price,
        progress: 0
      });
      console.log('Created enrollment:', enrollment._id);

      // Update course enrollment count
      await Course.findByIdAndUpdate(item.course._id, {
        $inc: { enrollmentCount: 1 }
      });
      console.log('Updated course enrollment count');
    }

    // Notify user
    try {
      await Notification.create({
        user: order.user._id,
        title: 'Đơn hàng đã được duyệt',
        message: `Đơn hàng #${order._id.toString().slice(-8)} đã được duyệt. Bạn có thể bắt đầu học ngay!`,
        type: 'success',
        link: `/my-courses`
      });
      console.log('Notification created');
    } catch (notifError) {
      console.log('Notification error (non-critical):', notifError.message);
    }

    res.json({ message: 'Đã duyệt đơn hàng thành công', order });
  } catch (error) {
    console.error('Error approving order:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// @desc    Reject order (Admin)
// @route   PUT /api/orders/:id/reject
// @access  Private/Admin
exports.rejectOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Đơn hàng đã được xử lý' });
    }

    order.status = 'rejected';
    order.approvedBy = req.user._id;
    order.rejectedReason = reason || 'Không nhận được thanh toán';
    await order.save();

    // Notify user
    await Notification.create({
      user: order.user._id,
      title: 'Đơn hàng bị từ chối',
      message: `Đơn hàng #${order._id} bị từ chối. Lý do: ${order.rejectedReason}`,
      type: 'error',
      link: `/orders/${order._id}`
    });

    res.json({ message: 'Đã từ chối đơn hàng', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get revenue statistics
// @route   GET /api/orders/revenue/stats
// @access  Private/Admin or Provider
exports.getRevenueStats = async (req, res) => {
  try {
    let filter = { status: 'approved' };

    // If provider, only show their courses
    if (req.user.role === 'provider') {
      const courses = await Course.find({ provider: req.user._id });
      const courseIds = courses.map(c => c._id);
      filter['courses.course'] = { $in: courseIds };
    }

    const orders = await Order.find(filter).populate('courses.course');

    let totalRevenue = 0;
    let providerRevenue = 0;
    let adminCommission = 0;

    orders.forEach(order => {
      order.courses.forEach(item => {
        const amount = item.price;
        totalRevenue += amount;

        if (req.user.role === 'admin') {
          // Admin sees all revenue split
          const providerShare = amount * 0.9;
          const adminShare = amount * 0.1;
          providerRevenue += providerShare;
          adminCommission += adminShare;
        } else if (req.user.role === 'provider') {
          // Provider only sees their 90%
          if (item.provider && item.provider.toString() === req.user._id.toString()) {
            providerRevenue += amount * 0.9;
          }
        }
      });
    });

    res.json({
      totalOrders: orders.length,
      totalRevenue,
      providerRevenue: req.user.role === 'provider' ? providerRevenue : providerRevenue,
      adminCommission: req.user.role === 'admin' ? adminCommission : 0,
      orders: orders.slice(0, 10) // Return last 10 orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

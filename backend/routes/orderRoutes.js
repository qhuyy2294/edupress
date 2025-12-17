const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  markOrderPaid,
  getAllOrders,
  approveOrder,
  rejectOrder,
  getRevenueStats,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// User routes
router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/revenue/stats', protect, authorize('admin', 'provider'), getRevenueStats);
router.get('/:id', protect, getOrderById);
router.put('/:id/paid', protect, markOrderPaid);
router.delete('/:id', protect, cancelOrder);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.put('/:id/approve', protect, authorize('admin'), approveOrder);
router.put('/:id/reject', protect, authorize('admin'), rejectOrder);

module.exports = router;

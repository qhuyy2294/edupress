const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  getCartCount,
  applyDiscountCode
} = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

router.put('/apply-discount', protect, applyDiscountCode)

router.get('/count', protect, getCartCount);
router.delete('/:courseId', protect, removeFromCart);

module.exports = router;

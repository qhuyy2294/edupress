/**
 * Discount Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createDiscount,
  getMyDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  validateDiscount,
  toggleDiscountStatus,
} = require('../controllers/discountController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Validation rules
const createDiscountValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Discount code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Code must be 3-20 characters'),
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('type')
    .isIn(['percentage', 'fixed'])
    .withMessage('Type must be percentage or fixed'),
  body('value')
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date'),
];

const updateDiscountValidation = [
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date'),
];

// Public route
router.post('/validate', validateDiscount);

// Protected routes (Provider only)
router.use(protect);
router.use(authorize('provider', 'admin'));

router
  .route('/')
  .get(getMyDiscounts)
  .post(createDiscountValidation, createDiscount);

router
  .route('/:id')
  .get(getDiscountById)
  .put(updateDiscountValidation, updateDiscount)
  .delete(deleteDiscount);

router.patch('/:id/toggle', toggleDiscountStatus);

module.exports = router;

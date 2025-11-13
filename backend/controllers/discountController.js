/**
 * Discount Controller
 * Handle discount code operations for providers
 */

const Discount = require('../models/discountModel');
const Course = require('../models/courseModel');
const { validationResult } = require('express-validator');

/**
 * @desc    Create discount code
 * @route   POST /api/discounts
 * @access  Private (Provider only)
 */
exports.createDiscount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, courseId, type, value, maxUses, startDate, endDate, description } = req.body;

    // Verify course exists and belongs to provider
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create discount for this course' });
    }

    // Check if code already exists for this course
    const existingDiscount = await Discount.findOne({
      code: code.toUpperCase(),
      course: courseId,
    });

    if (existingDiscount) {
      return res.status(400).json({ message: 'Discount code already exists for this course' });
    }

    const discount = await Discount.create({
      code: code.toUpperCase(),
      course: courseId,
      provider: req.user._id,
      type,
      value,
      maxUses: maxUses || null,
      startDate,
      endDate,
      description,
    });

    await discount.populate('course', 'title');

    res.status(201).json({
      success: true,
      data: discount,
    });
  } catch (error) {
    console.error('Create discount error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Get all discounts for provider
 * @route   GET /api/discounts
 * @access  Private (Provider only)
 */
exports.getMyDiscounts = async (req, res) => {
  try {
    const { courseId, active } = req.query;

    const filter = { provider: req.user._id };
    
    if (courseId) filter.course = courseId;
    if (active !== undefined) filter.active = active === 'true';

    const discounts = await Discount.find(filter)
      .populate('course', 'title price')
      .sort('-createdAt');

    res.json({
      success: true,
      count: discounts.length,
      data: discounts,
    });
  } catch (error) {
    console.error('Get discounts error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Get discount by ID
 * @route   GET /api/discounts/:id
 * @access  Private (Provider only)
 */
exports.getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id)
      .populate('course', 'title price');

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    // Verify ownership
    if (discount.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: discount,
    });
  } catch (error) {
    console.error('Get discount error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Update discount
 * @route   PUT /api/discounts/:id
 * @access  Private (Provider only)
 */
exports.updateDiscount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    // Verify ownership
    if (discount.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { value, maxUses, startDate, endDate, description, active } = req.body;

    // Update allowed fields
    if (value !== undefined) discount.value = value;
    if (maxUses !== undefined) discount.maxUses = maxUses;
    if (startDate) discount.startDate = startDate;
    if (endDate) discount.endDate = endDate;
    if (description !== undefined) discount.description = description;
    if (active !== undefined) discount.active = active;

    await discount.save();
    await discount.populate('course', 'title price');

    res.json({
      success: true,
      data: discount,
    });
  } catch (error) {
    console.error('Update discount error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Delete discount
 * @route   DELETE /api/discounts/:id
 * @access  Private (Provider only)
 */
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    // Verify ownership
    if (discount.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await discount.deleteOne();

    res.json({
      success: true,
      message: 'Discount deleted successfully',
    });
  } catch (error) {
    console.error('Delete discount error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Validate discount code
 * @route   POST /api/discounts/validate
 * @access  Public
 */
exports.validateDiscount = async (req, res) => {
  try {
    const { code, courseId } = req.body;

    if (!code || !courseId) {
      return res.status(400).json({ message: 'Please provide code and courseId' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const discount = await Discount.findValidDiscount(code, courseId);

    if (!discount) {
      return res.status(404).json({ 
        valid: false,
        message: 'Invalid or expired discount code' 
      });
    }

    const discountedPrice = discount.calculateDiscountedPrice(course.price);

    res.json({
      valid: true,
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        originalPrice: course.price,
        discountedPrice,
        savings: course.price - discountedPrice,
      },
    });
  } catch (error) {
    console.error('Validate discount error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Toggle discount active status
 * @route   PATCH /api/discounts/:id/toggle
 * @access  Private (Provider only)
 */
exports.toggleDiscountStatus = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    // Verify ownership
    if (discount.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    discount.active = !discount.active;
    await discount.save();
    await discount.populate('course', 'title price');

    res.json({
      success: true,
      data: discount,
    });
  } catch (error) {
    console.error('Toggle discount error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

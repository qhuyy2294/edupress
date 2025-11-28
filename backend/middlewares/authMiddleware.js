const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');


const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // if (req.cookies && req.cookies.token) {
  //   token = req.cookies.token;
  // }
  if (
    // Check if token exists in Authorization header
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {

    try {
      // Get token from header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      // Check if user account is active
      if (req.user.status === 'inactive') {
        res.status(403);
        throw new Error('Account is inactive. Please contact support.');
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

/**
 * Authorize roles - Check if user has required role
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};

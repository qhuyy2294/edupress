/**
 * Error Handling Middleware
 * Central error handling for the application
 */

/**
 * Error handler middleware
 * Catches all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);

  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  });
};

/**
 * Not found handler
 * Handles 404 errors
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};

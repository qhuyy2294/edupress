/**
 * Edupress Backend Server
 * Main entry point for the Express.js application
 */

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
// const path = require('path');

// Load environment variables
dotenv.config();

// Import models first to ensure they are registered with Mongoose
// This is important for virtual populate to work correctly
require('./models/userModel');
require('./models/lessonModel'); // Import Lesson BEFORE Course
require('./models/courseModel');
require('./models/enrollmentModel');
require('./models/reviewModel');
require('./models/progressModel');
require('./models/notificationModel');
require('./models/discountModel');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const progressRoutes = require('./routes/progressRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const discountRoutes = require('./routes/discountRoutes');

// Import error handling middleware
const { errorHandler } = require('./middlewares/errorMiddleware');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Request logger middleware
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
//   next();
// });

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Edupress API - Online Learning Platform',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      admin: '/api/admin',
      reviews: '/api/reviews',
      progress: '/api/progress',
      lessons: '/api/lessons',
      notifications: '/api/notifications',
      discounts: '/api/discounts'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/discounts', discountRoutes);

// // Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
//   // Set static folder
//   app.use(express.static(path.join(__dirname, '../client/build')));

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
//   });
// }

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  process.exit(1);
});

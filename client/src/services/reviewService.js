/**
 * Review Service
 * Handles API calls for course reviews
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get all reviews for a course
 * @param {string} courseId - Course ID
 * @returns {Promise} - Reviews data
 */
export const getCourseReviews = async (courseId) => {
  const response = await axios.get(`${API_URL}/reviews/course/${courseId}`);
  return response.data;
};

/**
 * Get user's review for a course
 * @param {string} courseId - Course ID
 * @returns {Promise} - Review data
 */
export const getMyReview = async (courseId) => {
  const response = await axios.get(`${API_URL}/reviews/my-review/${courseId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Create a new review
 * @param {Object} reviewData - { courseId, rating, comment }
 * @returns {Promise} - Created review data
 */
export const createReview = async (reviewData) => {
  const response = await axios.post(`${API_URL}/reviews`, reviewData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Update a review
 * @param {string} reviewId - Review ID
 * @param {Object} updateData - { rating?, comment? }
 * @returns {Promise} - Updated review data
 */
export const updateReview = async (reviewId, updateData) => {
  const response = await axios.put(`${API_URL}/reviews/${reviewId}`, updateData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @returns {Promise} - Success message
 */
export const deleteReview = async (reviewId) => {
  const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

const reviewService = {
  getCourseReviews,
  getMyReview,
  createReview,
  updateReview,
  deleteReview,
};

export default reviewService;

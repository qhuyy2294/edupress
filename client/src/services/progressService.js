/**
 * Progress Service
 * Handles API calls for learning progress tracking
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get user's progress for a course
 * @param {string} courseId - Course ID
 * @returns {Promise} - Progress data with completion percentage
 */
export const getCourseProgress = async (courseId) => {
  const response = await axios.get(`${API_URL}/progress/course/${courseId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Get lesson details with progress
 * @param {string} lessonId - Lesson ID
 * @returns {Promise} - Lesson and progress data
 */
export const getLessonProgress = async (lessonId) => {
  const response = await axios.get(`${API_URL}/progress/lesson/${lessonId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Mark lesson as accessed/viewed
 * @param {string} lessonId - Lesson ID
 * @returns {Promise} - Updated progress data
 */
export const markLessonAccessed = async (lessonId) => {
  const response = await axios.post(
    `${API_URL}/progress/lesson/${lessonId}/access`,
    {},
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

/**
 * Mark lesson as completed
 * @param {string} lessonId - Lesson ID
 * @returns {Promise} - Updated progress data
 */
export const markLessonCompleted = async (lessonId) => {
  const response = await axios.post(
    `${API_URL}/progress/lesson/${lessonId}/complete`,
    {},
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

const progressService = {
  getCourseProgress,
  getLessonProgress,
  markLessonAccessed,
  markLessonCompleted,
};

export default progressService;

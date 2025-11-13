/**
 * Lesson Service
 * Handles API calls for lesson management
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get all lessons for a course
 * @param {string} courseId - Course ID
 * @returns {Promise} - Lessons data
 */
export const getCourseLessons = async (courseId) => {
  const response = await axios.get(`${API_URL}/lessons/course/${courseId}`);
  return response.data;
};

/**
 * Get single lesson by ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise} - Lesson data
 */
export const getLessonById = async (lessonId) => {
  const response = await axios.get(`${API_URL}/lessons/${lessonId}`);
  return response.data;
};

/**
 * Create a new lesson
 * @param {Object} lessonData - { courseId, title, description, videoUrl, duration, content }
 * @returns {Promise} - Created lesson data
 */
export const createLesson = async (lessonData) => {
  const response = await axios.post(`${API_URL}/lessons`, lessonData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Update a lesson
 * @param {string} lessonId - Lesson ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise} - Updated lesson data
 */
export const updateLesson = async (lessonId, updateData) => {
  const response = await axios.put(`${API_URL}/lessons/${lessonId}`, updateData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Delete a lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Promise} - Success message
 */
export const deleteLesson = async (lessonId) => {
  const response = await axios.delete(`${API_URL}/lessons/${lessonId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Reorder lessons
 * @param {string} courseId - Course ID
 * @param {Array} lessonOrders - [{ lessonId, order }, ...]
 * @returns {Promise} - Success message
 */
export const reorderLessons = async (courseId, lessonOrders) => {
  const response = await axios.put(
    `${API_URL}/lessons/reorder`,
    { courseId, lessonOrders },
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

const lessonService = {
  getCourseLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};

export default lessonService;

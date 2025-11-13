/**
 * Course Service
 * Handles all course-related API calls
 */

import api from './api';

const courseService = {
  // Get all courses (with optional filters)
  getAllCourses: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/courses?${queryParams}`);
    return response.data;
  },

  // Get single course by ID
  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Create a new course (Provider only)
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  // Update course (Provider only)
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  // Delete course (Provider only)
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  // Get courses created by logged-in provider
  getMyCourses: async () => {
    const response = await api.get('/courses/provider/my-courses');
    return response.data;
  },

  // Enroll in a course (Customer only)
  enrollInCourse: async (id) => {
    const response = await api.post(`/courses/${id}/enroll`);
    return response.data;
  },

  // Get enrolled courses (Customer only)
  getEnrolledCourses: async () => {
    const response = await api.get('/courses/customer/enrolled');
    return response.data;
  },
};

export default courseService;

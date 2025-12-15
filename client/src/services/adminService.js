/**
 * Admin Service
 * Handles all admin-related API calls
 */

import api from './api';

const adminService = {
  // Get all users
  getAllUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/admin/users?${queryParams}`);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    const response = await api.put(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  // Get pending provider requests
  getPendingProviders: async () => {
    const response = await api.get('/admin/pending-providers');
    return response.data;
  },

  // Approve provider request
  approveProvider: async (id) => {
    const response = await api.put(`/admin/approve-provider/${id}`);
    return response.data;
  },

  // Reject provider request
  rejectProvider: async (id) => {
    const response = await api.put(`/admin/reject-provider/${id}`);
    return response.data;
  },

  // Get pending courses
  getPendingCourses: async () => {
    const response = await api.get('/admin/pending-courses');
    return response.data;
  },

  // Approve course
  approveCourse: async (id) => {
    const response = await api.put(`/admin/approve-course/${id}`);
    return response.data;
  },

  // Reject course
  rejectCourse: async (id) => {
    const response = await api.put(`/admin/reject-course/${id}`);
    return response.data;
  },

  // Get system statistics
  getSystemStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

export default adminService;

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api from './api';

const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Delete user account (soft delete)
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },
};

export default authService;

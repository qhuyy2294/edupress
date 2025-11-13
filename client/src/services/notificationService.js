/**
 * Notification Service
 * API calls for notifications
 */

import api from './api';

// Get auth headers
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all notifications
const getMyNotifications = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await api.get(`/notifications?${queryString}`, getAuthHeader());
};

// Get unread count
const getUnreadCount = async () => {
  return await api.get('/notifications/unread-count', getAuthHeader());
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  return await api.put(`/notifications/${notificationId}/read`, {}, getAuthHeader());
};

// Mark all as read
const markAllAsRead = async () => {
  return await api.put('/notifications/read-all', {}, getAuthHeader());
};

// Delete notification
const deleteNotification = async (notificationId) => {
  return await api.delete(`/notifications/${notificationId}`, getAuthHeader());
};

// Clear read notifications
const clearReadNotifications = async () => {
  return await api.delete('/notifications/clear-read', getAuthHeader());
};

const notificationService = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
};

export default notificationService;

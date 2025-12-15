/**
 * Discount Service
 * API calls for discount code management
 */

import api from './api';

const discountService = {
  /**
   * Create new discount code
   */
  createDiscount: async (discountData) => {
    const response = await api.post('/discounts', discountData);
    return response.data;
  },

  /**
   * Get all discounts for provider
   */
  getMyDiscounts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.active !== undefined) params.append('active', filters.active);
    
    const response = await api.get(`/discounts?${params.toString()}`);
    return response.data;
  },

  /**
   * Get discount by ID
   */
  getDiscountById: async (id) => {
    const response = await api.get(`/discounts/${id}`);
    return response.data;
  },

  /**
   * Update discount
   */
  updateDiscount: async (id, updates) => {
    const response = await api.put(`/discounts/${id}`, updates);
    return response.data;
  },

  /**
   * Delete discount
   */
  deleteDiscount: async (id) => {
    const response = await api.delete(`/discounts/${id}`);
    return response.data;
  },

  /**
   * Validate discount code
   */
  validateDiscount: async (code, courseId) => {
    const response = await api.post('/discounts/validate', { code, courseId });
    return response.data;
  },

  /**
   * Toggle discount active status
   */
  toggleDiscountStatus: async (id) => {
    const response = await api.patch(`/discounts/${id}/toggle`);
    return response.data;
  },
};

export default discountService;

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/cart';

// Get auth config
const getConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Get user's cart
export const getCart = async () => {
  try {
    const response = await axios.get(API_URL, getConfig());
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw error;
  }
};

// Add course to cart
export const addToCart = async (courseId) => {
  try {
    const response = await axios.post(API_URL, { courseId }, getConfig());
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw error;
  }
};

// Remove course from cart
export const removeFromCart = async (courseId) => {
  try {
    const response = await axios.delete(`${API_URL}/${courseId}`, getConfig());
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw error;
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    const response = await axios.delete(API_URL, getConfig());
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw error;
  }
};

// Get cart count
export const getCartCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/count`, getConfig());
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw error;
  }
};

const cartService = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  getCartCount
};

export default cartService;

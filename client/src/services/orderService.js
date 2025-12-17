import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

// Get auth config
const getConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found')
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Create order from cart
export const createOrder = async () => {
  try {
    const response = await axios.post(`${API_URL}`, {}, getConfig());
    // Trả về trực tiếp đối tượng đơn hàng đã tạo.
    return response.data.order || response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw error;
  }
};

// Get user's orders
export const getUserOrders = async () => {
  const response = await axios.get(API_URL, getConfig());
  return response.data;
};

// Get single order
export const getOrderById = async (orderId) => {
  const response = await axios.get(`${API_URL}/${orderId}`, getConfig());
  return response.data;
};

// Mark order as paid
export const markOrderPaid = async (orderId) => {
  const response = await axios.put(`${API_URL}/${orderId}/paid`, {}, getConfig());
  return response.data;
};

// Cancel pending order
export const cancelOrder = async (orderId) => {
  const response = await axios.delete(`${API_URL}/${orderId}`, getConfig());
  return response.data;
};

// Get all orders (Admin)
export const getAllOrders = async (status = null) => {
  const url = status ? `${API_URL}/admin/all?status=${status}` : `${API_URL}/admin/all`;
  const response = await axios.get(url, getConfig());
  return response.data;
};

// Approve order (Admin)
export const approveOrder = async (orderId) => {
  const response = await axios.put(`${API_URL}/${orderId}/approve`, {}, getConfig());
  return response.data;
};

// Reject order (Admin)
export const rejectOrder = async (orderId, reason) => {
  const response = await axios.put(`${API_URL}/${orderId}/reject`, { reason }, getConfig());
  return response.data;
};

// Get revenue statistics
export const getRevenueStats = async () => {
  const response = await axios.get(`${API_URL}/revenue/stats`, getConfig());
  return response.data;
};

const orderService = {
  createOrder,
  getUserOrders,
  getOrderById,
  markOrderPaid,
  cancelOrder,
  getAllOrders,
  approveOrder,
  rejectOrder,
  getRevenueStats
};

export default orderService;

import apiClient from './apiClient';

/**
 * Orders Service
 * Handles all order-related API calls
 */

// Get all orders (with optional query parameters)
export const getOrders = async (params = {}) => {
  try {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single order by ID
export const getOrderById = async (id) => {
  try {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update order
export const updateOrder = async (id, orderData) => {
  try {
    const response = await apiClient.put(`/orders/${id}`, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete order
export const deleteOrder = async (id) => {
  try {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Confirm order
export const confirmOrder = async (id) => {
  try {
    const response = await apiClient.patch(`/orders/${id}/confirm`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (id, reason) => {
  try {
    const response = await apiClient.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search orders
export const searchOrders = async (query, params = {}) => {
  try {
    const response = await apiClient.get('/orders/search', {
      params: { q: query, ...params },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get order statistics
export const getOrderStatistics = async (params = {}) => {
  try {
    const response = await apiClient.get('/orders/statistics', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};


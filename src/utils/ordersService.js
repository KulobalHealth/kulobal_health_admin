import apiClient from './apiClient';

/**
 * Orders Service
 * Handles all order-related API calls
 * Base URL: https://kulobalhealth-backend-1.onrender.com/api/v1/admin
 * Endpoint: /orders
 * Full URL: https://kulobalhealth-backend-1.onrender.com/api/v1/admin/orders
 */

// Get all orders (with optional query parameters)
export const getOrders = async (params = {}) => {
  try {
    const user = localStorage.getItem('user');
    
    console.log('🔍 Fetching orders from /orders endpoint...');
    console.log('📋 Request params:', params);
    console.log('👤 User exists:', !!user);
    console.log('🍪 HTTP-only cookie will be sent automatically:', true);
    
    const response = await apiClient.get('/orders', { params });
    console.log('✅ Get Orders Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    console.error('📍 Error status:', error.response?.status);
    console.error('📝 Error message:', error.response?.data?.message || error.message);
    console.error('🔍 Full error data:', error.response?.data);
    console.error('📡 Request headers that were sent:', error.config?.headers);
    console.error('🍪 Cookie-based authentication used (no Authorization header)');
    
    if (error.response?.status === 401) {
      console.error('🚫 UNAUTHORIZED: The orders endpoint returned 401.');
      console.error('💡 Error says:', error.response?.data?.message);
      console.error('⚠️ This means authentication is failing for /orders endpoint.');
      console.error('🔍 Check: 1) Is cookie sent with request? 2) Is cookie valid/not expired? 3) Does backend require specific auth?');
    }
    
    throw error;
  }
};

// Get single order by ID
export const getOrderById = async (id) => {
  try {
    // Use the same /orders endpoint - fetch all and filter client-side
    // The backend might not support filtering by orderId, so we get all orders
    const response = await apiClient.get('/orders');
    console.log('Get Order By ID - Full Response:', response);
    console.log('Looking for order with ID:', id);
    
    // The response might be an array, so we need to find the order with matching ID
    let ordersData = response.data;
    
    // Handle different response structures to extract the orders array
    if (Array.isArray(ordersData)) {
      // Already an array
    } else if (ordersData && typeof ordersData === 'object') {
      // Check if it's wrapped in data property
      if (ordersData.data && Array.isArray(ordersData.data)) {
        ordersData = ordersData.data;
      } else if (ordersData.orders && Array.isArray(ordersData.orders)) {
        ordersData = ordersData.orders;
      } else if (ordersData.orderData && Array.isArray(ordersData.orderData)) {
        ordersData = ordersData.orderData;
      } else {
        // Try to find if it's a single order object
        if (ordersData.orderId === id || ordersData.id === id || ordersData._id === id) {
          console.log('Found single order object:', ordersData);
          return ordersData;
        }
        // If not, try to convert to array
        ordersData = [ordersData];
      }
    } else {
      ordersData = [];
    }
    
    console.log('Orders array length:', ordersData.length);
    console.log('Sample order structure:', ordersData[0]);
    
    // Find the order with matching ID (try multiple ID fields)
    const foundOrder = ordersData.find(order => {
      const orderIdMatch = order.orderId === id || 
                          order.id === id || 
                          order._id === id ||
                          String(order.orderId) === String(id) ||
                          String(order.id) === String(id) ||
                          String(order._id) === String(id);
      
      if (orderIdMatch) {
        console.log('Found matching order:', order);
      }
      
      return orderIdMatch;
    });
    
    if (foundOrder) {
      console.log('Returning found order:', foundOrder);
      return foundOrder;
    } else {
      console.warn('Order not found. Available order IDs:', ordersData.map(o => o.orderId || o.id || o._id));
      return null;
    }
  } catch (error) {
    console.error('Error in getOrderById:', error);
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

// Update order status (process order)
export const updateOrderStatus = async (orderId, pharmacyId) => {
  try {
    // Remove # prefix if present
    let cleanOrderId = orderId;
    if (typeof cleanOrderId === 'string' && cleanOrderId.startsWith('#')) {
      cleanOrderId = cleanOrderId.substring(1);
    }
    
    console.log('Processing order (calling /orders/proccess-order):', { orderId: cleanOrderId, pharmacyId });

    // Call the endpoint `/orders/proccess-order` (note spelling from backend)
    // The backend expects a PATCH request for processing an order
    const response = await apiClient.patch('/orders/proccess-order', {
      pharmacyId: pharmacyId,
      orderId: cleanOrderId
    });
    console.log('Process Order Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error processing order:', error);
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


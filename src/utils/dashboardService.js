import apiClient from './apiClient';

/**
 * Dashboard Service
 * All dashboard-related API calls for real-time data
 */

// Get dashboard statistics/KPIs
export const getDashboardStats = async (params = {}) => {
  try {
    console.log('📊 Fetching dashboard statistics with params:', params);
    const response = await apiClient.get('/dashboard/stats', { params });
    console.log('✅ Dashboard stats fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.baseURL + error.config?.url
    });
    throw error;
  }
};

// Get product orders chart data
export const getProductOrdersData = async (params = {}) => {
  try {
    console.log('📈 Fetching product orders data with params:', params);
    const response = await apiClient.get('/dashboard/product-orders', { params });
    console.log('✅ Product orders data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching product orders data:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.baseURL + error.config?.url
    });
    throw error;
  }
};

// Get highly performing products data
export const getHighPerformingProducts = async (params = {}) => {
  try {
    console.log('🏆 Fetching highly performing products with params:', params);
    const response = await apiClient.get('/dashboard/top-products', { params });
    console.log('✅ Highly performing products fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching highly performing products:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.baseURL + error.config?.url
    });
    throw error;
  }
};

// Get recent orders
export const getRecentOrders = async (params = {}) => {
  try {
    console.log('📦 Fetching recent orders with params:', params);
    const response = await apiClient.get('/dashboard/recent-orders', { params });
    console.log('✅ Recent orders fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching recent orders:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.baseURL + error.config?.url
    });
    throw error;
  }
};

// Get dashboard overview (all data in one call)
export const getDashboardOverview = async (params = {}) => {
  try {
    console.log('📊 Fetching dashboard overview with params:', params);
    const response = await apiClient.get('/dashboard/overview', { params });
    console.log('✅ Dashboard overview fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching dashboard overview:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.baseURL + error.config?.url
    });
    throw error;
  }
};

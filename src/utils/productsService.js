import apiClient from './apiClient';

/**
 * Products Service
 * Handles all product-related API calls
 * Base URL: https://kulobalhealth-backend-qlhm.onrender.com/api/v1/admin
 * Endpoint: /product
 * Full URL: https://kulobalhealth-backend-qlhm.onrender.com/api/v1/admin/product/all
 */

// Get all products (with optional query parameters)
export const getProducts = async (params = {}) => {
  try {
    const response = await apiClient.get('/product/all', { params });
    console.log('Get Products Response:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const response = await apiClient.get(`/product/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new product
export const createProduct = async (productData) => {
  try {
    console.log('=== CREATE PRODUCT REQUEST ===');
    console.log('Request URL:', '/product');
    console.log('Request method:', 'POST');
    console.log('Request body:', JSON.stringify(productData, null, 2));
    console.log('Product Type Code being sent:', productData.productTypeCode);
    console.log('Product Type Code type:', typeof productData.productTypeCode);
    console.log('Product Type Code value:', productData.productTypeCode);
    
    const response = await apiClient.post('/product', productData);
    
    console.log('=== CREATE PRODUCT RESPONSE ===');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('=== CREATE PRODUCT ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Full error:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const response = await apiClient.put(`/product/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await apiClient.delete(`/product/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Toggle product visibility
export const toggleProductVisibility = async (id, visibility) => {
  try {
    const response = await apiClient.patch(`/product/${id}/visibility`, { visibility });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search products
export const searchProducts = async (query, params = {}) => {
  try {
    const response = await apiClient.get('/product/search', {
      params: { q: query, ...params },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


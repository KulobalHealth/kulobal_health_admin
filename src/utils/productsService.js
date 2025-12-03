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
    const response = await apiClient.post('/product', productData);
    return response.data;
  } catch (error) {
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


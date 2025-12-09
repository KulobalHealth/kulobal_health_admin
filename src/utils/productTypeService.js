import apiClient from './apiClient';

/**
 * Product Type Service
 * Handles all product type-related API calls
 */

// Get all product types
export const getProductTypes = async () => {
  try {
    const response = await apiClient.get('/product-types');
    return response.data;
  } catch (error) {
    console.error('Error in getProductTypes:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    throw error;
  }
};

// Get single product type by ID
export const getProductTypeById = async (id) => {
  try {
    const response = await apiClient.get(`/product-types/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new product type
export const createProductType = async (productTypeData) => {
  try {
    const response = await apiClient.post('/product-types', productTypeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update product type
export const updateProductType = async (id, productTypeData) => {
  try {
    const response = await apiClient.put(`/product-types/${id}`, productTypeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete product type
export const deleteProductType = async (id) => {
  try {
    const response = await apiClient.delete(`/product-types/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


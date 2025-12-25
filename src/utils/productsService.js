import apiClient from './apiClient';

/**
 * Products Service
 * Handles all product-related API calls
 * Base URL: https://kulobalhealth-backend-1.onrender.com/api/v1/admin
 * Endpoint: /product
 * Full URL: https://kulobalhealth-backend-1.onrender.com/api/v1/admin/product/all
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
    console.log('🔍 getProductById called with ID:', id);
    console.log('📡 Calling endpoint: /product/getone/' + id);
    
    const response = await apiClient.get(`/product/getone/${id}`);
    
    console.log('✅ Product fetch successful');
    console.log('📦 Response status:', response.status);
    console.log('📦 Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in getProductById:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    console.error('Error details:', error.response?.data);
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
    console.log('Updating product with ID:', id);
    console.log('Using PATCH /product/' + id);
    console.log('Update data:', productData);
    
    const response = await apiClient.patch(`/product/${id}`, productData);
    
    console.log('Product updated successfully');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  // Ensure ID is a string and trim any whitespace
  const productId = String(id).trim();
  
  console.log('=== DELETE PRODUCT REQUEST ===');
  console.log('Product ID:', productId);
  console.log('Product ID type:', typeof productId);
  console.log('Product ID length:', productId.length);
  
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://kulobalhealth-backend-1.onrender.com/api/v1/admin';
  
  // Try singular endpoint first: DELETE /product/{id}
  try {
    console.log('Trying endpoint: DELETE /product/${productId}');
    console.log(' Full URL:', `${baseURL}/product/${productId}`);
    
    const response = await apiClient.delete(`/product/${productId}`);
    
    console.log('=== DELETE PRODUCT SUCCESS ===');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(' === DELETE PRODUCT ERROR (singular endpoint) ===');
    console.error(' Error status:', error.response?.status);
    console.error(' Error message:', error.response?.data?.message || error.message);
    console.error('Full error response:', error.response);
    console.error('Error response data:', error.response?.data);
    
    // If 404 on singular, try plural endpoint
    if (error.response?.status === 404) {
      console.log('Trying alternative endpoint: DELETE /products/${productId}');
      try {
        const response = await apiClient.delete(`/products/${productId}`);
        console.log('Delete successful with plural endpoint');
        return response.data;
      } catch (pluralError) {
        console.error(' Plural endpoint also failed:', pluralError.response?.status);
        // Fall through to original error handling
      }
    }
    
    // If 500 error, log full details
    if (error.response?.status === 500) {
      const serverData = error.response?.data || {};
      
      console.error(' ========== DELETE PRODUCT - 500 ERROR ==========');
      console.error('Product ID that was sent:', productId);
      console.error('Server Response Data:', serverData);
      console.error('Server Response (JSON):', JSON.stringify(serverData, null, 2));
      console.error('Request URL:', error.config?.baseURL + error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Request Headers:', error.config?.headers);
      console.error('===================================================');
      
      // Try to extract a meaningful error message
      const errorDetails = serverData.message || 
                          serverData.error || 
                          serverData.detail ||
                          serverData.msg ||
                          (typeof serverData === 'string' ? serverData : 'Internal server error occurred');
      
      // Show the error in the UI with more context
      throw new Error(`Server error: ${errorDetails}. Product ID: ${productId}`);
    }
    
    // Handle other errors
    if (error.response?.status === 404) {
      throw new Error('Product not found. It may have already been deleted.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please login again.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete this product.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(error.message || 'Failed to delete product. Please try again.');
    }
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


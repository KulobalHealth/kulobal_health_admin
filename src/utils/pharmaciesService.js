import apiClient from './apiClient';

/**
 * Pharmacies Service
 * All pharmacy-related API calls
 */

// Get all pharmacies
export const getPharmacies = async (params = {}) => {
  try {
    console.log('🏥 Fetching pharmacies with params:', params);
    
    // Use /pharmacy endpoint
    const response = await apiClient.get('/pharmacy', { params });
    console.log('✅ Pharmacies fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching pharmacies:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.baseURL + error.config?.url
    });
    throw error;
  }
};

// Get pharmacy by ID
export const getPharmacyById = async (id) => {
  try {
    console.log('🏥 Fetching pharmacy with ID:', id);
    
    // Use /pharmacy/getone/{id} (matches backend pattern like /product/getone/{id})
    const response = await apiClient.get(`/pharmacy/getone/${id}`);
    console.log('✅ Pharmacy fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching pharmacy:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.baseURL + error.config?.url
    });
    throw error;
  }
};

// Create new pharmacy
export const createPharmacy = async (pharmacyData) => {
  try {
    console.log('🏥 Creating new pharmacy:', pharmacyData);
    const response = await apiClient.post('/pharmacy', pharmacyData);
    console.log('✅ Pharmacy created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating pharmacy:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    throw error;
  }
};

// Update pharmacy
export const updatePharmacy = async (id, pharmacyData) => {
  try {
    console.log('🏥 Updating pharmacy:', { id, pharmacyData });
    const response = await apiClient.patch(`/pharmacy/${id}`, pharmacyData);
    console.log('✅ Pharmacy updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating pharmacy:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    throw error;
  }
};

// Delete pharmacy
export const deletePharmacy = async (id) => {
  try {
    console.log('🗑️ Deleting pharmacy with ID:', id);
    console.log('📍 Using endpoint: DELETE /pharmacy with pharmacyId in body');
    
    // Delete with pharmacyId in JSON body
    const response = await apiClient.delete('/pharmacy', {
      data: { pharmacyId: id }
    });
    
    console.log('✅ Pharmacy deleted successfully');
    console.log('📦 Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting pharmacy:', error);
    console.error('📝 Full error object:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.url,
      fullURL: error.config?.baseURL + error.config?.url,
      params: error.config?.params,
      requestData: error.config?.data
    });
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Pharmacy not found. It may have already been deleted.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please login again.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete this pharmacy.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(error.message || 'Failed to delete pharmacy. Please try again.');
    }
  }
};

// Reinstate deleted pharmacy
export const reinstatePharmacy = async (id) => {
  try {
    console.log('🔄 Reinstating pharmacy with ID:', id);
    console.log('📍 Using endpoint: PATCH /pharmacy with pharmacyId in body');
    
    // Reinstate with pharmacyId in JSON body
    const response = await apiClient.patch('/pharmacy', {
      pharmacyId: id
    });
    
    console.log('✅ Pharmacy reinstated successfully');
    console.log('📦 Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error reinstating pharmacy:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.url,
      fullURL: error.config?.baseURL + error.config?.url
    });
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Pharmacy not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please login again.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to reinstate this pharmacy.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(error.message || 'Failed to reinstate pharmacy. Please try again.');
    }
  }
};

// Update pharmacy subscription status
export const updatePharmacySubscription = async (id, subscriptionData) => {
  try {
    console.log('🏥 Updating pharmacy subscription:', { id, subscriptionData });
    const response = await apiClient.patch(`/pharmacy/${id}/subscription`, subscriptionData);
    console.log('✅ Pharmacy subscription updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating pharmacy subscription:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    throw error;
  }
};

// Get pharmacy branches
export const getPharmacyBranches = async (id) => {
  try {
    console.log('🏥 Fetching branches for pharmacy:', id);
    const response = await apiClient.get(`/pharmacy/${id}/branches`);
    console.log('✅ Pharmacy branches fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching pharmacy branches:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    throw error;
  }
};

// Search pharmacies
export const searchPharmacies = async (query, params = {}) => {
  try {
    console.log('🔍 Searching pharmacies with query:', query);
    const response = await apiClient.get('/pharmacy/search', {
      params: { q: query, ...params },
    });
    console.log('✅ Pharmacy search completed:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error searching pharmacies:', error);
    throw error;
  }
};

// Get all deleted pharmacies
export const getDeletedPharmacies = async (params = {}) => {
  try {
    console.log('🗑️ Fetching deleted pharmacies with params:', params);
    
    // Use /pharmacy/deleted endpoint
    const response = await apiClient.get('/pharmacy/deleted', { params });
    console.log('✅ Deleted pharmacies fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching deleted pharmacies:', error);
    console.error('📝 Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.baseURL + error.config?.url
    });
    throw error;
  }
};

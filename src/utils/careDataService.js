import apiClient from './apiClient';

/**
 * Care Data Service
 * Handles all prescription/care data-related API calls
 * Base URL: https://kulobalhealth-backend-1.onrender.com/api/v1/admin
 */

// Get all prescription/care data (with optional query parameters)
export const getCareData = async (params = {}) => {
  try {
    console.log('🔍 Fetching care data from API...');
    const response = await apiClient.get('/prescriptions', { params });
    console.log('✅ Get Care Data Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching care data:', error);
    throw error;
  }
};

// Get single prescription by ID
export const getCareDataById = async (id) => {
  try {
    const response = await apiClient.get(`/prescriptions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Request patient data access (for privacy compliance)
export const requestPatientDataAccess = async (prescriptionId) => {
  try {
    console.log('🔐 Requesting patient data access for prescription:', prescriptionId);
    const response = await apiClient.post(`/prescriptions/${prescriptionId}/request-access`);
    return response.data;
  } catch (error) {
    console.error('❌ Error requesting patient data access:', error);
    throw error;
  }
};

// Get patient data (requires permission)
export const getPatientData = async (prescriptionId) => {
  try {
    console.log('👤 Fetching patient data for prescription:', prescriptionId);
    const response = await apiClient.get(`/prescriptions/${prescriptionId}/patient-data`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching patient data:', error);
    throw error;
  }
};


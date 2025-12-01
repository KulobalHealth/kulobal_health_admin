import apiClient from './apiClient';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

// Login user
export const login = async (credentials) => {
  try {
    console.log('Attempting login with:', { endpoint: '/auth/login', credentials: { ...credentials, password: '***' } });
    const response = await apiClient.post('/auth/login', credentials);
    console.log('Login response:', response.data);
    
    // Store token and user data
    // Handle different response structures
    const token = response.data.token || response.data.data?.token || response.data.accessToken;
    const user = response.data.user || response.data.data?.user || response.data.data;
    
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token stored successfully');
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User data stored successfully');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    throw error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Refresh token (if your API supports it)
export const refreshToken = async () => {
  try {
    const response = await apiClient.post('/auth/refresh');
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    logout();
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


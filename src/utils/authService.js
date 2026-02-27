import apiClient from './apiClient';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Backend uses HTTP-only cookies for session management
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Debug logger - only logs in development
const debugLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

// Login user
export const login = async (credentials) => {
  try {
    // Always log credentials for debugging (remove in production)
    console.log('🔐 Attempting login with:', {
      email: credentials.email,
      passwordLength: credentials.password?.length
    });
    
    const response = await apiClient.post('/auth/login', credentials);
    
    console.log('✅ Login successful:', response.data);
    
    // Store token if returned in response
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      console.log('✅ Token stored from response.data.token');
    } else if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      console.log('✅ Token stored from response.data.data.token');
    } else {
      console.warn('⚠️ No token found in response!', {
        hasDataToken: !!response.data.token,
        hasDataDataToken: !!response.data.data?.token,
        responseKeys: Object.keys(response.data),
        dataKeys: response.data.data ? Object.keys(response.data.data) : []
      });
    }
    
    // Verify token was stored
    const storedToken = localStorage.getItem('token');
    console.log('🔍 Token verification:', {
      stored: !!storedToken,
      preview: storedToken ? storedToken.substring(0, 30) + '...' : null
    });
    
    // Extract user data - all user fields are in response.data.data
    const user = response.data.data || 
                 response.data.user ||
                 response.data.admin;
    
    // Store user data for client-side use (for UI display, etc.)
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      debugLog('✅ User data stored');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    
    // Provide more user-friendly error messages
    if (!error.response) {
      throw new Error(
        'Cannot connect to the server. Please check your internet connection or try again later.'
      );
    }
    
    if (error.response?.status === 404) {
      throw new Error('Login service unavailable. Please try again later.');
    }
    
    if (error.response?.status === 401) {
      throw new Error(error.response?.data?.message || 'Invalid email or password.');
    }
    
    if (error.response?.status === 500) {
      // Server error - could be backend issue
      throw new Error(error.response?.data?.message || 'Server error. Please try again later.');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Login failed');
  }
};

// Logout user
export const logout = async () => {
  try {
    // Call logout endpoint to clear server-side cookie
    // This ensures the HTTP-only cookie is properly cleared
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.warn('Logout endpoint failed, clearing local data only:', error);
  } finally {
    // Always clear local storage
    // Note: HTTP-only cookie is cleared by the backend logout endpoint
    localStorage.removeItem('user');
  }
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
// For cookie-based auth, we check if user data exists
// The actual authentication is handled by HTTP-only cookies sent with requests
export const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  // User is considered authenticated if we have user data
  // The cookie validation happens on the server side with each request
  return !!user;
};

// Get auth token (not used for cookie-based auth)
// Returns null since we use HTTP-only cookies only
export const getToken = () => {
  return null;
};

// Refresh session (if your API supports it)
// For cookie-based auth, the cookie is automatically refreshed by the backend
export const refreshToken = async () => {
  try {
    const response = await apiClient.post('/auth/refresh');
    // Cookie is automatically set by backend, no need to store anything
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


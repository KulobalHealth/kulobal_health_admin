import apiClient from './apiClient';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

// Login user
export const login = async (credentials) => {
  try {
    console.log('🔐 Attempting login with:', { endpoint: '/auth/login', credentials: { ...credentials, password: '***' } });
    const response = await apiClient.post('/auth/login', credentials);
    console.log('✅ Login response received');
    console.log('📦 Response structure:', Object.keys(response.data));
    console.log('📄 Full response data:', response.data);
    console.log('📋 Response headers:', response.headers);
    console.log('🍪 Set-Cookie header:', response.headers['set-cookie']);
    
    // Check if browser received cookies
    console.log('🍪 Current cookies:', document.cookie);
    console.log('🔍 Checking if auth cookie was set...');
    
    // Extract user data - all user fields are in response.data.data
    const user = response.data.data || 
                 response.data.user ||
                 response.data.admin;
    
    console.log('👤 User data found:', !!user);
    
    if (document.cookie.length === 0) {
      console.warn('⚠️ WARNING: No cookies found in browser!');
      console.warn('💡 This means the backend is NOT setting cookies correctly.');
      console.warn('📍 Backend must set cookies with proper CORS configuration.');
    } else {
      console.log('✅ Cookies found in browser:', document.cookie);
    }
    
    // Store user data for client-side use (for UI display, etc.)
    // Authentication is handled by HTTP-only cookies sent automatically
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ User data stored successfully');
    } else {
      console.warn('⚠️ No user data in login response');
    }
    
    // Remove any old token if it exists (cleanup)
    localStorage.removeItem('token');
    
    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url
    });
    
    // Provide more user-friendly error messages
    if (error.response?.status === 404) {
      const baseURL = error.config?.baseURL || 'Not configured';
      throw new Error(`API server not found at ${baseURL}. Please check your API configuration and ensure the server is running.`);
    }
    
    throw error;
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


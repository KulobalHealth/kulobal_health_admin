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
    
    // Backend uses cookies for authentication
    // The cookie is set automatically by the server via Set-Cookie header
    // We still store user data in localStorage for client-side use
    const token = response.data.token || response.data.data?.token || response.data.accessToken;
    const user = response.data.user || response.data.data?.user || response.data.data;
    
    // Store token if provided (for hybrid auth or client-side checks)
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token stored successfully');
    } else {
      // If no token in response, set a flag to indicate cookie-based auth
      localStorage.setItem('token', 'cookie-auth');
      console.log('Cookie-based authentication - cookie set by server');
    }
    
    // Store user data for client-side use
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
    localStorage.removeItem('token');
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
// The actual authentication is handled by cookies sent with requests
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  // User is considered authenticated if we have user data or token
  // The cookie validation happens on the server side
  return !!(token || user);
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


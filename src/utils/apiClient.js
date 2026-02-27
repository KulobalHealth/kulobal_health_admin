import axios from 'axios';

// API Configuration
// The backend has a CORS bug that causes 500 errors with Origin headers
// We use a Vercel serverless function to proxy requests and strip the Origin header
const isDevelopment = process.env.NODE_ENV === 'development';

// In development, use backend directly
// In production, use /api/ path which hits our serverless proxy
const baseURL = isDevelopment 
  ? 'https://kulobalhealth-backend-1.onrender.com/api/v1/admin'
  : '/api/v1/admin';

// Debug logger - only logs in development
const debugLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 seconds
  withCredentials: false, // Disabled for cross-origin - using Bearer token auth instead
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - For authentication
apiClient.interceptors.request.use(
  (config) => {
    // Don't send token for auth endpoints (login, register, etc.)
    const isAuthEndpoint = config.url?.includes('/auth/');
    
    // Get token from localStorage (fallback auth method)
    const token = localStorage.getItem('token');
    
    debugLog('🔐 Auth check:', {
      url: config.url,
      isAuthEndpoint: isAuthEndpoint,
      tokenExists: !!token,
      withCredentials: config.withCredentials
    });
    
    // Add Bearer token as fallback (primary auth is via HTTP-only cookie)
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
      debugLog('✅ Authorization header added');
    }
    
    debugLog('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: config.baseURL + config.url
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      console.error('🌐 Network Error - No response from server:', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
        possibleCauses: [
          '1. CORS is blocking the request from your domain',
          '2. Backend server is down or unreachable',
          '3. Network connection issue',
          '4. Request timeout',
          '5. Backend not configured to accept requests from this origin'
        ],
        solution: 'Check backend CORS configuration and ensure it allows your frontend domain'
      });
      
      return Promise.reject(new Error(
        'Cannot connect to the server. Please check your internet connection or contact support. ' +
        'If you are the developer, check CORS configuration on the backend.'
      ));
    }

    // Handle 401 Unauthorized - Cookie expired or invalid
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const requestUrl = error.config?.baseURL + error.config?.url;
      
      console.error('401 Unauthorized Error:', {
        url: requestUrl,
        isLoginRequest,
        errorData: error.response?.data,
        errorMessage: error.response?.data?.message,
        note: 'Using HTTP-only cookies for authentication',
        possibleCauses: [
          '1. Cookie not being sent (CORS issue)',
          '2. Cookie expired or invalid',
          '3. Backend not configured to accept cookies from this origin',
          '4. Cookie domain/path mismatch'
        ]
      });
      
      // Don't auto-logout for login requests
      if (isLoginRequest) {
        return Promise.reject(error);
      }
      
      // Check if this is a session expiry or just an endpoint permission issue
      const errorMsg = error.response?.data?.message?.toLowerCase() || '';
      const errorMsgStr = JSON.stringify(error.response?.data || {}).toLowerCase();
      
      // Only logout if it's clearly a session/token expiry issue
      const isSessionExpired = errorMsg.includes('session expired') || 
                               errorMsg.includes('token expired') ||
                               errorMsg.includes('jwt expired') ||
                               errorMsg.includes('invalid session') ||
                               errorMsg.includes('authentication failed') ||
                               errorMsg.includes('please login') ||
                               errorMsgStr.includes('unauthenticated');
      
      if (isSessionExpired) {
        console.warn('🔒 Session/Token expired. Clearing local data and redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        setTimeout(() => {
          const currentPath = window.location.pathname;
          if (currentPath !== '/' && currentPath !== '/login') {
            window.location.href = '/';
          }
        }, 500);
      } else {
        // For other 401 errors, log but don't auto-logout
        // This could be endpoint-specific permissions or other issues
        console.warn('⚠️ 401 error received but not a session expiry.');
        console.warn('💡 Possible reasons: endpoint permissions, missing data, or backend configuration.');
        console.warn('📍 Endpoint:', requestUrl);
        console.warn('📝 Error message:', error.response?.data?.message || 'No message');
        // Don't logout - let the page handle the error
      }
    }

    // Handle 404 Not Found - Provide more helpful error message
    if (error.response?.status === 404) {
      const url = error.config?.baseURL + error.config?.url;
      const method = error.config?.method?.toUpperCase();
      console.error('404 Not Found:', {
        method,
        url,
        endpoint: error.config?.url,
        baseURL: error.config?.baseURL,
        suggestion: 'Check if the endpoint path is correct or if the endpoint exists on the backend'
      });
      
      // Provide a more helpful error message
      const errorMessage = `Endpoint not found: ${method} ${url}. The endpoint may not be implemented yet or the path might be incorrect.`;
      return Promise.reject(new Error(errorMessage));
    }

    // Handle other errors (including 500)
    if (error.response?.status === 500) {
      // For 500 errors, include more details from the server
      const serverData = error.response?.data || {};
      const serverMessage = serverData.message || 
                           serverData.error || 
                           serverData.detail ||
                           serverData.msg ||
                           JSON.stringify(serverData) ||
                           'Internal server error';
      
      // Log full details in multiple ways for better visibility
      console.error('💥 ========== 500 INTERNAL SERVER ERROR ==========');
      console.error('📍 URL:', error.config?.baseURL + error.config?.url);
      console.error('📝 Method:', error.config?.method?.toUpperCase());
      console.error('📋 Error Message:', serverMessage);
      console.error('📦 Full Response Data:', serverData);
      console.error('📦 Response Data (JSON):', JSON.stringify(serverData, null, 2));
      console.error('🔍 Full Error Object:', error);
      console.error('===========================================');
      
      return Promise.reject(new Error(`Server error: ${serverMessage}`));
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;


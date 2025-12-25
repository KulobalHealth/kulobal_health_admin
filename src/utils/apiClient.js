import axios from 'axios';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://kulobalhealth-backend-1.onrender.com/api/v1/admin',
  timeout: 30000, // 30 seconds
  withCredentials: true, // Enable sending/receiving cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - For HTTP-only cookie authentication
// Cookies are sent automatically via withCredentials
apiClient.interceptors.request.use(
  (config) => {
    // For HTTP-only cookie auth, we don't need to add Authorization header
    // The cookie is sent automatically by the browser
    
    // Log request for debugging
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: config.baseURL + config.url,
      withCredentials: config.withCredentials,
      authMethod: 'HTTP-only cookies (sent automatically)',
      note: 'Cookies include auth credentials'
    });
    
    // Log request body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase())) {
      try {
        const body = config.data;
        if (body) {
          console.log('Request Body:', typeof body === 'string' ? JSON.parse(body) : body);
          if (body.productTypeCode !== undefined) {
            console.log('Product Type Code in request:', body.productTypeCode);
            console.log('Product Type Code type:', typeof body.productTypeCode);
          }
        }
      } catch (e) {
        console.log('Request Body (could not parse):', config.data);
      }
    }
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


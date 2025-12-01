import axios from 'axios';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://kulobalhealth-backend-qlhm.onrender.com/api/v1/admin',
  timeout: 30000, // 30 seconds
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests (if using token-based auth)
// For cookie-based auth, cookies are sent automatically via withCredentials
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Only add Bearer token if token exists (for hybrid auth or fallback)
    // If backend uses cookies only, this won't be needed
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request for debugging
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      baseURL: config.baseURL,
      hasToken: !!token,
      withCredentials: config.withCredentials
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
    // Handle 401 Unauthorized - Cookie expired or invalid
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const requestUrl = error.config?.baseURL + error.config?.url;
      
      console.error('401 Unauthorized Error:', {
        url: requestUrl,
        hasToken: !!token,
        isLoginRequest,
        errorData: error.response?.data,
        note: 'Backend uses cookies - cookie may be expired or invalid'
      });
      
      // Clear local storage (token and user data)
      // Note: HTTP-only cookies are managed by the browser/server
      if (!isLoginRequest) {
        console.warn('Authentication failed. Clearing local data and redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect after a short delay to allow error to be logged
        setTimeout(() => {
          const currentPath = window.location.pathname;
          if (currentPath !== '/' && currentPath !== '/login') {
            window.location.href = '/';
          }
        }, 300);
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

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;


import axios from "axios";

// Access the environment variable set in the frontend .env file
const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

console.log("🔧 API Base URL:", baseURL);

const API = axios.create({
  // Use the environment variable for the base URL
  baseURL: `${baseURL}/api`,
  withCredentials: true,
  timeout: 5000, // 5 second timeout to prevent hanging
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - adds credentials to every request
API.interceptors.request.use(
  (config) => {
    // Ensure credentials are sent with every request
    config.withCredentials = true;
    
    // Add sessionId from localStorage to Authorization header for cross-domain requests
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      config.headers.Authorization = `Bearer ${sessionId}`;
    }
    
    // Log request for debugging (remove in production)
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error("🔴 Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles session/auth errors
API.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    
    // Check for session-related headers
    if (response.headers["set-cookie"]) {
      console.log("🍪 Session cookie received");
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details
    console.error("🔴 API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    
    // Handle 401 Unauthorized (session expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔄 Session expired, redirecting to login...");
      
      // Clear local storage
      localStorage.removeItem("sessionActive");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      
      // Only redirect if not already on login page
      // Use window.location for interceptor (can't use React Router here)
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        // Small delay to prevent multiple redirects
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }
    
    // Handle 403 Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      console.log("🚫 Access forbidden");
      // You might want to show a permission denied message
    }
    
    // Handle network errors
    if (!error.response) {
      console.error("🌐 Network error - check if backend is running");
      // Show network error message to user
    }
    
    // Return error for component handling
    return Promise.reject(error);
  }
);

// Helper function to check session
export const checkSession = async () => {
  try {
    console.log("🔍 Checking session...");
    const response = await API.get("/auth/me");
    
    if (response.data?.user) {
      console.log("✅ Session valid for user:", response.data.user.email);
      
      // Store user info in localStorage for quick access
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("sessionActive", "true");
      localStorage.setItem("role", response.data.user.role);
      
      return {
        authenticated: true,
        user: response.data.user,
      };
    }
    
    return { authenticated: false, user: null };
  } catch (error) {
    console.error("❌ Session check failed:", error.message);
    
    // Clear any stale data
    localStorage.removeItem("sessionActive");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    
    return { authenticated: false, user: null, error };
  }
};

// Helper function for login
export const loginUser = async (email, password) => {
  try {
    console.log("🔐 Attempting login...");
    const response = await API.post("/auth/login", { email, password });
    
    if (response.data?.user) {
      console.log("✅ Login successful:", response.data.user.email);
      
      // Store session info
      localStorage.setItem("sessionActive", "true");
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Don't need to verify session again - login already succeeded
      // The session is set on the backend, just return success
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
        sessionValid: true, // Login succeeded, so session is valid
      };
    }
    
    return {
      success: false,
      message: response.data?.message || "Login failed",
    };
  } catch (error) {
    console.error("❌ Login error:", error.message);
    
    return {
      success: false,
      message: error.response?.data?.message || "Login failed. Please try again.",
      error: error.message,
    };
  }
};

// Helper function for logout
export const logoutUser = async () => {
  try {
    console.log("🚪 Logging out...");
    const response = await API.post("/auth/logout");
    
    // Clear local storage
    localStorage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    console.log("✅ Logout successful");
    
    return {
      success: true,
      message: response.data?.message || "Logged out successfully",
    };
  } catch (error) {
    console.error("❌ Logout error:", error.message);
    
    // Still clear local data even if API call fails
    localStorage.clear();
    sessionStorage.clear();
    
    return {
      success: false,
      message: "Logged out locally",
      error: error.message,
    };
  }
};

// Helper function to refresh session
// Note: Backend doesn't have /auth/refresh endpoint yet
// This function is kept for future use when refresh tokens are implemented
export const refreshSession = async () => {
  try {
    console.log("🔄 Checking session (refresh not implemented)...");
    // Use /auth/me instead since refresh endpoint doesn't exist
    const response = await API.get("/auth/me");
    
    if (response.data?.user) {
      console.log("✅ Session still valid");
      return { success: true, user: response.data.user };
    }
    
    return { success: false };
  } catch (error) {
    console.error("❌ Session check failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Export the configured API instance
export default API;
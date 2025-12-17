// API Configuration
// This file manages the API base URL based on environment

export const API_CONFIG = {
  // Get API URL from environment variable or default to localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/exercise-logging',
  
  // API endpoints
  endpoints: {
    users: '/api/v1/users',
    exercises: '/api/v1/admin/exercises',
    logs: '/api/v1/users',
  },
  
  // Timeout in milliseconds
  timeout: 10000,
} as const;

// Helper to build full endpoint URL
export const getEndpoint = (path: string): string => {
  return `${API_CONFIG.baseURL}${path}`;
};

// Export for use in services
export default API_CONFIG;

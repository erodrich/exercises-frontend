/**
 * Admin Service Configuration
 * Controls which admin adapter to use (Mock vs API)
 */

import { HttpAdminService, MockAdminService } from '../services/adminService';
import type { AdminService } from '../services/adminService';
import API_CONFIG from './api';

// Determine which service to use based on environment variable
const USE_MOCK_ADMIN = import.meta.env.VITE_USE_MOCK_ADMIN === 'true';

/**
 * Create and export the admin service instance
 * Uses Mock service if VITE_USE_MOCK_ADMIN=true, otherwise uses HTTP service
 */
export const createAdminService = (): AdminService => {
  if (USE_MOCK_ADMIN) {
    console.log('🧪 Using Mock Admin Service (in-memory)');
    return new MockAdminService();
  } else {
    console.log('🌐 Using HTTP Admin Service (Backend API)', API_CONFIG.baseURL);
    return new HttpAdminService(API_CONFIG.baseURL, () => {
      // Get token - try both mock and real auth token keys
      return localStorage.getItem('auth_token') || localStorage.getItem('mock_auth_token');
    });
  }
};

// Export singleton instance
export const adminService = createAdminService();

// Export for testing
export { USE_MOCK_ADMIN };

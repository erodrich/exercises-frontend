/**
 * Authentication Configuration
 * Controls which auth adapter to use (Mock vs API)
 */

import { AuthService } from '../services/authService';
import { MockAuthStorage } from '../infrastructure/auth/MockAuthStorage';
import { ApiAuthAdapter } from '../infrastructure/auth/ApiAuthAdapter';

// Determine which adapter to use based on environment variable
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

/**
 * Create and export the auth service instance
 * Uses Mock adapter if VITE_USE_MOCK_AUTH=true, otherwise uses API adapter
 */
export const createAuthService = (): AuthService => {
  if (USE_MOCK_AUTH) {
    console.log('🧪 Using Mock Authentication (localStorage)');
    return new AuthService(new MockAuthStorage());
  } else {
    console.log('🌐 Using API Authentication (Backend)');
    return new AuthService(new ApiAuthAdapter());
  }
};

// Export singleton instance
export const authService = createAuthService();

// Export for testing
export { USE_MOCK_AUTH };

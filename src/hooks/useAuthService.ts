import { authService } from '../config/auth';
import type { AuthService } from '../services/authService';

/**
 * Hook to get AuthService instance
 * Returns the configured auth service (Mock or API based on environment)
 */
export function useAuthService(): AuthService {
  return authService;
}

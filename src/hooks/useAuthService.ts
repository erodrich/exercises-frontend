import { useMemo } from 'react';
import { AuthService } from '../services/authService';
import { MockAuthStorage } from '../infrastructure/auth/MockAuthStorage';

/**
 * Hook to get AuthService instance
 * Uses singleton pattern to ensure same instance across app
 */
export function useAuthService(): AuthService {
  return useMemo(() => {
    const authStorage = new MockAuthStorage();
    return new AuthService(authStorage);
  }, []);
}

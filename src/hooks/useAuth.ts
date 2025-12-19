import { useState, useEffect, useCallback } from 'react';
import type { AuthState, LoginCredentials, RegisterCredentials } from '../domain/models';
import { useAuthService } from './useAuthService';

/**
 * Authentication Hook
 * Manages authentication state and provides auth operations
 */
export function useAuth() {
  const authService = useAuthService();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const result = await authService.checkAuth();
      
      if (result.success) {
        setAuthState({
          isAuthenticated: true,
          user: result.data.user,
          token: result.data.token,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [authService]);

  /**
   * Login operation
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    console.log('[useAuth] Login attempt:', credentials.email);
    setError(null);
    setLoading(true);

    const result = await authService.login(credentials);
    console.log('[useAuth] Login result:', result);

    if (result.success) {
      console.log('[useAuth] Login successful');
      setAuthState({
        isAuthenticated: true,
        user: result.data.user,
        token: result.data.token,
      });
      setLoading(false);
      return { success: true };
    } else {
      console.log('[useAuth] Login failed:', result.error);
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  }, [authService]);

  /**
   * Register operation
   */
  const register = useCallback(async (credentials: RegisterCredentials) => {
    setError(null);
    setLoading(true);

    const result = await authService.register(credentials);

    if (result.success) {
      setAuthState({
        isAuthenticated: true,
        user: result.data.user,
        token: result.data.token,
      });
      setLoading(false);
      return { success: true };
    } else {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  }, [authService]);

  /**
   * Logout operation
   */
  const logout = useCallback(async () => {
    setError(null);
    setLoading(true);

    const result = await authService.logout();

    if (result.success) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [authService]);

  return {
    // State
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    token: authState.token,
    loading,
    error,

    // Operations
    login,
    register,
    logout,
  };
}

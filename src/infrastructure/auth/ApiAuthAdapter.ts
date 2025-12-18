import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  Result,
} from '../../domain/models';
import type { AuthAdapter, AuthResponse } from '../adapters/AuthAdapter';
import { getEndpoint } from '../../config/api';

/**
 * API Authentication Adapter
 * Connects to real backend API for authentication
 */
export class ApiAuthAdapter implements AuthAdapter {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly CURRENT_USER_KEY = 'current_user';
  private readonly API_TIMEOUT = 10000; // 10 seconds

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<Result<AuthResponse>> {
    try {
      const response = await this.fetchWithTimeout(
        getEndpoint('/api/v1/users/register'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: credentials.username,
            email: credentials.email,
            password: credentials.password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        return {
          success: false,
          error: errorData.message || `Registration failed: ${response.status}`,
        };
      }

      const data: AuthResponse = await response.json();

      // Store authentication state
      this.saveAuthState(data.user, data.token);

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: `Registration failed: ${error instanceof Error ? error.message : 'Network error'}`,
      };
    }
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<Result<AuthResponse>> {
    try {
      const response = await this.fetchWithTimeout(
        getEndpoint('/api/v1/users/login'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        return {
          success: false,
          error: errorData.message || 'Invalid email or password',
        };
      }

      const data: AuthResponse = await response.json();

      // Store authentication state
      this.saveAuthState(data.user, data.token);

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: `Login failed: ${error instanceof Error ? error.message : 'Network error'}`,
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<Result<void>> {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.CURRENT_USER_KEY);
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `Logout failed: ${error}`,
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth(): Promise<Result<AuthResponse>> {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userJson = localStorage.getItem(this.CURRENT_USER_KEY);

      if (!token || !userJson) {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      const user: User = JSON.parse(userJson);

      // Token exists, return cached user data
      // In a more robust implementation, you might validate the token with the backend
      return {
        success: true,
        data: {
          user,
          token,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Auth check failed: ${error}`,
      };
    }
  }

  /**
   * Get current auth token
   */
  async getToken(): Promise<string | null> {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Helper: Save authentication state
   */
  private saveAuthState(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  /**
   * Helper: Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = this.API_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
}

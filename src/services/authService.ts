import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  Result,
} from '../domain/models';
import type { AuthAdapter, AuthResponse } from '../infrastructure/adapters/AuthAdapter';
import {
  validateLoginCredentials,
  validateRegisterCredentials,
} from '../domain/validators/authValidator';

/**
 * Authentication Service
 * Orchestrates authentication logic with infrastructure
 * Uses dependency injection for testability
 */
export class AuthService {
  private readonly authAdapter: AuthAdapter;

  constructor(authAdapter: AuthAdapter) {
    this.authAdapter = authAdapter;
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<Result<AuthResponse>> {
    try {
      // Validate credentials
      const validation = validateLoginCredentials(credentials);
      if (!validation.valid) {
        const errorMessage = validation.errors.map(e => e.message).join(', ');
        return {
          success: false,
          error: `Validation failed: ${errorMessage}`,
        };
      }

      // Call adapter
      const result = await this.authAdapter.login(credentials);
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Login failed: ${error}`,
      };
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<Result<AuthResponse>> {
    try {
      // Validate credentials
      const validation = validateRegisterCredentials(credentials);
      if (!validation.valid) {
        const errorMessage = validation.errors.map(e => e.message).join(', ');
        return {
          success: false,
          error: `Validation failed: ${errorMessage}`,
        };
      }

      // Call adapter
      const result = await this.authAdapter.register(credentials);
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Registration failed: ${error}`,
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<Result<void>> {
    try {
      const result = await this.authAdapter.logout();
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Logout failed: ${error}`,
      };
    }
  }

  /**
   * Check authentication status
   */
  async checkAuth(): Promise<Result<AuthResponse>> {
    try {
      const result = await this.authAdapter.checkAuth();
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Auth check failed: ${error}`,
      };
    }
  }

  /**
   * Get authentication token
   */
  async getToken(): Promise<string | null> {
    try {
      return await this.authAdapter.getToken();
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  /**
   * Get current user (convenience method)
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const result = await this.checkAuth();
      if (result.success) {
        return result.data.user;
      }
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated (convenience method)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const result = await this.checkAuth();
      return result.success;
    } catch (error) {
      return false;
    }
  }
}

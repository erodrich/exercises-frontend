import type { User, LoginCredentials, RegisterCredentials, Result } from '../../domain/models';

/**
 * Authentication Adapter Interface
 * Abstraction over authentication implementations (mock, API, etc.)
 */

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthAdapter {
  /**
   * Login with credentials
   */
  login(credentials: LoginCredentials): Promise<Result<AuthResponse>>;

  /**
   * Register new user
   */
  register(credentials: RegisterCredentials): Promise<Result<AuthResponse>>;

  /**
   * Logout current user
   */
  logout(): Promise<Result<void>>;

  /**
   * Check if user is authenticated and get current user
   */
  checkAuth(): Promise<Result<AuthResponse>>;

  /**
   * Get current auth token
   */
  getToken(): Promise<string | null>;
}

import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  Result,
  Role,
} from '../../domain/models';
import type { AuthAdapter, AuthResponse } from '../adapters/AuthAdapter';

/**
 * Stored user data (includes password for mock authentication)
 */
interface StoredUser extends User {
  password: string;
}

/**
 * Mock Authentication Storage
 * Simulates backend authentication using localStorage
 * In production, this would be replaced with API calls
 */
export class MockAuthStorage implements AuthAdapter {
  private readonly USERS_KEY = 'mock_users';
  private readonly TOKEN_KEY = 'mock_auth_token';
  private readonly CURRENT_USER_KEY = 'mock_current_user';

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<Result<AuthResponse>> {
    try {
      // Check if user already exists
      const existingUser = this.findUserByEmail(credentials.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Create new user (default role is USER)
      const newUser: StoredUser = {
        id: this.generateId(),
        username: credentials.username,
        email: credentials.email,
        password: credentials.password, // In production, this would be hashed
        role: 'USER' as Role,
      };

      // Store user
      this.saveUser(newUser);

      // Generate token
      const token = this.generateToken(newUser.id);

      // Store authentication state
      this.saveAuthState(newUser, token);

      // Return public user data (without password)
      const publicUser: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      };

      return {
        success: true,
        data: {
          user: publicUser,
          token,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Registration failed: ${error}`,
      };
    }
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<Result<AuthResponse>> {
    try {
      console.log('[MockAuthStorage] Login attempt for:', credentials.email);
      // Find user by email
      const user = this.findUserByEmail(credentials.email);
      if (!user) {
        console.log('[MockAuthStorage] User not found');
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      console.log('[MockAuthStorage] User found, checking password');
      // Check password
      if (user.password !== credentials.password) {
        console.log('[MockAuthStorage] Password mismatch');
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Generate token
      const token = this.generateToken(user.id);

      // Store authentication state
      this.saveAuthState(user, token);

      // Return public user data
      const publicUser: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      return {
        success: true,
        data: {
          user: publicUser,
          token,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Login failed: ${error}`,
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
   * Helper: Find user by email
   */
  private findUserByEmail(email: string): StoredUser | null {
    const users = this.loadUsers();
    return users.find(u => u.email === email) || null;
  }

  /**
   * Helper: Load all users from storage
   */
  private loadUsers(): StoredUser[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    if (!usersJson) {
      return [];
    }
    return JSON.parse(usersJson);
  }

  /**
   * Helper: Save user to storage
   */
  private saveUser(user: StoredUser): void {
    const users = this.loadUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Helper: Save authentication state
   */
  private saveAuthState(user: StoredUser, token: string): void {
    const publicUser: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(publicUser));
  }
  
  /**
   * Helper: Initialize admin user if not exists
   * This is for testing purposes - in production, admin would be created in backend
   */
  initializeAdminUser(): void {
    const adminEmail = 'admin@exercises.com';
    const existingAdmin = this.findUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      const adminUser: StoredUser = {
        id: 'admin_1',
        username: 'admin',
        email: adminEmail,
        password: 'Admin123!',
        role: 'ADMIN' as Role,
      };
      this.saveUser(adminUser);
    }
  }

  /**
   * Helper: Generate unique ID
   */
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper: Generate mock JWT token
   */
  private generateToken(userId: string): string {
    // In production, this would be a real JWT from the backend
    return `mock_token_${userId}_${Date.now()}`;
  }
}

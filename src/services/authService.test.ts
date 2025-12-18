import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './authService';
import type { AuthAdapter, AuthResponse } from '../infrastructure/adapters/AuthAdapter';
import type { Result } from '../domain/models';

// Mock AuthAdapter
class MockAuthAdapter implements AuthAdapter {
  login = vi.fn();
  register = vi.fn();
  logout = vi.fn();
  checkAuth = vi.fn();
  getToken = vi.fn();
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockAdapter: MockAuthAdapter;

  beforeEach(() => {
    mockAdapter = new MockAuthAdapter();
    authService = new AuthService(mockAdapter);
  });

  describe('login', () => {
    it('should return error for invalid credentials (validation)', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'short',
      };

      const result = await authService.login(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Validation failed');
      }
      expect(mockAdapter.login).not.toHaveBeenCalled();
    });

    it('should call adapter login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        token: 'mock_token',
      };

      mockAdapter.login.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await authService.login(credentials);

      expect(mockAdapter.login).toHaveBeenCalledWith(credentials);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockResponse);
      }
    });

    it('should return error from adapter if login fails', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAdapter.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const result = await authService.login(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should handle adapter exceptions', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAdapter.login.mockRejectedValue(new Error('Network error'));

      const result = await authService.login(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Login failed');
      }
    });
  });

  describe('register', () => {
    it('should return error for invalid credentials (validation)', async () => {
      const credentials = {
        username: 'ab',
        email: 'invalid',
        password: 'short',
        confirmPassword: 'different',
      };

      const result = await authService.register(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Validation failed');
      }
      expect(mockAdapter.register).not.toHaveBeenCalled();
    });

    it('should call adapter register with valid credentials', async () => {
      const credentials = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        token: 'mock_token',
      };

      mockAdapter.register.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await authService.register(credentials);

      expect(mockAdapter.register).toHaveBeenCalledWith(credentials);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockResponse);
      }
    });

    it('should return error from adapter if registration fails', async () => {
      const credentials = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      mockAdapter.register.mockResolvedValue({
        success: false,
        error: 'Email already exists',
      });

      const result = await authService.register(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Email already exists');
      }
    });

    it('should handle adapter exceptions', async () => {
      const credentials = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      mockAdapter.register.mockRejectedValue(new Error('Network error'));

      const result = await authService.register(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Registration failed');
      }
    });
  });

  describe('logout', () => {
    it('should call adapter logout', async () => {
      mockAdapter.logout.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const result = await authService.logout();

      expect(mockAdapter.logout).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should return error if logout fails', async () => {
      mockAdapter.logout.mockResolvedValue({
        success: false,
        error: 'Logout failed',
      });

      const result = await authService.logout();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Logout failed');
      }
    });

    it('should handle adapter exceptions', async () => {
      mockAdapter.logout.mockRejectedValue(new Error('Network error'));

      const result = await authService.logout();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Logout failed');
      }
    });
  });

  describe('checkAuth', () => {
    it('should call adapter checkAuth', async () => {
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        token: 'mock_token',
      };

      mockAdapter.checkAuth.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await authService.checkAuth();

      expect(mockAdapter.checkAuth).toHaveBeenCalled();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockResponse);
      }
    });

    it('should return error if not authenticated', async () => {
      mockAdapter.checkAuth.mockResolvedValue({
        success: false,
        error: 'Not authenticated',
      });

      const result = await authService.checkAuth();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not authenticated');
      }
    });

    it('should handle adapter exceptions', async () => {
      mockAdapter.checkAuth.mockRejectedValue(new Error('Network error'));

      const result = await authService.checkAuth();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Auth check failed');
      }
    });
  });

  describe('getToken', () => {
    it('should return token from adapter', async () => {
      mockAdapter.getToken.mockResolvedValue('mock_token');

      const token = await authService.getToken();

      expect(mockAdapter.getToken).toHaveBeenCalled();
      expect(token).toBe('mock_token');
    });

    it('should return null if no token', async () => {
      mockAdapter.getToken.mockResolvedValue(null);

      const token = await authService.getToken();

      expect(token).toBeNull();
    });

    it('should return null if adapter throws', async () => {
      mockAdapter.getToken.mockRejectedValue(new Error('Error'));

      const token = await authService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user if authenticated', async () => {
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        token: 'mock_token',
      };

      mockAdapter.checkAuth.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockResponse.user);
    });

    it('should return null if not authenticated', async () => {
      mockAdapter.checkAuth.mockResolvedValue({
        success: false,
        error: 'Not authenticated',
      });

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null if adapter throws', async () => {
      mockAdapter.checkAuth.mockRejectedValue(new Error('Error'));

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if user is authenticated', async () => {
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        token: 'mock_token',
      };

      mockAdapter.checkAuth.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const isAuth = await authService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false if not authenticated', async () => {
      mockAdapter.checkAuth.mockResolvedValue({
        success: false,
        error: 'Not authenticated',
      });

      const isAuth = await authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });

    it('should return false if adapter throws', async () => {
      mockAdapter.checkAuth.mockRejectedValue(new Error('Error'));

      const isAuth = await authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });
});

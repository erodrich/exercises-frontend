import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiAuthAdapter } from './ApiAuthAdapter';
import type { LoginCredentials, RegisterCredentials } from '../../domain/models';

// Mock fetch
global.fetch = vi.fn();

describe('ApiAuthAdapter', () => {
  let adapter: ApiAuthAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new ApiAuthAdapter();
    mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register successfully and store auth state', async () => {
      const credentials: RegisterCredentials = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        token: 'mock.jwt.token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.register(credentials);

      expect(result.success).toBe(true);
      expect(result.data?.user.username).toBe('testuser');
      expect(result.data?.token).toBe('mock.jwt.token');
      expect(localStorage.getItem('auth_token')).toBe('mock.jwt.token');
    });

    it('should handle registration failure', async () => {
      const credentials: RegisterCredentials = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Email already exists' }),
      });

      const result = await adapter.register(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email already exists');
    });

    it('should handle network errors', async () => {
      const credentials: RegisterCredentials = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await adapter.register(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('login', () => {
    it('should login successfully and store auth state', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        token: 'mock.jwt.token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.login(credentials);

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('test@example.com');
      expect(result.data?.token).toBe('mock.jwt.token');
      expect(localStorage.getItem('auth_token')).toBe('mock.jwt.token');
    });

    it('should handle invalid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid email or password' }),
      });

      const result = await adapter.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email or password');
    });
  });

  describe('logout', () => {
    it('should clear auth state', async () => {
      localStorage.setItem('auth_token', 'mock.token');
      localStorage.setItem('current_user', JSON.stringify({ id: '1', username: 'test' }));

      const result = await adapter.logout();

      expect(result.success).toBe(true);
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('should return auth state if token exists', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      };

      localStorage.setItem('auth_token', 'mock.token');
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      const result = await adapter.checkAuth();

      expect(result.success).toBe(true);
      expect(result.data?.user).toEqual(mockUser);
      expect(result.data?.token).toBe('mock.token');
    });

    it('should return error if not authenticated', async () => {
      const result = await adapter.checkAuth();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });
  });

  describe('getToken', () => {
    it('should return token if exists', async () => {
      localStorage.setItem('auth_token', 'mock.token');

      const token = await adapter.getToken();

      expect(token).toBe('mock.token');
    });

    it('should return null if no token', async () => {
      const token = await adapter.getToken();

      expect(token).toBeNull();
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { MockAuthStorage } from './MockAuthStorage';

describe('MockAuthStorage', () => {
  let authStorage: MockAuthStorage;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    authStorage = new MockAuthStorage();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const credentials = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = await authStorage.register(credentials);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user.username).toBe('testuser');
        expect(result.data.user.email).toBe('test@example.com');
        expect(result.data.user.id).toBeDefined();
        expect(result.data.token).toBeDefined();
      }
    });

    it('should return error if email already exists', async () => {
      const credentials = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await authStorage.register(credentials);
      const result = await authStorage.register(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('already exists');
      }
    });

    it('should allow different users with different emails', async () => {
      const user1 = {
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const user2 = {
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result1 = await authStorage.register(user1);
      const result2 = await authStorage.register(user2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should store user data in localStorage', async () => {
      const credentials = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await authStorage.register(credentials);

      const storedUsers = localStorage.getItem('mock_users');
      expect(storedUsers).toBeTruthy();
      
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        expect(users).toHaveLength(1);
        expect(users[0].email).toBe('test@example.com');
      }
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await authStorage.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    it('should successfully login with correct credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authStorage.login(credentials);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user.email).toBe('test@example.com');
        expect(result.data.user.username).toBe('testuser');
        expect(result.data.token).toBeDefined();
      }
    });

    it('should return error for non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const result = await authStorage.login(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid');
      }
    });

    it('should return error for incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const result = await authStorage.login(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid');
      }
    });

    it('should store auth token in localStorage', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      await authStorage.login(credentials);

      const token = localStorage.getItem('mock_auth_token');
      expect(token).toBeTruthy();
    });

    it('should store current user in localStorage', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      await authStorage.login(credentials);

      const currentUser = localStorage.getItem('mock_current_user');
      expect(currentUser).toBeTruthy();
      
      if (currentUser) {
        const user = JSON.parse(currentUser);
        expect(user.email).toBe('test@example.com');
      }
    });
  });

  describe('logout', () => {
    beforeEach(async () => {
      await authStorage.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      await authStorage.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should successfully logout', async () => {
      const result = await authStorage.logout();
      expect(result.success).toBe(true);
    });

    it('should remove auth token from localStorage', async () => {
      await authStorage.logout();

      const token = localStorage.getItem('mock_auth_token');
      expect(token).toBeNull();
    });

    it('should remove current user from localStorage', async () => {
      await authStorage.logout();

      const currentUser = localStorage.getItem('mock_current_user');
      expect(currentUser).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('should return null if no user is logged in', async () => {
      const result = await authStorage.checkAuth();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Not authenticated');
      }
    });

    it('should return user if logged in', async () => {
      await authStorage.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      await authStorage.login({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await authStorage.checkAuth();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user.email).toBe('test@example.com');
        expect(result.data.token).toBeDefined();
      }
    });

    it('should work after page refresh (localStorage persistence)', async () => {
      await authStorage.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      await authStorage.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Create new instance to simulate page refresh
      const newAuthStorage = new MockAuthStorage();
      const result = await newAuthStorage.checkAuth();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user.email).toBe('test@example.com');
      }
    });
  });

  describe('getToken', () => {
    it('should return null if no user is logged in', async () => {
      const token = await authStorage.getToken();
      expect(token).toBeNull();
    });

    it('should return token if user is logged in', async () => {
      await authStorage.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      await authStorage.login({
        email: 'test@example.com',
        password: 'password123',
      });

      const token = await authStorage.getToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
  });
});

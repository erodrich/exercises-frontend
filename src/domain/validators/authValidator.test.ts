import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateLoginCredentials,
  validateRegisterCredentials,
} from './authValidator';

describe('authValidator', () => {
  describe('validateEmail', () => {
    it('should return valid for correct email format', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for empty email', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[0].message).toContain('required');
    });

    it('should return invalid for email without @', () => {
      const result = validateEmail('testexample.com');
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('valid email');
    });

    it('should return invalid for email without domain', () => {
      const result = validateEmail('test@');
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('valid email');
    });

    it('should return invalid for email without local part', () => {
      const result = validateEmail('@example.com');
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('valid email');
    });

    it('should accept email with subdomain', () => {
      const result = validateEmail('test@mail.example.com');
      expect(result.valid).toBe(true);
    });

    it('should accept email with plus sign', () => {
      const result = validateEmail('test+tag@example.com');
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should return valid for password with 8+ characters', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('password');
      expect(result.errors[0].message).toContain('required');
    });

    it('should return invalid for password less than 8 characters', () => {
      const result = validatePassword('pass123');
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('at least 8 characters');
    });

    it('should accept password with exactly 8 characters', () => {
      const result = validatePassword('password');
      expect(result.valid).toBe(true);
    });

    it('should accept long password', () => {
      const result = validatePassword('a'.repeat(100));
      expect(result.valid).toBe(true);
    });
  });

  describe('validateUsername', () => {
    it('should return valid for username with 3-20 characters', () => {
      const result = validateUsername('john_doe');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for empty username', () => {
      const result = validateUsername('');
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('username');
      expect(result.errors[0].message).toContain('required');
    });

    it('should return invalid for username less than 3 characters', () => {
      const result = validateUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('between 3 and 20 characters');
    });

    it('should return invalid for username more than 20 characters', () => {
      const result = validateUsername('a'.repeat(21));
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('between 3 and 20 characters');
    });

    it('should accept username with exactly 3 characters', () => {
      const result = validateUsername('abc');
      expect(result.valid).toBe(true);
    });

    it('should accept username with exactly 20 characters', () => {
      const result = validateUsername('a'.repeat(20));
      expect(result.valid).toBe(true);
    });

    it('should accept username with letters, numbers, underscore, hyphen', () => {
      const result = validateUsername('user_name-123');
      expect(result.valid).toBe(true);
    });

    it('should return invalid for username with special characters', () => {
      const result = validateUsername('user@name');
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('letters, numbers, underscores, and hyphens');
    });

    it('should return invalid for username with spaces', () => {
      const result = validateUsername('user name');
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('letters, numbers, underscores, and hyphens');
    });
  });

  describe('validateLoginCredentials', () => {
    it('should return valid for correct login credentials', () => {
      const result = validateLoginCredentials({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for invalid email', () => {
      const result = validateLoginCredentials({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should return invalid for invalid password', () => {
      const result = validateLoginCredentials({
        email: 'test@example.com',
        password: 'short',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'password')).toBe(true);
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const result = validateLoginCredentials({
        email: '',
        password: '',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('validateRegisterCredentials', () => {
    it('should return valid for correct registration credentials', () => {
      const result = validateRegisterCredentials({
        username: 'john_doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for invalid username', () => {
      const result = validateRegisterCredentials({
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'username')).toBe(true);
    });

    it('should return invalid for invalid email', () => {
      const result = validateRegisterCredentials({
        username: 'john_doe',
        email: 'invalid',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should return invalid for invalid password', () => {
      const result = validateRegisterCredentials({
        username: 'john_doe',
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'password')).toBe(true);
    });

    it('should return invalid when passwords do not match', () => {
      const result = validateRegisterCredentials({
        username: 'john_doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'confirmPassword')).toBe(true);
      expect(result.errors.some(e => e.message.includes('match'))).toBe(true);
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const result = validateRegisterCredentials({
        username: '',
        email: '',
        password: '',
        confirmPassword: 'different',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });

    it('should validate all fields independently', () => {
      const result = validateRegisterCredentials({
        username: 'a',
        email: 'invalid',
        password: 'short',
        confirmPassword: 'different',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });
  });
});

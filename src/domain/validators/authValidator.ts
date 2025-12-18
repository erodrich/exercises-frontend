import type {
  ValidationResult,
  ValidationError,
  LoginCredentials,
  RegisterCredentials,
} from '../models';

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!email || email.trim() === '') {
    errors.push({
      field: 'email',
      message: 'Email is required',
    });
    return { valid: false, errors };
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!password || password.trim() === '') {
    errors.push({
      field: 'password',
      message: 'Password is required',
    });
    return { valid: false, errors };
  }

  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username format
 */
export function validateUsername(username: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!username || username.trim() === '') {
    errors.push({
      field: 'username',
      message: 'Username is required',
    });
    return { valid: false, errors };
  }

  if (username.length < 3 || username.length > 20) {
    errors.push({
      field: 'username',
      message: 'Username must be between 3 and 20 characters',
    });
  }

  // Only allow alphanumeric characters, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    errors.push({
      field: 'username',
      message: 'Username can only contain letters, numbers, underscores, and hyphens',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate login credentials
 */
export function validateLoginCredentials(
  credentials: LoginCredentials
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate email
  const emailValidation = validateEmail(credentials.email);
  errors.push(...emailValidation.errors);

  // Validate password
  const passwordValidation = validatePassword(credentials.password);
  errors.push(...passwordValidation.errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate registration credentials
 */
export function validateRegisterCredentials(
  credentials: RegisterCredentials
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate username
  const usernameValidation = validateUsername(credentials.username);
  errors.push(...usernameValidation.errors);

  // Validate email
  const emailValidation = validateEmail(credentials.email);
  errors.push(...emailValidation.errors);

  // Validate password
  const passwordValidation = validatePassword(credentials.password);
  errors.push(...passwordValidation.errors);

  // Validate password confirmation
  if (credentials.password !== credentials.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Passwords do not match',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

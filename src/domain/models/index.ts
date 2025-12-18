/**
 * Domain Models
 * Pure TypeScript interfaces and types representing the business domain
 */

export interface Exercise {
  group: string;
  name: string;
}

export interface ExerciseSet {
  weight: number;
  reps: number;
}

export interface ExerciseLogEntry {
  timestamp: string;
  exercise: Exercise;
  sets: ExerciseSet[];
  failure: boolean;
}

/**
 * Validation result with detailed error information
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Result type for operations that can succeed or fail
 */
export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Authentication Models
 */

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

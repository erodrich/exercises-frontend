import type { ExerciseLogEntry, ExerciseSet, ValidationResult, ValidationError } from '../models';

/**
 * Exercise Validator
 * Pure validation functions with no side effects
 */

const MAX_NAME_LENGTH = 100;
const MAX_WEIGHT = 1000; // kg
const MAX_REPS = 1000;
const MAX_SETS = 50;

/**
 * Validates an exercise name
 */
export function validateExerciseName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length > MAX_NAME_LENGTH) return false;
  return true;
}

/**
 * Validates an exercise group
 */
export function validateExerciseGroup(group: string): boolean {
  if (!group || typeof group !== 'string') return false;
  const trimmed = group.trim();
  if (trimmed.length === 0) return false;
  return true;
}

/**
 * Validates weight value
 */
export function validateWeight(weight: number): boolean {
  if (typeof weight !== 'number') return false;
  if (isNaN(weight)) return false;
  if (!isFinite(weight)) return false;
  if (weight <= 0) return false;
  if (weight > MAX_WEIGHT) return false;
  return true;
}

/**
 * Validates reps value
 */
export function validateReps(reps: number): boolean {
  if (typeof reps !== 'number') return false;
  if (isNaN(reps)) return false;
  if (!isFinite(reps)) return false;
  if (reps <= 0) return false;
  if (!Number.isInteger(reps)) return false; // Reps must be whole numbers
  if (reps > MAX_REPS) return false;
  return true;
}

/**
 * Validates an array of exercise sets
 */
export function validateSets(sets: ExerciseSet[]): ValidationResult {
  const errors: ValidationError[] = [];

  // Must have at least one set
  if (!sets || sets.length === 0) {
    errors.push({
      field: 'sets',
      message: 'Must have at least one set',
    });
    return { valid: false, errors };
  }

  // Sanity check for too many sets
  if (sets.length > MAX_SETS) {
    errors.push({
      field: 'sets',
      message: `Cannot have more than ${MAX_SETS} sets (too many sets provided)`,
    });
    return { valid: false, errors };
  }

  // Validate each set
  sets.forEach((set, index) => {
    if (!validateWeight(set.weight)) {
      errors.push({
        field: `sets[${index}].weight`,
        message: `Set ${index + 1}: Weight must be a positive number (max ${MAX_WEIGHT}kg)`,
      });
    }

    if (!validateReps(set.reps)) {
      errors.push({
        field: `sets[${index}].reps`,
        message: `Set ${index + 1}: Reps must be a positive whole number (max ${MAX_REPS})`,
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a complete exercise log entry
 */
export function validateExercise(entry: ExerciseLogEntry): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate timestamp
  if (!entry.timestamp || entry.timestamp.trim().length === 0) {
    errors.push({
      field: 'timestamp',
      message: 'Timestamp is required',
    });
  }

  // Validate exercise group
  if (!validateExerciseGroup(entry.exercise.group)) {
    errors.push({
      field: 'exercise.group',
      message: 'Exercise group is required',
    });
  }

  // Validate exercise name
  if (!validateExerciseName(entry.exercise.name)) {
    errors.push({
      field: 'exercise.name',
      message: `Exercise name is required (max ${MAX_NAME_LENGTH} characters)`,
    });
  }

  // Validate sets
  const setsValidation = validateSets(entry.sets);
  if (!setsValidation.valid) {
    errors.push(...setsValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

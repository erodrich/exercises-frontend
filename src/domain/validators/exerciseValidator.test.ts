import { describe, it, expect } from 'vitest';
import {
  validateExercise,
  validateExerciseName,
  validateExerciseGroup,
  validateWeight,
  validateReps,
  validateSets,
} from './exerciseValidator';
import { createExerciseLogEntry, createExerciseSet } from '../../test/factories';

describe('exerciseValidator', () => {
  describe('validateExerciseName', () => {
    it('should pass for valid exercise name', () => {
      expect(validateExerciseName('Bench Press')).toBe(true);
    });

    it('should fail for empty name', () => {
      expect(validateExerciseName('')).toBe(false);
    });

    it('should fail for whitespace-only name', () => {
      expect(validateExerciseName('   ')).toBe(false);
    });

    it('should fail for very long name (>100 chars)', () => {
      const longName = 'a'.repeat(101);
      expect(validateExerciseName(longName)).toBe(false);
    });

    it('should pass for name with numbers', () => {
      expect(validateExerciseName('21s Bicep Curl')).toBe(true);
    });

    it('should pass for name with special characters', () => {
      expect(validateExerciseName('T-Bar Row')).toBe(true);
    });
  });

  describe('validateExerciseGroup', () => {
    it('should pass for valid group', () => {
      expect(validateExerciseGroup('Chest')).toBe(true);
    });

    it('should fail for empty group', () => {
      expect(validateExerciseGroup('')).toBe(false);
    });

    it('should fail for whitespace-only group', () => {
      expect(validateExerciseGroup('  ')).toBe(false);
    });
  });

  describe('validateWeight', () => {
    it('should pass for positive weight', () => {
      expect(validateWeight(50)).toBe(true);
    });

    it('should pass for decimal weight', () => {
      expect(validateWeight(22.5)).toBe(true);
    });

    it('should fail for zero weight', () => {
      expect(validateWeight(0)).toBe(false);
    });

    it('should fail for negative weight', () => {
      expect(validateWeight(-10)).toBe(false);
    });

    it('should fail for weight > 1000kg (sanity check)', () => {
      expect(validateWeight(1001)).toBe(false);
    });

    it('should fail for NaN', () => {
      expect(validateWeight(NaN)).toBe(false);
    });

    it('should fail for Infinity', () => {
      expect(validateWeight(Infinity)).toBe(false);
    });
  });

  describe('validateReps', () => {
    it('should pass for positive reps', () => {
      expect(validateReps(10)).toBe(true);
    });

    it('should pass for single rep', () => {
      expect(validateReps(1)).toBe(true);
    });

    it('should fail for zero reps', () => {
      expect(validateReps(0)).toBe(false);
    });

    it('should fail for negative reps', () => {
      expect(validateReps(-5)).toBe(false);
    });

    it('should fail for decimal reps', () => {
      expect(validateReps(10.5)).toBe(false);
    });

    it('should fail for reps > 1000 (sanity check)', () => {
      expect(validateReps(1001)).toBe(false);
    });

    it('should fail for NaN', () => {
      expect(validateReps(NaN)).toBe(false);
    });
  });

  describe('validateSets', () => {
    it('should pass for valid sets', () => {
      const sets = [
        createExerciseSet({ weight: 100, reps: 10 }),
        createExerciseSet({ weight: 100, reps: 9 }),
      ];
      const result = validateSets(sets);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for empty sets array', () => {
      const result = validateSets([]);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('sets');
      expect(result.errors[0].message).toContain('at least one set');
    });

    it('should collect errors for invalid weight', () => {
      const sets = [createExerciseSet({ weight: 0, reps: 10 })];
      const result = validateSets(sets);
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('sets[0].weight');
    });

    it('should collect errors for invalid reps', () => {
      const sets = [createExerciseSet({ weight: 100, reps: 0 })];
      const result = validateSets(sets);
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('sets[0].reps');
    });

    it('should collect multiple errors from multiple sets', () => {
      const sets = [
        createExerciseSet({ weight: 0, reps: 10 }),
        createExerciseSet({ weight: 100, reps: 0 }),
        createExerciseSet({ weight: -5, reps: -2 }),
      ];
      const result = validateSets(sets);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should fail for too many sets (>50 sanity check)', () => {
      const sets = Array(51).fill(null).map(() => createExerciseSet());
      const result = validateSets(sets);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('too many sets');
    });
  });

  describe('validateExercise', () => {
    it('should pass for valid exercise entry', () => {
      const entry = createExerciseLogEntry({
        exercise: { group: 'Chest', name: 'Bench Press' },
        sets: [createExerciseSet({ weight: 100, reps: 10 })],
      });
      const result = validateExercise(entry);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect all validation errors', () => {
      const entry = createExerciseLogEntry({
        exercise: { group: '', name: '' },
        sets: [createExerciseSet({ weight: 0, reps: 0 })],
      });
      const result = validateExercise(entry);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Should have errors for group, name, and sets
      const fields = result.errors.map(e => e.field);
      expect(fields.some(f => f.includes('group'))).toBe(true);
      expect(fields.some(f => f.includes('name'))).toBe(true);
      expect(fields.some(f => f.includes('weight'))).toBe(true);
      expect(fields.some(f => f.includes('reps'))).toBe(true);
    });

    it('should fail for missing exercise group', () => {
      const entry = createExerciseLogEntry({
        exercise: { group: '', name: 'Bench Press' },
      });
      const result = validateExercise(entry);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'exercise.group')).toBe(true);
    });

    it('should fail for missing exercise name', () => {
      const entry = createExerciseLogEntry({
        exercise: { group: 'Chest', name: '' },
      });
      const result = validateExercise(entry);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'exercise.name')).toBe(true);
    });

    it('should fail for invalid sets', () => {
      const entry = createExerciseLogEntry({
        sets: [],
      });
      const result = validateExercise(entry);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'sets')).toBe(true);
    });

    it('should validate timestamp exists', () => {
      const entry = createExerciseLogEntry();
      (entry as any).timestamp = '';
      const result = validateExercise(entry);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'timestamp')).toBe(true);
    });

    it('should provide helpful error messages', () => {
      const entry = createExerciseLogEntry({
        exercise: { group: '', name: '' },
        sets: [],
      });
      const result = validateExercise(entry);
      
      result.errors.forEach(error => {
        expect(error.message).toBeTruthy();
        expect(error.message.length).toBeGreaterThan(0);
      });
    });
  });
});

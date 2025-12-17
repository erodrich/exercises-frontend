import { describe, it, expect } from 'vitest';
import {
  createExercise,
  createExerciseSet,
  createExerciseLogEntry,
  createEmptyExerciseLogEntry,
} from './factories';

describe('Test Factories', () => {
  describe('createExercise', () => {
    it('should create default exercise', () => {
      const exercise = createExercise();
      
      expect(exercise).toEqual({
        group: 'Chest',
        name: 'Bench Press',
      });
    });

    it('should allow overrides', () => {
      const exercise = createExercise({ 
        group: 'Back', 
        name: 'Pull Up' 
      });
      
      expect(exercise.group).toBe('Back');
      expect(exercise.name).toBe('Pull Up');
    });
  });

  describe('createExerciseSet', () => {
    it('should create default set', () => {
      const set = createExerciseSet();
      
      expect(set).toEqual({
        weight: 100,
        reps: 10,
      });
    });

    it('should allow overrides', () => {
      const set = createExerciseSet({ weight: 50, reps: 12 });
      
      expect(set.weight).toBe(50);
      expect(set.reps).toBe(12);
    });
  });

  describe('createExerciseLogEntry', () => {
    it('should create valid log entry', () => {
      const entry = createExerciseLogEntry();
      
      expect(entry).toMatchObject({
        exercise: {
          group: 'Chest',
          name: 'Bench Press',
        },
        sets: [{ weight: 100, reps: 10 }],
        failure: false,
      });
      expect(entry.timestamp).toBeTruthy();
    });

    it('should allow overrides', () => {
      const entry = createExerciseLogEntry({
        exercise: { group: 'Legs', name: 'Squat' },
        failure: true,
      });
      
      expect(entry.exercise.group).toBe('Legs');
      expect(entry.exercise.name).toBe('Squat');
      expect(entry.failure).toBe(true);
    });
  });

  describe('createEmptyExerciseLogEntry', () => {
    it('should create empty entry with zero values', () => {
      const entry = createEmptyExerciseLogEntry();
      
      expect(entry.exercise.group).toBe('');
      expect(entry.exercise.name).toBe('');
      expect(entry.sets).toEqual([{ weight: 0, reps: 0 }]);
      expect(entry.failure).toBe(false);
      expect(entry.timestamp).toBeTruthy();
    });
  });
});

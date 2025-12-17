import { describe, it, expect } from 'vitest';
import {
  calculateSetVolume,
  calculateTotalVolume,
  calculateTotalReps,
  calculateAverageWeight,
  calculateMaxWeight,
  calculateOneRepMax,
} from './volumeCalculator';
import { createExerciseSet, createExerciseLogEntry } from '../../test/factories';

describe('volumeCalculator', () => {
  describe('calculateSetVolume', () => {
    it('should calculate volume for a set', () => {
      const set = createExerciseSet({ weight: 100, reps: 10 });
      expect(calculateSetVolume(set)).toBe(1000);
    });

    it('should handle decimal weights', () => {
      const set = createExerciseSet({ weight: 22.5, reps: 10 });
      expect(calculateSetVolume(set)).toBe(225);
    });

    it('should handle single rep', () => {
      const set = createExerciseSet({ weight: 200, reps: 1 });
      expect(calculateSetVolume(set)).toBe(200);
    });

    it('should return 0 for zero weight', () => {
      const set = createExerciseSet({ weight: 0, reps: 10 });
      expect(calculateSetVolume(set)).toBe(0);
    });

    it('should return 0 for zero reps', () => {
      const set = createExerciseSet({ weight: 100, reps: 0 });
      expect(calculateSetVolume(set)).toBe(0);
    });
  });

  describe('calculateTotalVolume', () => {
    it('should sum volume from multiple sets', () => {
      const sets = [
        createExerciseSet({ weight: 100, reps: 10 }), // 1000
        createExerciseSet({ weight: 100, reps: 8 }),  // 800
        createExerciseSet({ weight: 100, reps: 6 }),  // 600
      ];
      expect(calculateTotalVolume(sets)).toBe(2400);
    });

    it('should handle single set', () => {
      const sets = [createExerciseSet({ weight: 50, reps: 12 })];
      expect(calculateTotalVolume(sets)).toBe(600);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalVolume([])).toBe(0);
    });

    it('should handle varying weights', () => {
      const sets = [
        createExerciseSet({ weight: 100, reps: 10 }),
        createExerciseSet({ weight: 90, reps: 10 }),
        createExerciseSet({ weight: 80, reps: 10 }),
      ];
      expect(calculateTotalVolume(sets)).toBe(2700);
    });

    it('should handle decimal results', () => {
      const sets = [
        createExerciseSet({ weight: 22.5, reps: 10 }),
        createExerciseSet({ weight: 22.5, reps: 10 }),
      ];
      expect(calculateTotalVolume(sets)).toBe(450);
    });
  });

  describe('calculateTotalReps', () => {
    it('should sum reps from all sets', () => {
      const sets = [
        createExerciseSet({ weight: 100, reps: 10 }),
        createExerciseSet({ weight: 100, reps: 8 }),
        createExerciseSet({ weight: 100, reps: 6 }),
      ];
      expect(calculateTotalReps(sets)).toBe(24);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalReps([])).toBe(0);
    });

    it('should handle single set', () => {
      const sets = [createExerciseSet({ weight: 100, reps: 15 })];
      expect(calculateTotalReps(sets)).toBe(15);
    });
  });

  describe('calculateAverageWeight', () => {
    it('should calculate average weight across sets', () => {
      const sets = [
        createExerciseSet({ weight: 100, reps: 10 }),
        createExerciseSet({ weight: 90, reps: 10 }),
        createExerciseSet({ weight: 80, reps: 10 }),
      ];
      expect(calculateAverageWeight(sets)).toBe(90);
    });

    it('should handle single set', () => {
      const sets = [createExerciseSet({ weight: 75, reps: 10 })];
      expect(calculateAverageWeight(sets)).toBe(75);
    });

    it('should return 0 for empty array', () => {
      expect(calculateAverageWeight([])).toBe(0);
    });

    it('should handle decimal weights', () => {
      const sets = [
        createExerciseSet({ weight: 22.5, reps: 10 }),
        createExerciseSet({ weight: 27.5, reps: 10 }),
      ];
      expect(calculateAverageWeight(sets)).toBe(25);
    });

    it('should round to 2 decimal places', () => {
      const sets = [
        createExerciseSet({ weight: 100, reps: 10 }),
        createExerciseSet({ weight: 95, reps: 10 }),
        createExerciseSet({ weight: 91, reps: 10 }),
      ];
      // Average = 95.333...
      expect(calculateAverageWeight(sets)).toBeCloseTo(95.33, 2);
    });
  });

  describe('calculateMaxWeight', () => {
    it('should find maximum weight', () => {
      const sets = [
        createExerciseSet({ weight: 100, reps: 10 }),
        createExerciseSet({ weight: 120, reps: 6 }),
        createExerciseSet({ weight: 90, reps: 12 }),
      ];
      expect(calculateMaxWeight(sets)).toBe(120);
    });

    it('should handle single set', () => {
      const sets = [createExerciseSet({ weight: 85, reps: 10 })];
      expect(calculateMaxWeight(sets)).toBe(85);
    });

    it('should return 0 for empty array', () => {
      expect(calculateMaxWeight([])).toBe(0);
    });

    it('should handle all same weights', () => {
      const sets = [
        createExerciseSet({ weight: 50, reps: 12 }),
        createExerciseSet({ weight: 50, reps: 10 }),
        createExerciseSet({ weight: 50, reps: 8 }),
      ];
      expect(calculateMaxWeight(sets)).toBe(50);
    });
  });

  describe('calculateOneRepMax', () => {
    it('should estimate 1RM using Epley formula', () => {
      // Epley formula: weight * (1 + reps/30)
      const set = createExerciseSet({ weight: 100, reps: 10 });
      const expected = 100 * (1 + 10 / 30);
      expect(calculateOneRepMax(set)).toBeCloseTo(expected, 1);
    });

    it('should return weight for 1 rep', () => {
      const set = createExerciseSet({ weight: 150, reps: 1 });
      expect(calculateOneRepMax(set)).toBe(150);
    });

    it('should handle heavy weight with low reps', () => {
      const set = createExerciseSet({ weight: 200, reps: 3 });
      const expected = 200 * (1 + 3 / 30);
      expect(calculateOneRepMax(set)).toBeCloseTo(expected, 1);
    });

    it('should handle light weight with high reps', () => {
      const set = createExerciseSet({ weight: 50, reps: 20 });
      const expected = 50 * (1 + 20 / 30);
      expect(calculateOneRepMax(set)).toBeCloseTo(expected, 1);
    });

    it('should round to 1 decimal place', () => {
      const set = createExerciseSet({ weight: 95, reps: 8 });
      const result = calculateOneRepMax(set);
      expect(result.toString()).toMatch(/^\d+\.\d$/);
    });

    it('should return 0 for zero weight', () => {
      const set = createExerciseSet({ weight: 0, reps: 10 });
      expect(calculateOneRepMax(set)).toBe(0);
    });

    it('should return 0 for zero reps', () => {
      const set = createExerciseSet({ weight: 100, reps: 0 });
      expect(calculateOneRepMax(set)).toBe(0);
    });
  });
});

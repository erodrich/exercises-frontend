import { describe, it, expect } from 'vitest';
import {
  formatTimestamp,
  formatExerciseForStorage,
  formatExerciseForDisplay,
  formatVolume,
} from './exerciseFormatter';
import { createExerciseLogEntry, createExerciseSet } from '../../test/factories';

describe('exerciseFormatter', () => {
  describe('formatTimestamp', () => {
    it('should format timestamp in GB locale', () => {
      const date = new Date('2025-12-15T10:30:45Z');
      const formatted = formatTimestamp(date);
      
      // Format: DD/MM/YYYY HH:mm:ss
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
    });

    it('should handle different dates', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const formatted = formatTimestamp(date);
      
      expect(formatted).toContain('2024');
      expect(formatted).toContain('01/01');
    });

    it('should pad single digits', () => {
      const date = new Date('2025-03-05T09:05:03Z');
      const formatted = formatTimestamp(date);
      
      // Should have padded zeros
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
    });
  });

  describe('formatVolume', () => {
    it('should format volume with 1 decimal place', () => {
      expect(formatVolume(123.456)).toBe('123.5');
    });

    it('should format whole numbers', () => {
      expect(formatVolume(100)).toBe('100.0');
    });

    it('should round correctly', () => {
      expect(formatVolume(123.45)).toBe('123.5');
      expect(formatVolume(123.44)).toBe('123.4');
    });

    it('should handle zero', () => {
      expect(formatVolume(0)).toBe('0.0');
    });

    it('should format large numbers', () => {
      expect(formatVolume(9999.99)).toBe('10000.0');
    });

    it('should append kg unit when specified', () => {
      expect(formatVolume(100, true)).toBe('100.0 kg');
    });
  });

  describe('formatExerciseForStorage', () => {
    it('should format entry with GB timestamp', () => {
      const entry = createExerciseLogEntry({
        timestamp: new Date('2025-12-15T10:30:00Z').toISOString(),
        exercise: { group: 'Chest', name: 'Bench Press' },
        sets: [createExerciseSet({ weight: 100, reps: 10 })],
        failure: false,
      });

      const formatted = formatExerciseForStorage(entry);

      expect(formatted.timestamp).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
      expect(formatted.exercise).toEqual(entry.exercise);
      expect(formatted.sets).toEqual(entry.sets);
      expect(formatted.failure).toBe(false);
    });

    it('should preserve all exercise data', () => {
      const entry = createExerciseLogEntry({
        exercise: { group: 'Legs', name: 'Squat' },
        sets: [
          createExerciseSet({ weight: 140, reps: 5 }),
          createExerciseSet({ weight: 140, reps: 5 }),
          createExerciseSet({ weight: 140, reps: 4 }),
        ],
        failure: true,
      });

      const formatted = formatExerciseForStorage(entry);

      expect(formatted.exercise.group).toBe('Legs');
      expect(formatted.exercise.name).toBe('Squat');
      expect(formatted.sets).toHaveLength(3);
      expect(formatted.failure).toBe(true);
    });

    it('should handle invalid timestamp gracefully', () => {
      const entry = createExerciseLogEntry();
      (entry as any).timestamp = 'invalid';

      const formatted = formatExerciseForStorage(entry);
      
      // Should still return something (fallback behavior)
      expect(formatted).toBeDefined();
      expect(formatted.timestamp).toBeDefined();
    });
  });

  describe('formatExerciseForDisplay', () => {
    it('should include formatted volume', () => {
      const entry = createExerciseLogEntry({
        sets: [
          createExerciseSet({ weight: 100, reps: 10 }), // 1000
          createExerciseSet({ weight: 100, reps: 8 }),  // 800
        ],
      });

      const display = formatExerciseForDisplay(entry);

      expect(display.totalVolume).toBe('1800.0 kg');
    });

    it('should include set count', () => {
      const entry = createExerciseLogEntry({
        sets: [
          createExerciseSet(),
          createExerciseSet(),
          createExerciseSet(),
        ],
      });

      const display = formatExerciseForDisplay(entry);

      expect(display.setCount).toBe(3);
    });

    it('should format timestamp for display', () => {
      const entry = createExerciseLogEntry({
        timestamp: new Date('2025-12-15T10:30:00Z').toISOString(),
      });

      const display = formatExerciseForDisplay(entry);

      expect(display.formattedTimestamp).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
    });

    it('should include exercise summary', () => {
      const entry = createExerciseLogEntry({
        exercise: { group: 'Back', name: 'Deadlift' },
      });

      const display = formatExerciseForDisplay(entry);

      expect(display.exerciseSummary).toBe('Back - Deadlift');
    });

    it('should calculate total reps', () => {
      const entry = createExerciseLogEntry({
        sets: [
          createExerciseSet({ weight: 50, reps: 12 }),
          createExerciseSet({ weight: 50, reps: 10 }),
          createExerciseSet({ weight: 50, reps: 8 }),
        ],
      });

      const display = formatExerciseForDisplay(entry);

      expect(display.totalReps).toBe(30);
    });

    it('should include failure status', () => {
      const entry = createExerciseLogEntry({ failure: true });
      const display = formatExerciseForDisplay(entry);

      expect(display.failure).toBe(true);
    });

    it('should include average weight per set', () => {
      const entry = createExerciseLogEntry({
        sets: [
          createExerciseSet({ weight: 100, reps: 10 }),
          createExerciseSet({ weight: 90, reps: 10 }),
          createExerciseSet({ weight: 80, reps: 10 }),
        ],
      });

      const display = formatExerciseForDisplay(entry);

      expect(display.averageWeight).toBe('90.0 kg');
    });

    it('should include max weight', () => {
      const entry = createExerciseLogEntry({
        sets: [
          createExerciseSet({ weight: 100, reps: 10 }),
          createExerciseSet({ weight: 120, reps: 8 }),
          createExerciseSet({ weight: 90, reps: 12 }),
        ],
      });

      const display = formatExerciseForDisplay(entry);

      expect(display.maxWeight).toBe('120.0 kg');
    });
  });
});

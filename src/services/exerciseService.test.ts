import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExerciseService } from './exerciseService';
import type { StorageAdapter } from '../infrastructure/adapters/StorageAdapter';
import type { NotificationAdapter } from '../infrastructure/adapters/NotificationAdapter';
import { createExerciseLogEntry, createEmptyExerciseLogEntry } from '../test/factories';

describe('ExerciseService', () => {
  let service: ExerciseService;
  let mockStorage: StorageAdapter;
  let mockNotifier: NotificationAdapter;

  beforeEach(() => {
    // Create mocks with vi.fn() for tracking calls
    mockStorage = {
      save: vi.fn().mockResolvedValue(undefined),
      load: vi.fn().mockResolvedValue(null),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
      keys: vi.fn().mockResolvedValue([]),
    };

    mockNotifier = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      notify: vi.fn(),
    };

    service = new ExerciseService(mockStorage, mockNotifier);
  });

  describe('saveExercise', () => {
    it('should save valid exercise', async () => {
      const entry = createExerciseLogEntry();

      const result = await service.saveExercise(entry);

      expect(result.success).toBe(true);
      expect(mockStorage.save).toHaveBeenCalled();
    });

    it('should generate unique key for exercise', async () => {
      const entry = createExerciseLogEntry();

      await service.saveExercise(entry);

      expect(mockStorage.save).toHaveBeenCalledWith(
        expect.stringContaining('exercise_'),
        expect.anything()
      );
    });

    it('should format exercise before saving', async () => {
      const entry = createExerciseLogEntry({
        timestamp: new Date('2025-12-15T10:30:00Z').toISOString(),
      });

      await service.saveExercise(entry);

      const savedData = (mockStorage.save as any).mock.calls[0][1];
      // Should have formatted timestamp
      expect(savedData.timestamp).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should reject invalid exercise', async () => {
      const entry = createEmptyExerciseLogEntry();

      const result = await service.saveExercise(entry);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(mockStorage.save).not.toHaveBeenCalled();
    });

    it('should provide validation errors', async () => {
      const entry = createExerciseLogEntry({
        exercise: { group: '', name: '' },
        sets: [],
      });

      const result = await service.saveExercise(entry);

      expect(result.success).toBe(false);
      expect(result.error).toContain('group');
    });

    it('should handle storage errors', async () => {
      const entry = createExerciseLogEntry();
      (mockStorage.save as any).mockRejectedValue(new Error('Storage full'));

      const result = await service.saveExercise(entry);

      expect(result.success).toBe(false);
      expect(result.error).toContain('save');
    });
  });

  describe('loadExercises', () => {
    it('should load all exercises from storage', async () => {
      const exercise1 = createExerciseLogEntry();
      const exercise2 = createExerciseLogEntry();
      
      (mockStorage.keys as any).mockResolvedValue(['exercise_1', 'exercise_2']);
      (mockStorage.load as any)
        .mockResolvedValueOnce(exercise1)
        .mockResolvedValueOnce(exercise2);

      const exercises = await service.loadExercises();

      expect(exercises).toHaveLength(2);
      expect(exercises[0]).toEqual(exercise1);
      expect(exercises[1]).toEqual(exercise2);
    });

    it('should return empty array when no exercises', async () => {
      (mockStorage.keys as any).mockResolvedValue([]);

      const exercises = await service.loadExercises();

      expect(exercises).toEqual([]);
    });

    it('should filter out null values', async () => {
      (mockStorage.keys as any).mockResolvedValue(['exercise_1', 'exercise_2', 'exercise_3']);
      (mockStorage.load as any)
        .mockResolvedValueOnce(createExerciseLogEntry())
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createExerciseLogEntry());

      const exercises = await service.loadExercises();

      expect(exercises).toHaveLength(2);
    });

    it('should only load exercise keys', async () => {
      (mockStorage.keys as any).mockResolvedValue([
        'exercise_1',
        'other_data',
        'exercise_2',
        'settings',
      ]);
      (mockStorage.load as any).mockResolvedValue(createExerciseLogEntry());

      await service.loadExercises();

      expect(mockStorage.load).toHaveBeenCalledTimes(2);
      expect(mockStorage.load).toHaveBeenCalledWith('exercise_1');
      expect(mockStorage.load).toHaveBeenCalledWith('exercise_2');
    });

    it('should handle storage errors gracefully', async () => {
      (mockStorage.keys as any).mockRejectedValue(new Error('Storage error'));

      const exercises = await service.loadExercises();

      expect(exercises).toEqual([]);
    });
  });

  describe('deleteExercise', () => {
    it('should delete exercise by key', async () => {
      const result = await service.deleteExercise('exercise_123');

      expect(result.success).toBe(true);
      expect(mockStorage.remove).toHaveBeenCalledWith('exercise_123');
    });

    it('should handle deletion errors', async () => {
      (mockStorage.remove as any).mockRejectedValue(new Error('Delete failed'));

      const result = await service.deleteExercise('exercise_123');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should succeed when deleting non-existent key', async () => {
      const result = await service.deleteExercise('non_existent');

      expect(result.success).toBe(true);
    });
  });

  describe('clearAllExercises', () => {
    it('should clear all exercise data', async () => {
      (mockStorage.keys as any).mockResolvedValue([
        'exercise_1',
        'exercise_2',
        'other_data',
      ]);

      const result = await service.clearAllExercises();

      expect(result.success).toBe(true);
      expect(mockStorage.remove).toHaveBeenCalledTimes(2);
      expect(mockStorage.remove).toHaveBeenCalledWith('exercise_1');
      expect(mockStorage.remove).toHaveBeenCalledWith('exercise_2');
    });

    it('should not remove non-exercise data', async () => {
      (mockStorage.keys as any).mockResolvedValue([
        'settings',
        'user_profile',
        'exercise_1',
      ]);

      await service.clearAllExercises();

      expect(mockStorage.remove).toHaveBeenCalledTimes(1);
      expect(mockStorage.remove).toHaveBeenCalledWith('exercise_1');
    });

    it('should handle errors during clear', async () => {
      (mockStorage.keys as any).mockRejectedValue(new Error('Clear failed'));

      const result = await service.clearAllExercises();

      expect(result.success).toBe(false);
    });
  });

  describe('getExerciseStats', () => {
    it('should calculate total exercises count', async () => {
      const exercises = [
        createExerciseLogEntry(),
        createExerciseLogEntry(),
        createExerciseLogEntry(),
      ];
      (mockStorage.keys as any).mockResolvedValue(['exercise_1', 'exercise_2', 'exercise_3']);
      (mockStorage.load as any).mockResolvedValue(createExerciseLogEntry());

      const stats = await service.getExerciseStats();

      expect(stats.totalExercises).toBe(3);
    });

    it('should calculate total sets', async () => {
      const exercise1 = createExerciseLogEntry({
        sets: [{ weight: 100, reps: 10 }, { weight: 100, reps: 10 }],
      });
      const exercise2 = createExerciseLogEntry({
        sets: [{ weight: 100, reps: 10 }],
      });
      
      (mockStorage.keys as any).mockResolvedValue(['exercise_1', 'exercise_2']);
      (mockStorage.load as any)
        .mockResolvedValueOnce(exercise1)
        .mockResolvedValueOnce(exercise2);

      const stats = await service.getExerciseStats();

      expect(stats.totalSets).toBe(3);
    });

    it('should calculate total volume', async () => {
      const exercise1 = createExerciseLogEntry({
        sets: [
          { weight: 100, reps: 10 }, // 1000
          { weight: 100, reps: 8 },  // 800
        ],
      });
      const exercise2 = createExerciseLogEntry({
        sets: [{ weight: 50, reps: 12 }], // 600
      });
      
      (mockStorage.keys as any).mockResolvedValue(['exercise_1', 'exercise_2']);
      (mockStorage.load as any)
        .mockResolvedValueOnce(exercise1)
        .mockResolvedValueOnce(exercise2);

      const stats = await service.getExerciseStats();

      expect(stats.totalVolume).toBe(2400);
    });

    it('should return zero stats when no exercises', async () => {
      (mockStorage.keys as any).mockResolvedValue([]);

      const stats = await service.getExerciseStats();

      expect(stats.totalExercises).toBe(0);
      expect(stats.totalSets).toBe(0);
      expect(stats.totalVolume).toBe(0);
    });
  });
});

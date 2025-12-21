/**
 * Tests for Public Exercise Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpPublicExerciseService } from './publicExerciseService';

describe('HttpPublicExerciseService', () => {
  let service: HttpPublicExerciseService;
  const baseUrl = 'http://localhost:8080';

  beforeEach(() => {
    service = new HttpPublicExerciseService(baseUrl);
    vi.clearAllMocks();
  });

  describe('getAllExercises', () => {
    it('should fetch all exercises successfully', async () => {
      const mockExercises = [
        { id: 1, name: 'Bench Press', group: 'CHEST' },
        { id: 2, name: 'Squat', group: 'LEGS' },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockExercises,
      });

      const result = await service.getAllExercises();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockExercises);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/exercises`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle HTTP errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.getAllExercises();

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.getAllExercises();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getExerciseById', () => {
    it('should fetch exercise by ID successfully', async () => {
      const mockExercise = { id: 1, name: 'Bench Press', group: 'CHEST' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockExercise,
      });

      const result = await service.getExerciseById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockExercise);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/exercises/1`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle 404 errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await service.getExerciseById(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Exercise not found');
    });

    it('should handle other HTTP errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.getExerciseById(1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection failed'));

      const result = await service.getExerciseById(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });
});

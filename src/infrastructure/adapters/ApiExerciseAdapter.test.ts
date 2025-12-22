import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiExerciseAdapter } from './ApiExerciseAdapter';

// Mock httpClient
vi.mock('../http/httpClient', () => ({
  httpClient: vi.fn(),
}));

// Mock API config
vi.mock('../../config/api', () => ({
  getEndpoint: (path: string) => `/exercise-logging${path}`,
  default: {
    baseURL: '/exercise-logging',
  },
}));

import { httpClient } from '../http/httpClient';

describe('ApiExerciseAdapter - getLatestLog', () => {
  let adapter: ApiExerciseAdapter;
  let mockHttpClient: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new ApiExerciseAdapter();
    mockHttpClient = httpClient as ReturnType<typeof vi.fn>;
    mockHttpClient.mockReset();
  });

  it('should fetch latest log successfully', async () => {
    const userId = '1';
    const exerciseId = 5;

    const mockApiResponse = {
      timestamp: '22/12/2025 14:30:00',
      exercise: {
        group: 'CHEST',
        name: 'Bench Press',
      },
      sets: [
        { weight: 60, reps: 10 },
        { weight: 60, reps: 8 },
      ],
      failure: false,
    };

    mockHttpClient.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    });

    const result = await adapter.getLatestLog(userId, exerciseId);

    expect(result.success).toBe(true);
    expect(result.data).not.toBeNull();
    expect(result.data?.timestamp).toBe('22/12/2025 14:30:00');
    expect(result.data?.exercise.name).toBe('Bench Press');
    expect(result.data?.sets).toHaveLength(2);
    expect(result.data?.sets[0].weight).toBe(60);
    expect(result.data?.sets[0].reps).toBe(10);
    expect(result.data?.failure).toBe(false);

    // Verify correct API call
    expect(mockHttpClient).toHaveBeenCalledWith(
      '/exercise-logging/api/v1/users/1/logs/latest?exerciseId=5',
      {
        method: 'GET',
        requiresAuth: true,
      }
    );
  });

  it('should return null when no logs found (404)', async () => {
    const userId = '1';
    const exerciseId = 5;

    mockHttpClient.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await adapter.getLatestLog(userId, exerciseId);

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it('should handle server errors', async () => {
    const userId = '1';
    const exerciseId = 5;

    mockHttpClient.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await adapter.getLatestLog(userId, exerciseId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to fetch latest log: 500');
  });

  it('should handle network errors', async () => {
    const userId = '1';
    const exerciseId = 5;

    mockHttpClient.mockRejectedValueOnce(new Error('Network error'));

    const result = await adapter.getLatestLog(userId, exerciseId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });

  it('should handle log with failure flag', async () => {
    const userId = '1';
    const exerciseId = 5;

    const mockApiResponse = {
      timestamp: '22/12/2025 14:30:00',
      exercise: {
        group: 'LEGS',
        name: 'Squat',
      },
      sets: [
        { weight: 100, reps: 5 },
      ],
      failure: true,
    };

    mockHttpClient.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    });

    const result = await adapter.getLatestLog(userId, exerciseId);

    expect(result.success).toBe(true);
    expect(result.data?.failure).toBe(true);
  });

  it('should handle log with multiple sets', async () => {
    const userId = '1';
    const exerciseId = 5;

    const mockApiResponse = {
      timestamp: '22/12/2025 14:30:00',
      exercise: {
        group: 'BACK',
        name: 'Deadlift',
      },
      sets: [
        { weight: 100, reps: 10 },
        { weight: 110, reps: 8 },
        { weight: 120, reps: 6 },
        { weight: 130, reps: 4 },
      ],
      failure: false,
    };

    mockHttpClient.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    });

    const result = await adapter.getLatestLog(userId, exerciseId);

    expect(result.success).toBe(true);
    expect(result.data?.sets).toHaveLength(4);
    expect(result.data?.sets[0].weight).toBe(100);
    expect(result.data?.sets[3].weight).toBe(130);
  });

  it('should handle log with empty sets array', async () => {
    const userId = '1';
    const exerciseId = 5;

    const mockApiResponse = {
      timestamp: '22/12/2025 14:30:00',
      exercise: {
        group: 'CHEST',
        name: 'Bench Press',
      },
      sets: [],
      failure: false,
    };

    mockHttpClient.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    });

    const result = await adapter.getLatestLog(userId, exerciseId);

    expect(result.success).toBe(true);
    expect(result.data?.sets).toHaveLength(0);
  });

  it('should use correct endpoint format', async () => {
    const userId = '123';
    const exerciseId = 456;

    mockHttpClient.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await adapter.getLatestLog(userId, exerciseId);

    expect(mockHttpClient).toHaveBeenCalledWith(
      '/exercise-logging/api/v1/users/123/logs/latest?exerciseId=456',
      expect.any(Object)
    );
  });
});

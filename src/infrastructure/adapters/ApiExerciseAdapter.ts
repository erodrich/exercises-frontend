import type { ExerciseLogEntry, Result } from '../../domain/models';
import { httpClient } from '../http/httpClient';
import { getEndpoint } from '../../config/api';

/**
 * Backend API Exercise Log DTO structure
 */
interface ApiExerciseLogDTO {
  timestamp: string;
  exercise: {
    group: string;
    name: string;
  };
  sets: Array<{
    weight: number;
    reps: number;
  }>;
  failure: boolean;
}

/**
 * API Exercise Adapter
 * Connects to real backend API for exercise logging
 */
export class ApiExerciseAdapter {
  /**
   * Save exercise logs to backend
   * Backend expects array but we'll send single exercise
   */
  async saveExercise(userId: string, entry: ExerciseLogEntry): Promise<Result<void>> {
    try {
      // Convert to backend format with ISO 8601 timestamp
      const apiLog: ApiExerciseLogDTO = {
        timestamp: new Date(entry.timestamp).toISOString(),
        exercise: {
          group: entry.exercise.group,
          name: entry.exercise.name,
        },
        sets: entry.sets.map(set => ({
          weight: set.weight,
          reps: set.reps,
        })),
        failure: entry.failure,
      };

      // Backend expects array of logs
      const response = await httpClient(
        getEndpoint(`/api/v1/users/${userId}/logs`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([apiLog]),
          requiresAuth: true,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save exercise' }));
        return {
          success: false,
          error: errorData.message || `Failed to save exercise: ${response.status}`,
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save exercise: ${error instanceof Error ? error.message : 'Network error'}`,
      };
    }
  }

  /**
   * Load all exercise logs from backend
   */
  async loadExercises(userId: string): Promise<ExerciseLogEntry[]> {
    try {
      const response = await httpClient(
        getEndpoint(`/api/v1/users/${userId}/logs`),
        {
          method: 'GET',
          requiresAuth: true,
        }
      );

      if (!response.ok) {
        console.error('Failed to load exercises:', response.status);
        return [];
      }

      const apiLogs: ApiExerciseLogDTO[] = await response.json();

      // Convert from backend format to frontend format
      return apiLogs.map(log => ({
        timestamp: log.timestamp,
        exercise: {
          group: log.exercise.group,
          name: log.exercise.name,
        },
        sets: log.sets.map(set => ({
          weight: set.weight,
          reps: set.reps,
        })),
        failure: log.failure,
      }));
    } catch (error) {
      console.error('Failed to load exercises:', error);
      return [];
    }
  }

  /**
   * Delete exercise (not implemented in backend yet)
   * For now, this is a no-op
   */
  async deleteExercise(exerciseId: string): Promise<Result<void>> {
    console.warn('Delete exercise not yet implemented in backend');
    return {
      success: false,
      error: 'Delete functionality not yet implemented',
    };
  }

  /**
   * Clear all exercises (not implemented in backend yet)
   * For now, this is a no-op
   */
  async clearAllExercises(): Promise<Result<void>> {
    console.warn('Clear all exercises not yet implemented in backend');
    return {
      success: false,
      error: 'Clear all functionality not yet implemented',
    };
  }
}

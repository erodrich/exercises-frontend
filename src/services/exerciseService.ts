import type { ExerciseLogEntry, Result, User } from '../domain/models';
import type { StorageAdapter } from '../infrastructure/adapters/StorageAdapter';
import type { NotificationAdapter } from '../infrastructure/adapters/NotificationAdapter';
import { ApiExerciseAdapter } from '../infrastructure/adapters/ApiExerciseAdapter';
import { validateExercise } from '../domain/validators/exerciseValidator';
import { formatExerciseForStorage } from '../domain/formatters/exerciseFormatter';
import { calculateTotalVolume } from '../domain/calculators/volumeCalculator';

/**
 * Exercise statistics
 */
export interface ExerciseStats {
  totalExercises: number;
  totalSets: number;
  totalVolume: number;
}

/**
 * Exercise Service
 * Orchestrates domain logic with infrastructure (storage, notifications)
 * Uses dependency injection for testability
 */
export class ExerciseService {
  private readonly EXERCISE_KEY_PREFIX = 'exercise_';
  private readonly storage: StorageAdapter;
  // @ts-expect-error - notifier will be used for future notifications
  private readonly notifier: NotificationAdapter;
  private readonly apiAdapter: ApiExerciseAdapter;
  private readonly useApi: boolean;
  private currentUser: User | null = null;

  constructor(
    storage: StorageAdapter,
    notifier: NotificationAdapter,
    useApi: boolean = false
  ) {
    this.storage = storage;
    this.notifier = notifier;
    this.apiAdapter = new ApiExerciseAdapter();
    this.useApi = useApi;
  }

  /**
   * Set current user for API calls
   */
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  /**
   * Save an exercise to storage or API
   */
  async saveExercise(entry: ExerciseLogEntry): Promise<Result<void>> {
    try {
      // Validate
      const validation = validateExercise(entry);
      if (!validation.valid) {
        const errorMessage = validation.errors.map(e => e.message).join(', ');
        return {
          success: false,
          error: `Validation failed: ${errorMessage}`,
        };
      }

      // Use API if enabled and user is authenticated
      if (this.useApi && this.currentUser) {
        return await this.apiAdapter.saveExercise(this.currentUser.id, entry);
      }

      // Otherwise use localStorage
      const formatted = formatExerciseForStorage(entry);
      const key = `${this.EXERCISE_KEY_PREFIX}${Date.now()}`;
      await this.storage.save(key, formatted);

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save exercise: ${error}`,
      };
    }
  }

  /**
   * Load all exercises from storage or API
   */
  async loadExercises(): Promise<ExerciseLogEntry[]> {
    try {
      // Use API if enabled and user is authenticated
      if (this.useApi && this.currentUser) {
        return await this.apiAdapter.loadExercises(this.currentUser.id);
      }

      // Otherwise use localStorage
      const allKeys = await this.storage.keys();
      const exerciseKeys = allKeys.filter(key => 
        key.startsWith(this.EXERCISE_KEY_PREFIX)
      );

      const exercises = await Promise.all(
        exerciseKeys.map(key => this.storage.load<ExerciseLogEntry>(key))
      );

      return exercises.filter((ex): ex is ExerciseLogEntry => ex !== null);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      return [];
    }
  }

  /**
   * Delete an exercise by key
   */
  async deleteExercise(key: string): Promise<Result<void>> {
    try {
      await this.storage.remove(key);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete exercise: ${error}`,
      };
    }
  }

  /**
   * Clear all exercises from storage
   */
  async clearAllExercises(): Promise<Result<void>> {
    try {
      const allKeys = await this.storage.keys();
      const exerciseKeys = allKeys.filter(key => 
        key.startsWith(this.EXERCISE_KEY_PREFIX)
      );

      // Delete all exercise entries
      await Promise.all(
        exerciseKeys.map(key => this.storage.remove(key))
      );

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: `Failed to clear exercises: ${error}`,
      };
    }
  }

  /**
   * Get exercise statistics
   */
  async getExerciseStats(): Promise<ExerciseStats> {
    const exercises = await this.loadExercises();

    return {
      totalExercises: exercises.length,
      totalSets: exercises.reduce((sum, ex) => sum + ex.sets.length, 0),
      totalVolume: exercises.reduce(
        (sum, ex) => sum + calculateTotalVolume(ex.sets),
        0
      ),
    };
  }

  /**
   * Get latest log for a specific exercise
   * Only works with API mode and authenticated user
   */
  async getLatestLog(exerciseId: number): Promise<Result<ExerciseLogEntry | null>> {
    try {
      // API mode required
      if (!this.useApi) {
        return {
          success: false,
          error: 'API mode required for fetching latest log',
        };
      }

      // User authentication required
      if (!this.currentUser) {
        return {
          success: false,
          error: 'User authentication required',
        };
      }

      return await this.apiAdapter.getLatestLog(this.currentUser.id, exerciseId);
    } catch (error) {
      return {
        success: false,
        error: `Failed to get latest log: ${error}`,
      };
    }
  }
}

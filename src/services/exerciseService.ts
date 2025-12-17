import type { ExerciseLogEntry, Result } from '../domain/models';
import type { StorageAdapter } from '../infrastructure/adapters/StorageAdapter';
import type { NotificationAdapter } from '../infrastructure/adapters/NotificationAdapter';
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

  constructor(
    storage: StorageAdapter,
    notifier: NotificationAdapter
  ) {
    this.storage = storage;
    this.notifier = notifier;
  }

  /**
   * Save an exercise to storage
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

      // Format for storage
      const formatted = formatExerciseForStorage(entry);

      // Generate unique key
      const key = `${this.EXERCISE_KEY_PREFIX}${Date.now()}`;

      // Save to storage
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
   * Load all exercises from storage
   */
  async loadExercises(): Promise<ExerciseLogEntry[]> {
    try {
      // Get all exercise keys
      const allKeys = await this.storage.keys();
      const exerciseKeys = allKeys.filter(key => 
        key.startsWith(this.EXERCISE_KEY_PREFIX)
      );

      // Load all exercises
      const exercises = await Promise.all(
        exerciseKeys.map(key => this.storage.load<ExerciseLogEntry>(key))
      );

      // Filter out null values
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
}

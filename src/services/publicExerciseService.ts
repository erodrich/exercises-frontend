/**
 * Public Exercise Service
 * Handles fetching exercises from the public API endpoint
 */

import type { Result } from '../domain/models';

export interface ExerciseDTO {
  id: number;
  name: string;
  group: string;
}

/**
 * HTTP-based public exercise service
 */
export class HttpPublicExerciseService {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all exercises (public endpoint)
   */
  async getAllExercises(): Promise<Result<ExerciseDTO[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/exercises`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch exercises: ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get exercise by ID (public endpoint)
   */
  async getExerciseById(id: number): Promise<Result<ExerciseDTO>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/exercises/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Exercise not found' };
        }
        return {
          success: false,
          error: `Failed to fetch exercise: ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

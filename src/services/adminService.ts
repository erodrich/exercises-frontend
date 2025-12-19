/**
 * Admin Service
 * Handles admin operations for master data management
 */

import type { Exercise, Result } from '../domain/models';

export interface ExerciseWithId extends Exercise {
  id: string;
}

export interface AdminService {
  getAllExercises(): Promise<Result<ExerciseWithId[]>>;
  getExerciseById(id: string): Promise<Result<ExerciseWithId>>;
  createExercise(exercise: Exercise): Promise<Result<ExerciseWithId>>;
  updateExercise(id: string, exercise: Exercise): Promise<Result<ExerciseWithId>>;
  deleteExercise(id: string): Promise<Result<void>>;
}

/**
 * HTTP-based admin service for managing exercises
 */
export class HttpAdminService implements AdminService {
  private readonly baseUrl: string;
  private readonly getToken: () => string | null;
  
  constructor(baseUrl: string, getToken: () => string | null) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  private async fetchWithAuth<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<Result<T>> {
    const opts = options || {};
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'No authentication token' };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...opts.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          return { success: false, error: 'Access denied. Admin role required.' };
        }
        if (response.status === 404) {
          return { success: false, error: 'Exercise not found' };
        }
        return { success: false, error: `Server error: ${response.status}` };
      }

      // For DELETE operations, return void
      if (response.status === 204) {
        return { success: true, data: undefined as T };
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

  async getAllExercises(): Promise<Result<ExerciseWithId[]>> {
    return this.fetchWithAuth<ExerciseWithId[]>('/api/v1/admin/exercises');
  }

  async getExerciseById(id: string): Promise<Result<ExerciseWithId>> {
    return this.fetchWithAuth<ExerciseWithId>(`/api/v1/admin/exercises/${id}`);
  }

  async createExercise(exercise: Exercise): Promise<Result<ExerciseWithId>> {
    return this.fetchWithAuth<ExerciseWithId>('/api/v1/admin/exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    });
  }

  async updateExercise(
    id: string,
    exercise: Exercise
  ): Promise<Result<ExerciseWithId>> {
    return this.fetchWithAuth<ExerciseWithId>(`/api/v1/admin/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(exercise),
    });
  }

  async deleteExercise(id: string): Promise<Result<void>> {
    return this.fetchWithAuth<void>(`/api/v1/admin/exercises/${id}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Mock admin service for development/testing
 */
export class MockAdminService implements AdminService {
  private exercises: ExerciseWithId[] = [
    { id: '1', name: 'Bench Press', group: 'CHEST' },
    { id: '2', name: 'Squat', group: 'LEGS' },
    { id: '3', name: 'Deadlift', group: 'BACK' },
  ];
  private nextId = 4;

  async getAllExercises(): Promise<Result<ExerciseWithId[]>> {
    return { success: true, data: [...this.exercises] };
  }

  async getExerciseById(id: string): Promise<Result<ExerciseWithId>> {
    const exercise = this.exercises.find((e) => e.id === id);
    if (!exercise) {
      return { success: false, error: 'Exercise not found' };
    }
    return { success: true, data: exercise };
  }

  async createExercise(exercise: Exercise): Promise<Result<ExerciseWithId>> {
    const newExercise: ExerciseWithId = {
      ...exercise,
      id: String(this.nextId++),
    };
    this.exercises.push(newExercise);
    return { success: true, data: newExercise };
  }

  async updateExercise(
    id: string,
    exercise: Exercise
  ): Promise<Result<ExerciseWithId>> {
    const index = this.exercises.findIndex((e) => e.id === id);
    if (index === -1) {
      return { success: false, error: 'Exercise not found' };
    }
    const updated = { ...exercise, id };
    this.exercises[index] = updated;
    return { success: true, data: updated };
  }

  async deleteExercise(id: string): Promise<Result<void>> {
    const index = this.exercises.findIndex((e) => e.id === id);
    if (index === -1) {
      return { success: false, error: 'Exercise not found' };
    }
    this.exercises.splice(index, 1);
    return { success: true, data: undefined };
  }
}

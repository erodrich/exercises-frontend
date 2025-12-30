/**
 * Workout Plan Service
 * Handles workout plan operations
 */

import type { WorkoutPlan, Result } from '../domain/models';

export interface WorkoutPlanService {
  getAllWorkoutPlans(userId: string): Promise<Result<WorkoutPlan[]>>;
  getWorkoutPlanById(userId: string, id: string): Promise<Result<WorkoutPlan>>;
  createWorkoutPlan(userId: string, plan: WorkoutPlan): Promise<Result<WorkoutPlan>>;
  updateWorkoutPlan(userId: string, id: string, plan: WorkoutPlan): Promise<Result<WorkoutPlan>>;
  deleteWorkoutPlan(userId: string, id: string): Promise<Result<void>>;
}

/**
 * HTTP-based workout plan service
 */
export class HttpWorkoutPlanService implements WorkoutPlanService {
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
          return { success: false, error: 'Access denied' };
        }
        if (response.status === 404) {
          return { success: false, error: 'Workout plan not found' };
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

  async getAllWorkoutPlans(userId: string): Promise<Result<WorkoutPlan[]>> {
    return this.fetchWithAuth<WorkoutPlan[]>(`/api/v1/users/${userId}/workout-plans`);
  }

  async getWorkoutPlanById(userId: string, id: string): Promise<Result<WorkoutPlan>> {
    return this.fetchWithAuth<WorkoutPlan>(`/api/v1/users/${userId}/workout-plans/${id}`);
  }

  async createWorkoutPlan(userId: string, plan: WorkoutPlan): Promise<Result<WorkoutPlan>> {
    return this.fetchWithAuth<WorkoutPlan>(`/api/v1/users/${userId}/workout-plans`, {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async updateWorkoutPlan(
    userId: string,
    id: string,
    plan: WorkoutPlan
  ): Promise<Result<WorkoutPlan>> {
    return this.fetchWithAuth<WorkoutPlan>(`/api/v1/users/${userId}/workout-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    });
  }

  async deleteWorkoutPlan(userId: string, id: string): Promise<Result<void>> {
    return this.fetchWithAuth<void>(`/api/v1/users/${userId}/workout-plans/${id}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Workout Plan Service Configuration
 */

import { HttpWorkoutPlanService } from '../services/workoutPlanService';
import type { WorkoutPlanService } from '../services/workoutPlanService';
import API_CONFIG from './api';

/**
 * Create and export the workout plan service instance
 */
export const createWorkoutPlanService = (): WorkoutPlanService => {
  console.log('🌐 Using HTTP Workout Plan Service (Backend API)', API_CONFIG.baseURL);
  return new HttpWorkoutPlanService(API_CONFIG.baseURL, () => {
    return localStorage.getItem('auth_token');
  });
};

// Export singleton instance
export const workoutPlanService = createWorkoutPlanService();

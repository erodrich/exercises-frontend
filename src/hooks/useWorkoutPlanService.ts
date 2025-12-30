/**
 * Custom hook to provide workout plan service
 */

import type { WorkoutPlanService } from '../services/workoutPlanService';
import { workoutPlanService } from '../config/workoutPlan';

export function useWorkoutPlanService(): WorkoutPlanService {
  return workoutPlanService;
}

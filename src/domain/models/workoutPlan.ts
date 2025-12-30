/**
 * Workout Plan Domain Models
 * Pure TypeScript interfaces representing workout plans
 */

export enum DurationUnit {
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS'
}

export interface ExerciseTarget {
  id?: string;
  exercise: {
    id: string;
    name: string;
    group: string;
  };
  sets: number;
  minReps: number;
  maxReps: number;
}

export interface WorkoutDay {
  id?: string;
  description: string;
  workoutPlanId?: string;
  exercises: ExerciseTarget[];
}

export interface WorkoutPlan {
  id?: string;
  name: string;
  duration: number;
  durationUnit: DurationUnit;
  isActive: boolean;
  workoutDayDTOList: WorkoutDay[];
}

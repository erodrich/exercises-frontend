/**
 * Custom Hooks
 * Export all custom hooks
 */

export * from './useExerciseForm';
export * from './useExerciseService';
export * from './useNotification';
export * from './useNavigation';
export * from './useAuth';
export * from './useAuthService';
export * from './useAdminService';
export * from './useMuscleGroupService';
export * from './useAdminMuscleGroupService';

// Re-export types from services
export type { ExerciseWithId } from '../services/adminService';

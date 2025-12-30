/**
 * Hook for accessing the Public Exercise Service
 * Used for fetching exercises without authentication (public endpoint)
 */

import { publicExerciseService } from '../config/publicExercise';
import type { HttpPublicExerciseService } from '../services/publicExerciseService';

export function usePublicExerciseService(): HttpPublicExerciseService {
  return publicExerciseService;
}

import { useEffect } from 'react';
import { exerciseService } from '../config/exercise';
import { useAuth } from './useAuth';
import type { ExerciseService } from '../services/exerciseService';

/**
 * Hook for accessing the ExerciseService
 * Automatically syncs current user with the service for API calls
 */
export function useExerciseService(): ExerciseService {
  const { user } = useAuth();

  // Update current user whenever it changes
  useEffect(() => {
    exerciseService.setCurrentUser(user);
  }, [user]);

  return exerciseService;
}

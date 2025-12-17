import { useMemo } from 'react';
import { ExerciseService } from '../services/exerciseService';
import { LocalStorageAdapter } from '../infrastructure/storage/localStorageAdapter';
import { useNotification } from './useNotification';

/**
 * Hook for accessing the ExerciseService with proper dependencies
 * Creates service instance with real adapters
 */
export function useExerciseService(): ExerciseService {
  const notifier = useNotification();

  return useMemo(() => {
    const storage = new LocalStorageAdapter();
    return new ExerciseService(storage, notifier);
  }, [notifier]);
}

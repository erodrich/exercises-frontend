import { useState, useCallback } from 'react';
import type { ExerciseLogEntry } from '../domain/models';
import type { ExerciseService } from '../services/exerciseService';

/**
 * Custom hook for managing exercise form state
 * Encapsulates form logic and service interactions
 */
export function useExerciseForm(
  service: ExerciseService,
  initialEntry: ExerciseLogEntry,
  onSuccess?: () => void
) {
  const [entry, setEntry] = useState<ExerciseLogEntry>(initialEntry);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const updateEntry = useCallback((updates: Partial<ExerciseLogEntry>) => {
    setEntry(prev => ({ ...prev, ...updates }));
    setErrors([]); // Clear errors when user makes changes
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setErrors([]);

    try {
      const result = await service.saveExercise(entry);

      if (!result.success) {
        setErrors([result.error]);
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setErrors([`Unexpected error: ${error}`]);
      setIsSubmitting(false);
    }
  }, [entry, service, onSuccess]);

  const resetForm = useCallback(() => {
    setEntry(initialEntry);
    setErrors([]);
    setIsSubmitting(false);
  }, [initialEntry]);

  return {
    entry,
    updateEntry,
    handleSubmit,
    resetForm,
    isSubmitting,
    errors,
  };
}

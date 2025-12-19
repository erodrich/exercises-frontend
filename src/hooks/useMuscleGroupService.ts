/**
 * useMuscleGroupService Hook
 * Provides access to public muscle group service
 */

import { useMemo } from 'react';
import { HttpMuscleGroupService, MockMuscleGroupService } from '../services/muscleGroupService';
import type { MuscleGroupService } from '../services/muscleGroupService';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function useMuscleGroupService(): MuscleGroupService {
  const service = useMemo(() => {
    if (USE_MOCK) {
      return new MockMuscleGroupService();
    }
    return new HttpMuscleGroupService();
  }, []);

  return service;
}

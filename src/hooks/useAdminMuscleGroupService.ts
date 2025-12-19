/**
 * useAdminMuscleGroupService Hook
 * Provides access to admin muscle group service
 */

import { useMemo } from 'react';
import { HttpAdminMuscleGroupService, MockAdminMuscleGroupService } from '../services/adminMuscleGroupService';
import type { AdminMuscleGroupService } from '../services/adminMuscleGroupService';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useAdminMuscleGroupService(): AdminMuscleGroupService {
  const service = useMemo(() => {
    if (USE_MOCK) {
      return new MockAdminMuscleGroupService();
    }
    return new HttpAdminMuscleGroupService(
      API_URL,
      () => {
        // Get token from localStorage (same as adminService)
        return localStorage.getItem('auth_token') || localStorage.getItem('mock_auth_token');
      }
    );
  }, []);

  return service;
}

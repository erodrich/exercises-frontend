/**
 * Exercise Service Configuration
 * Controls whether exercise logging uses API or localStorage
 */

import { ExerciseService } from '../services/exerciseService';
import { LocalStorageAdapter } from '../infrastructure/storage/localStorageAdapter';
import { ConsoleNotificationAdapter } from '../infrastructure/notifications/consoleNotificationAdapter';

// Use API mode if mock auth is disabled (same as auth service)
const USE_API = import.meta.env.VITE_USE_MOCK_AUTH !== 'true';

/**
 * Create and export the exercise service instance
 * Uses API if VITE_USE_MOCK_AUTH=false, otherwise uses localStorage
 */
export const createExerciseService = (): ExerciseService => {
  const storage = new LocalStorageAdapter();
  const notifier = new ConsoleNotificationAdapter();
  
  if (USE_API) {
    console.log('🌐 Using API Exercise Logging (Backend)');
    return new ExerciseService(storage, notifier, true);
  } else {
    console.log('🧪 Using Mock Exercise Logging (localStorage)');
    return new ExerciseService(storage, notifier, false);
  }
};

// Export singleton instance
export const exerciseService = createExerciseService();

// Export for testing
export { USE_API };

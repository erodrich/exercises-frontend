import { useMemo } from 'react';
import type { NotificationAdapter } from '../infrastructure/adapters/NotificationAdapter';
import { SimpleNotificationAdapter } from '../infrastructure/notifications/simpleNotificationAdapter';

/**
 * Hook for accessing notification functionality
 * Returns a NotificationAdapter instance
 */
export function useNotification(): NotificationAdapter {
  return useMemo(() => new SimpleNotificationAdapter(), []);
}

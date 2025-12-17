import type { NotificationAdapter, NotificationType } from '../adapters/NotificationAdapter';

/**
 * Simple notification adapter using window.alert
 * Can be replaced with toast library later
 */
export class SimpleNotificationAdapter implements NotificationAdapter {
  success(message: string): void {
    this.notify('success', message);
  }

  error(message: string): void {
    this.notify('error', message);
  }

  info(message: string): void {
    this.notify('info', message);
  }

  warning(message: string): void {
    this.notify('warning', message);
  }

  notify(type: NotificationType, message: string): void {
    // For now, use alert with prefix
    // TODO: Replace with proper toast notification library
    const prefix = type.toUpperCase();
    alert(`${prefix}: ${message}`);
  }
}

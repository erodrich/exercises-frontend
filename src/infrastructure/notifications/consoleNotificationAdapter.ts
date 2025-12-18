import type { NotificationAdapter, NotificationType } from '../adapters/NotificationAdapter';

/**
 * Console notification adapter for development/testing
 * Logs notifications to console instead of displaying alerts
 */
export class ConsoleNotificationAdapter implements NotificationAdapter {
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
    const emoji = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️',
    }[type];

    const method = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log';
    console[method](`${emoji} [${type.toUpperCase()}]`, message);
  }
}

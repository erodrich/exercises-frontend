/**
 * Notification Adapter Interface
 * Abstraction over notification implementations (alerts, toasts, modals, etc.)
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationAdapter {
  /**
   * Show a success message
   */
  success(message: string): void;

  /**
   * Show an error message
   */
  error(message: string): void;

  /**
   * Show an info message
   */
  info(message: string): void;

  /**
   * Show a warning message
   */
  warning(message: string): void;

  /**
   * Show a generic notification
   */
  notify(type: NotificationType, message: string): void;
}

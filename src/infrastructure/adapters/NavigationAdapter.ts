/**
 * Navigation Adapter Interface
 * Abstraction over navigation/routing implementations
 */

export interface NavigationAdapter {
  /**
   * Navigate back to previous screen
   */
  goBack(): void;

  /**
   * Navigate to a specific route/screen
   */
  navigateTo(route: string): void;

  /**
   * Get current route/screen
   */
  getCurrentRoute(): string;
}

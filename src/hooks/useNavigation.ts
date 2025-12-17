import type { NavigationAdapter } from '../infrastructure/adapters/NavigationAdapter';

/**
 * Hook for accessing navigation functionality
 * Takes navigation callbacks from parent (App component)
 */
export function useNavigation(
  onNavigateBack?: () => void,
  onNavigateTo?: (route: string) => void
): NavigationAdapter {
  return {
    goBack: () => {
      if (onNavigateBack) {
        onNavigateBack();
      }
    },
    navigateTo: (route: string) => {
      if (onNavigateTo) {
        onNavigateTo(route);
      }
    },
    getCurrentRoute: () => {
      // Simple implementation - could be enhanced
      return window.location.pathname;
    },
  };
}

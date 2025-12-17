import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';

/**
 * Custom render function that wraps components with common providers
 * Extend this as you add Context providers, Router, etc.
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    // Add your providers here as needed
    // Example: <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>
    return <>{children}</>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

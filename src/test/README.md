# Testing Setup

This directory contains the test infrastructure and utilities for the Exercise Tracker application.

## Setup Complete ✅

- **Vitest** - Fast, Vite-native test runner
- **React Testing Library** - Component testing utilities
- **Jest-DOM matchers** - Extended assertions for DOM elements
- **User Event** - Realistic user interaction simulation

## Running Tests

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## File Structure

```
src/test/
├── README.md          # This file
├── setup.ts           # Global test setup and mocks
├── setup.test.ts      # Tests for setup configuration
├── test-utils.tsx     # Custom render functions and utilities
├── factories.ts       # Test data factories
└── factories.test.ts  # Tests for factories
```

## Key Features

### Global Mocks

The following are mocked globally in `setup.ts`:

- ✅ `window.matchMedia` - For responsive design tests
- ✅ `localStorage` - In-memory implementation
- ✅ `navigator.clipboard` - Mock clipboard API
- ✅ `window.alert` - Prevents actual alerts during tests
- ✅ Console methods - Reduces test noise

### Test Utilities

**Custom Render Function** (`test-utils.tsx`):
```typescript
import { render, screen } from '../test/test-utils';

// Automatically wraps components with providers
render(<MyComponent />);
```

**Test Data Factories** (`factories.ts`):
```typescript
import { createExerciseLogEntry, createExercise } from '../test/factories';

// Create valid test data with defaults
const entry = createExerciseLogEntry();

// Override specific fields
const customEntry = createExerciseLogEntry({
  exercise: createExercise({ name: 'Squat' }),
  failure: true,
});
```

## Writing Tests

### Component Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<MyComponent onClick={onClick} />);
    
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Pure Function Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction(1, 2)).toBe(3);
  });

  it('should handle edge cases', () => {
    expect(myFunction(0, 0)).toBe(0);
  });
});
```

## Best Practices

1. **Arrange-Act-Assert Pattern**
   ```typescript
   // Arrange: Set up test data
   const user = userEvent.setup();
   render(<Component />);
   
   // Act: Perform action
   await user.click(screen.getByRole('button'));
   
   // Assert: Verify outcome
   expect(mockFn).toHaveBeenCalled();
   ```

2. **Use Semantic Queries**
   - Prefer `getByRole`, `getByLabelText`, `getByText`
   - Avoid `getByTestId` unless necessary
   - Test from the user's perspective

3. **Async Operations**
   ```typescript
   // Use async/await with user-event
   await user.type(input, 'text');
   
   // Wait for elements to appear
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

4. **Mock Functions**
   ```typescript
   const mockFn = vi.fn();
   mockFn.mockReturnValue(42);
   mockFn.mockResolvedValue(Promise.resolve('data'));
   ```

5. **Cleanup**
   - Automatic cleanup after each test
   - Clear mocks when needed: `vi.clearAllMocks()`
   - Reset localStorage: `localStorage.clear()`

## Coverage Goals

- **Unit Tests**: 80%+ for domain logic
- **Component Tests**: 70%+ for UI components
- **Integration Tests**: Critical user flows

## Troubleshooting

### Tests are slow
- Use `test:run` for single run (no watch mode)
- Check for unnecessary `waitFor` usage
- Consider splitting large test files

### Mock not working
- Verify mock is in `setup.ts` for global mocks
- Use `vi.mock()` for module-specific mocks
- Check mock is defined before test runs

### Flaky tests
- Avoid `setTimeout` - use `waitFor` instead
- Ensure proper cleanup between tests
- Check for race conditions with async operations

## Next Steps

See the main refactor plan checklist for:
- Phase 2: Domain logic extraction
- Phase 3: Service layer with DI
- Phase 4: Custom hooks
- Phase 5: Component refactoring

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Common Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

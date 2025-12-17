# Quick Start: Testing Guide

## Running Tests

```bash
# Development - watch mode with hot reload
npm test

# CI/Production - run once and exit
npm run test:run

# Visual UI - interactive test dashboard
npm run test:ui

# Coverage - see what's tested
npm run test:coverage
```

## Writing Your First Test

### 1. Component Test Template

```typescript
// src/components/MyComponent.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<MyComponent onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalled();
  });
});
```

### 2. Pure Function Test Template

```typescript
// src/domain/validators/myValidator.test.ts
import { describe, it, expect } from 'vitest';
import { validateSomething } from './myValidator';

describe('validateSomething', () => {
  it('should pass valid input', () => {
    expect(validateSomething('valid')).toBe(true);
  });

  it('should reject invalid input', () => {
    expect(validateSomething('')).toBe(false);
  });
});
```

## Using Test Factories

```typescript
import { 
  createExercise, 
  createExerciseLogEntry 
} from '../test/factories';

// Create with defaults
const exercise = createExercise();
// { group: 'Chest', name: 'Bench Press' }

// Override specific fields
const customExercise = createExercise({ 
  name: 'Squat' 
});

// Create complete entries
const entry = createExerciseLogEntry({
  exercise: createExercise({ group: 'Legs' }),
  failure: true
});
```

## Common Queries

```typescript
// ✅ Preferred - semantic queries
screen.getByRole('button', { name: /save/i })
screen.getByLabelText(/exercise name/i)
screen.getByText(/success/i)
screen.getByPlaceholderText(/enter name/i)

// ⚠️ Use sparingly
screen.getByTestId('custom-element')

// 🔍 Query variants
getBy...    // Throws if not found
queryBy...  // Returns null if not found
findBy...   // Async, waits for element
```

## User Interactions

```typescript
const user = userEvent.setup();

// Click
await user.click(element);

// Type text
await user.type(input, 'Hello World');

// Select option
await user.selectOptions(select, 'option1');

// Clear input
await user.clear(input);

// Keyboard
await user.keyboard('{Enter}');
```

## Assertions

```typescript
// Existence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Visibility
expect(element).toBeVisible();
expect(element).toHaveClass('active');

// Values
expect(input).toHaveValue('text');
expect(checkbox).toBeChecked();
expect(button).toBeDisabled();

// Text content
expect(element).toHaveTextContent(/pattern/i);
```

## Async Testing

```typescript
// Wait for element to appear
const element = await screen.findByText('Loaded');

// Wait for condition
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// Wait for element to disappear
await waitForElementToBeRemoved(() => 
  screen.queryByText('Loading...')
);
```

## Mocking

```typescript
// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue(Promise.resolve('data'));

// Check calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(2);

// Reset between tests
vi.clearAllMocks();
```

## Test Structure (AAA Pattern)

```typescript
it('should do something', async () => {
  // Arrange - Set up test data and environment
  const user = userEvent.setup();
  const testData = createExerciseLogEntry();
  const onSave = vi.fn();
  
  // Act - Perform the action being tested
  render(<Component data={testData} onSave={onSave} />);
  await user.click(screen.getByRole('button', { name: /save/i }));
  
  // Assert - Verify the outcome
  expect(onSave).toHaveBeenCalledWith(testData);
  expect(screen.getByText('Saved!')).toBeInTheDocument();
});
```

## TDD Workflow (Red-Green-Refactor)

```bash
# 1. RED - Write failing test first
npm test  # Watch mode

# 2. GREEN - Write minimal code to pass
# Edit source file...

# 3. REFACTOR - Improve code without breaking tests
# Refactor with confidence...

# 4. Repeat for next feature
```

## Debugging Tests

```typescript
// Print DOM to console
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));

// Log available queries
screen.logTestingPlaygroundURL();

// Use VS Code debugger
// Add breakpoint and run: npm run test:ui
```

## Common Patterns

### Testing Forms
```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  
  render(<Form onSubmit={onSubmit} />);
  
  await user.type(
    screen.getByLabelText(/name/i), 
    'John Doe'
  );
  await user.click(
    screen.getByRole('button', { name: /submit/i })
  );
  
  expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
});
```

### Testing Loading States
```typescript
it('should show loading state', async () => {
  render(<Component />);
  
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  await waitForElementToBeRemoved(() => 
    screen.queryByText(/loading/i)
  );
  
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});
```

### Testing Error States
```typescript
it('should display error message', async () => {
  const user = userEvent.setup();
  
  render(<Component />);
  
  await user.click(screen.getByRole('button'));
  
  expect(
    await screen.findByText(/error occurred/i)
  ).toBeInTheDocument();
});
```

## Best Practices

1. ✅ **Test behavior, not implementation**
2. ✅ **Use semantic queries** (getByRole, getByLabelText)
3. ✅ **Test from user's perspective**
4. ✅ **Keep tests isolated** (no shared state)
5. ✅ **Use factories for test data**
6. ✅ **Mock external dependencies**
7. ✅ **Write descriptive test names**
8. ✅ **Follow AAA pattern** (Arrange-Act-Assert)

## Avoid

1. ❌ Testing implementation details
2. ❌ Using `container.querySelector()`
3. ❌ Testing third-party libraries
4. ❌ Snapshot testing for everything
5. ❌ Not using async/await properly
6. ❌ Overcomplicated test setup

## Get Help

- Full docs: `src/test/README.md`
- Complete guide: `TESTING_SETUP_COMPLETE.md`
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest API](https://vitest.dev/api/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Happy Testing! 🧪**

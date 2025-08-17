---
id: T-write-comprehensive-unit
title: Write comprehensive unit tests for PersonalitiesProvider component
status: open
priority: medium
parent: F-react-personalities-context
prerequisites:
  - T-create-personalitiesprovider
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T03:38:21.345Z
updated: 2025-08-17T03:38:21.345Z
---

# Write Comprehensive Unit Tests for PersonalitiesProvider

## Purpose

Create comprehensive unit tests for the `PersonalitiesProvider` component covering all functionality including successful initialization, loading states, error handling, context provision, and lifecycle management.

## Test File Location

- Create `apps/desktop/src/contexts/__tests__/PersonalitiesProvider.test.tsx`
- Follow the same structure as `apps/desktop/src/contexts/__tests__/RolesProvider.test.tsx`

## Required Test Dependencies

### Mock Setup

```typescript
// Mock the shared packages
jest.mock("@fishbowl-ai/ui-shared", () => ({
  usePersonalitiesStore: jest.fn(),
}));

jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock the desktop adapter
jest.mock("../adapters/desktopPersonalitiesAdapter", () => ({
  desktopPersonalitiesAdapter: {
    save: jest.fn(),
    load: jest.fn(),
    reset: jest.fn(),
  },
}));
```

### Test Utilities

- Use `@testing-library/react` for component testing
- Use `@testing-library/jest-dom` for additional matchers
- Mock timers for testing async behavior if needed
- Use `screen`, `render`, `waitFor` from testing library

## Test Scenarios

### 1. Successful Initialization Flow

```typescript
describe("successful initialization", () => {
  test("should initialize store and render children when successful", async () => {
    // Mock store that initializes successfully
    // Verify loading state appears then disappears
    // Verify children are rendered after initialization
    // Verify context provides adapter correctly
  });

  test("should skip initialization if store is already initialized", async () => {
    // Mock store with isInitialized: true
    // Verify initialize is not called again
    // Verify children render immediately
  });
});
```

### 2. Loading State Management

```typescript
describe("loading state", () => {
  test("should show loading spinner during initialization", () => {
    // Mock store that doesn't resolve immediately
    // Verify loading spinner is displayed
    // Verify "Loading personalities..." text is shown
    // Verify children are not rendered during loading
  });

  test("should use correct CSS classes for loading state", () => {
    // Verify loading spinner has proper styling classes
    // Verify layout matches RolesProvider pattern
  });
});
```

### 3. Error Handling and Recovery

```typescript
describe("error handling", () => {
  test("should display error message when initialization fails", async () => {
    // Mock store.initialize to throw error
    // Verify error message is displayed
    // Verify retry button is shown
    // Verify children are not rendered
  });

  test("should handle both Error objects and string errors", async () => {
    // Test with Error object
    // Test with string error
    // Verify both are handled appropriately
  });

  test("should reload application when retry button is clicked", async () => {
    // Mock window.location.reload
    // Trigger error state
    // Click retry button
    // Verify reload is called
  });
});
```

### 4. Context Provider Functionality

```typescript
describe("context provider", () => {
  test("should provide adapter through context after successful initialization", async () => {
    // Create test component that uses usePersonalitiesAdapter hook
    // Verify adapter is provided correctly
    // Verify adapter methods are accessible
  });

  test("should throw error when usePersonalitiesAdapter is used outside provider", () => {
    // Test hook outside provider context
    // Verify descriptive error is thrown
  });
});
```

### 5. Component Lifecycle Management

```typescript
describe("component lifecycle", () => {
  test("should prevent multiple initialization attempts", async () => {
    // Mock store.initialize with delay
    // Verify initialize is called only once
    // Test with multiple renders or state changes
  });

  test("should cleanup properly on unmount", () => {
    // Mount component
    // Unmount during initialization
    // Verify no state updates occur after unmount
    // Verify no memory leaks
  });

  test("should handle mount/unmount cycles correctly", async () => {
    // Mount, unmount, remount component
    // Verify proper cleanup and reinitialization
  });
});
```

### 6. Integration with Store

```typescript
describe("store integration", () => {
  test("should call store.initialize with correct adapter", async () => {
    // Mock store
    // Verify initialize is called with desktopPersonalitiesAdapter
  });

  test("should log initialization events correctly", async () => {
    // Mock logger
    // Test successful initialization logging
    // Test error logging with proper metadata
  });
});
```

## Test Coverage Requirements

### Functional Coverage

- ✅ All component render paths (loading, error, success)
- ✅ All user interactions (retry button click)
- ✅ All store integration points
- ✅ All error scenarios and edge cases
- ✅ All lifecycle events (mount, unmount, re-render)

### Code Coverage Requirements

- 100% line coverage for PersonalitiesProvider component
- 100% branch coverage for all conditional logic
- All error handling paths tested
- All async scenarios properly tested with waitFor

### Mock Verification

- Store.initialize called with correct adapter
- Logger methods called with appropriate messages
- Context provides correct adapter instance
- Window.location.reload called on retry

## Implementation Guidelines

### Test Structure

```typescript
describe("PersonalitiesProvider", () => {
  let mockStore: any;
  let mockLogger: any;

  beforeEach(() => {
    // Reset all mocks
    // Setup default mock implementations
  });

  afterEach(() => {
    // Cleanup
  });

  // Test groups organized by functionality
});
```

### Async Testing Patterns

- Use `waitFor` for async state changes
- Use `act` when needed for React state updates
- Mock promises with proper resolution/rejection
- Test race conditions and cleanup scenarios

### Error Testing

- Test different error types (Error objects, strings, network errors)
- Verify user-friendly error messages
- Test error recovery and retry mechanisms
- Ensure errors don't crash the component

## Acceptance Criteria

### Test Quality Requirements

- [x] All described test scenarios implemented and passing
- [x] 100% code coverage for PersonalitiesProvider component
- [x] All mocks properly configured and verified
- [x] No test warnings or React testing library violations
- [x] Tests run consistently without flakiness

### Test Coverage Verification

- [x] Loading states properly tested
- [x] Error handling comprehensively covered
- [x] Context provider functionality verified
- [x] Store integration points tested
- [x] Component lifecycle properly tested
- [x] All user interactions tested

## Dependencies

- Requires PersonalitiesProvider component implementation
- Follows patterns from existing RolesProvider tests
- Uses same testing utilities and patterns as other provider tests

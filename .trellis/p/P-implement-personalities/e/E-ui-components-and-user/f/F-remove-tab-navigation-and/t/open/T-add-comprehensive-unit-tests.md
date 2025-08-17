---
id: T-add-comprehensive-unit-tests
title: Add Comprehensive Unit Tests
status: open
priority: medium
parent: F-remove-tab-navigation-and
prerequisites:
  - T-restructure-layout-with
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T14:29:56.162Z
updated: 2025-08-17T14:29:56.162Z
---

# Add Comprehensive Unit Tests for Restructured PersonalitiesSection

## Context

After completing the PersonalitiesSection restructure, this task adds comprehensive unit tests to ensure the component works correctly across all states and interactions. The tests should verify store integration, UI rendering, and user interactions.

**File Location**: `apps/desktop/src/components/settings/personalities/PersonalitiesSection.test.tsx` (create new file)

**Reference Pattern**: Follow testing patterns from similar components in the desktop app, especially RolesSection tests if they exist

## Specific Implementation Requirements

### Test File Setup

Create a comprehensive test suite with proper mocking:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import PersonalitiesSection from "./PersonalitiesSection";

// Mock the personalities store
const mockUsePersonalitiesStore = vi.fn();
vi.mock("@fishbowl-ai/ui-shared", () => ({
  usePersonalitiesStore: mockUsePersonalitiesStore,
}));

// Mock logger
vi.mock("@fishbowl-ai/shared", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));
```

### Test Categories

Create test suites for each component state and interaction:

#### 1. **Loading State Tests**

```tsx
describe("Loading State", () => {
  it("displays loading message when isLoading is true", () => {
    mockUsePersonalitiesStore.mockReturnValue({
      personalities: [],
      isLoading: true,
      error: null,
      // ... other store properties
    });

    render(<PersonalitiesSection />);
    expect(screen.getByText("Loading personalities...")).toBeInTheDocument();
  });

  it("shows header during loading state", () => {
    // Test header remains visible during loading
  });
});
```

#### 2. **Error State Tests**

```tsx
describe("Error State", () => {
  it("displays error message when error exists", () => {
    const mockError = { message: "Failed to load personalities" };
    mockUsePersonalitiesStore.mockReturnValue({
      personalities: [],
      isLoading: false,
      error: mockError,
      retryLastOperation: vi.fn(),
      // ... other store properties
    });

    render(<PersonalitiesSection />);
    expect(
      screen.getByText("Error: Failed to load personalities"),
    ).toBeInTheDocument();
  });

  it("calls retryLastOperation when retry button clicked", () => {
    // Test retry functionality
  });
});
```

#### 3. **Empty State Tests**

```tsx
describe("Empty State", () => {
  it("displays empty state when no personalities exist", () => {
    mockUsePersonalitiesStore.mockReturnValue({
      personalities: [],
      isLoading: false,
      error: null,
      // ... other store properties
    });

    render(<PersonalitiesSection />);
    expect(screen.getByText("No personalities yet")).toBeInTheDocument();
    expect(screen.getByText("Create First Personality")).toBeInTheDocument();
  });

  it("calls handler when Create First Personality clicked", () => {
    // Test empty state create button
  });
});
```

#### 4. **Header and Create Button Tests**

```tsx
describe("Header Section", () => {
  it("renders header with correct title and description", () => {
    render(<PersonalitiesSection />);
    expect(screen.getByText("Personalities")).toBeInTheDocument();
    expect(
      screen.getByText("Manage agent personalities and their characteristics."),
    ).toBeInTheDocument();
  });

  it("renders create button in header", () => {
    render(<PersonalitiesSection />);
    expect(
      screen.getByRole("button", { name: /create personality/i }),
    ).toBeInTheDocument();
  });

  it("calls handleCreatePersonality when create button clicked", () => {
    // Test create button functionality
  });
});
```

#### 5. **Store Integration Tests**

```tsx
describe("Store Integration", () => {
  it("subscribes to all required store state", () => {
    const mockStore = {
      personalities: [],
      isLoading: false,
      error: null,
      isSaving: false,
      createPersonality: vi.fn(),
      updatePersonality: vi.fn(),
      deletePersonality: vi.fn(),
      clearError: vi.fn(),
      retryLastOperation: vi.fn(),
    };

    mockUsePersonalitiesStore.mockReturnValue(mockStore);
    render(<PersonalitiesSection />);

    // Verify store is called with correct selectors
    expect(mockUsePersonalitiesStore).toHaveBeenCalledTimes(9); // Once for each subscription
  });
});
```

#### 6. **Modal State Management Tests**

```tsx
describe("Modal State Management", () => {
  it("initializes modal state correctly", () => {
    // Test initial state of modals
  });

  it("updates form mode when create button clicked", () => {
    // Test form mode state changes
  });

  it("sets selectedPersonality correctly for edit mode", () => {
    // Test edit mode state management
  });
});
```

### Mock Data Setup

Create helper functions for consistent test data:

```tsx
const createMockPersonality = (overrides = {}) => ({
  id: "test-id",
  name: "Test Personality",
  bigFive: {
    openness: 50,
    conscientiousness: 60,
    extraversion: 70,
    agreeableness: 80,
    neuroticism: 40,
  },
  behaviors: { analytical: 75 },
  customInstructions: "Test instructions",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const createMockStoreState = (overrides = {}) => ({
  personalities: [],
  isLoading: false,
  error: null,
  isSaving: false,
  createPersonality: vi.fn(),
  updatePersonality: vi.fn(),
  deletePersonality: vi.fn(),
  clearError: vi.fn(),
  retryLastOperation: vi.fn(),
  ...overrides,
});
```

## Detailed Acceptance Criteria

### Test Coverage

- [ ] All component states tested (loading, error, empty, with data)
- [ ] All user interactions tested (button clicks, handlers)
- [ ] Store integration properly mocked and verified
- [ ] Error scenarios properly tested
- [ ] Modal state management tested

### Test Quality

- [ ] Tests use proper assertions and matchers
- [ ] Mocks are properly setup and cleaned up
- [ ] Tests are independent and don't affect each other
- [ ] Test names clearly describe what is being tested
- [ ] Setup and teardown properly implemented

### Mock Implementation

- [ ] usePersonalitiesStore properly mocked
- [ ] Logger properly mocked
- [ ] All store methods mocked as functions
- [ ] Mock data helpers created for consistency

### Test Organization

- [ ] Tests grouped by functionality (describe blocks)
- [ ] Consistent test structure across all tests
- [ ] beforeEach setup for common mock configuration
- [ ] Clear test descriptions and expectations

### Edge Cases

- [ ] Empty personalities array handled
- [ ] Null/undefined error states handled
- [ ] Network error retry scenarios tested
- [ ] Multiple button clicks don't cause issues

## Implementation Guidance

1. **Start with file setup**: Create test file with proper imports and mocks
2. **Create mock helpers**: Build reusable mock data functions
3. **Test loading state first**: Simplest state to verify setup works
4. **Add error state tests**: Verify error handling and retry functionality
5. **Test empty state**: Verify empty state display and interactions
6. **Test header and buttons**: Verify UI elements render and function
7. **Test store integration**: Verify all subscriptions work correctly
8. **Add edge case tests**: Handle unusual scenarios

## Testing Requirements

### Unit Test Coverage

- Minimum 90% code coverage for PersonalitiesSection
- All conditional branches tested
- All event handlers tested
- All state management tested

### Test Execution

- All tests pass consistently
- No flaky tests or race conditions
- Tests run quickly (under 2 seconds)
- No console warnings during test execution

### Integration Testing

- Component integrates properly with mocked store
- Event handlers work as expected
- State changes trigger re-renders correctly

## Security Considerations

- Test that user interactions don't expose sensitive data
- Verify error messages don't leak system information
- Ensure event handlers properly validate inputs

## Dependencies

- **T-restructure-layout-with**: Requires completed component implementation
- **@testing-library/react**: For component testing utilities
- **vitest**: For test framework and mocking
- **usePersonalitiesStore**: Store must exist for mocking

## Estimated Time

2-2.5 hours including comprehensive test writing and validation

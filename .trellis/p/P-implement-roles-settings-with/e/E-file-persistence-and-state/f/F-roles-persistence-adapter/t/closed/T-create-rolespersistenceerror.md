---
id: T-create-rolespersistenceerror
title: Create RolesPersistenceError class with unit tests
status: done
priority: high
parent: F-roles-persistence-adapter
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/roles/persistence/RolesPersistenceError.ts:
    Created new error class that extends Error with operation context and error
    chaining, following SettingsPersistenceError pattern exactly
  packages/ui-shared/src/types/roles/persistence/__tests__/RolesPersistenceError.test.ts: Created comprehensive unit tests with 6 test cases achieving 100% coverage
  packages/ui-shared/src/types/roles/persistence/index.ts: Created barrel export file for clean imports
log:
  - 'Successfully implemented RolesPersistenceError class following the exact
    pattern established by SettingsPersistenceError. The error class provides
    structured error handling with operation context ("save" | "load" | "reset")
    and error chaining capabilities. Created comprehensive unit tests with 100%
    coverage including 6 test cases covering all functionality: error creation
    with properties, operation types, optional cause parameter, stack trace
    maintenance, Error class inheritance, and various cause types. All quality
    checks pass and the implementation is ready for use by future
    RolesPersistenceAdapter implementations.'
schema: v1.0
childrenIds: []
created: 2025-08-10T21:38:30.640Z
updated: 2025-08-10T21:38:30.640Z
---

# Create RolesPersistenceError Class with Unit Tests

## Context and Purpose

Create the specialized error class for roles persistence operations, following the exact pattern established by `SettingsPersistenceError`. This error class provides structured error handling with operation context and error chaining capabilities.

## Implementation Location

**File**: `packages/ui-shared/src/types/roles/persistence/RolesPersistenceError.ts`

## Detailed Implementation Requirements

### Error Class Structure

Based on the existing `SettingsPersistenceError` pattern:

```typescript
export class RolesPersistenceError extends Error {
  constructor(
    message: string,
    public readonly operation: "save" | "load" | "reset",
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RolesPersistenceError";

    // Maintain proper stack trace (V8 specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
```

### JSDoc Documentation Requirements

- [ ] Comprehensive class documentation with purpose and usage
- [ ] Parameter documentation for constructor
- [ ] Usage examples showing error handling patterns
- [ ] Cross-references to related persistence interfaces

## Unit Tests Implementation

**File**: `packages/ui-shared/src/types/roles/persistence/__tests__/RolesPersistenceError.test.ts`

### Test Coverage Requirements

Follow the exact test pattern from `SettingsPersistenceError.test.ts`:

- [ ] **Basic Error Creation**: Verify error instance, name, message, operation, and cause
- [ ] **Operation Types**: Test all three operation types (save, load, reset)
- [ ] **Optional Cause**: Verify error works with and without cause parameter
- [ ] **Stack Trace**: Ensure proper stack trace maintenance
- [ ] **Error Extension**: Confirm proper Error class inheritance
- [ ] **Different Cause Types**: Test string, object, null, and undefined causes

### Test Structure

```typescript
describe("RolesPersistenceError", () => {
  it("should create error with correct properties", () => {
    // Test basic error creation with all parameters
  });

  it("should support all operation types", () => {
    // Test save, load, reset operations
  });

  it("should work without cause", () => {
    // Test optional cause parameter
  });

  // Additional tests following SettingsPersistenceError pattern...
});
```

## Acceptance Criteria

### Functional Requirements

- [ ] RolesPersistenceError extends Error class properly
- [ ] Constructor accepts message, operation, and optional cause
- [ ] Operation type is strictly typed as "save" | "load" | "reset"
- [ ] Error name is set to "RolesPersistenceError"
- [ ] Stack trace is properly maintained
- [ ] All parameters are correctly assigned as readonly properties

### Testing Requirements

- [ ] 100% test coverage for error class
- [ ] All test cases pass without warnings
- [ ] Tests follow existing project testing patterns
- [ ] Test file structure matches existing persistence error tests

### Documentation Requirements

- [ ] JSDoc documentation includes usage examples
- [ ] Error handling patterns are clearly documented
- [ ] Cross-references to RolesPersistenceAdapter interface

## Technical Notes

- **Pattern Consistency**: Follow the exact implementation pattern from `SettingsPersistenceError`
- **TypeScript Support**: Ensure proper typing for all properties and methods
- **Error Chaining**: Support for wrapped errors via the cause property
- **V8 Optimization**: Include Error.captureStackTrace for proper stack traces

## Dependencies

- No external dependencies - this is a foundational class
- Must complete before other persistence adapter tasks

## Definition of Done

- [ ] RolesPersistenceError class implemented with proper inheritance
- [ ] All unit tests implemented and passing
- [ ] Code follows project TypeScript and coding standards
- [ ] JSDoc documentation is complete and accurate
- [ ] Error class properly handles all specified operation types
- [ ] Stack trace and error chaining work correctly

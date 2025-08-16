---
id: T-create-personalitiespersistenc-1
title: Create PersonalitiesPersistenceError class with unit tests
status: open
priority: high
parent: F-persistence-adapter-interface
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-16T21:03:49.943Z
updated: 2025-08-16T21:03:49.943Z
---

# Create PersonalitiesPersistenceError Class

## Context

Create the error class for personalities persistence operations, following the exact pattern from `RolesPersistenceError`. This provides structured error handling with operation context and cause tracking.

## Implementation Requirements

### File Location

- Create `packages/ui-shared/src/types/personalities/persistence/PersonalitiesPersistenceError.ts`
- Follow exact naming convention from roles pattern

### Class Definition

```typescript
export class PersonalitiesPersistenceError extends Error {
  constructor(
    message: string,
    public readonly operation: "save" | "load" | "reset",
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "PersonalitiesPersistenceError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
```

### JSDoc Documentation

- Copy and adapt documentation from `RolesPersistenceError`
- Include constructor parameter descriptions
- Add usage examples showing error creation and handling
- Document the operation types ("save", "load", "reset")
- Explain the optional cause parameter for error chaining

## Technical Approach

1. **Reference Pattern**: Use `packages/ui-shared/src/types/roles/persistence/RolesPersistenceError.ts` as exact template
2. **Error Properties**: Include operation and cause as readonly properties
3. **Stack Trace**: Maintain proper V8 stack trace with Error.captureStackTrace
4. **Name Property**: Set to "PersonalitiesPersistenceError" for debugging

## Unit Tests

Create `packages/ui-shared/src/types/personalities/persistence/__tests__/PersonalitiesPersistenceError.test.ts`:

### Test Cases

- [ ] Constructor sets message correctly
- [ ] Constructor sets operation correctly ("save", "load", "reset")
- [ ] Constructor sets optional cause correctly
- [ ] Error name is "PersonalitiesPersistenceError"
- [ ] Error inherits from Error class
- [ ] Stack trace is properly maintained
- [ ] instanceof checks work correctly
- [ ] Error can be serialized/deserialized

### Test Structure

```typescript
describe("PersonalitiesPersistenceError", () => {
  describe("constructor", () => {
    // Test constructor behavior
  });

  describe("properties", () => {
    // Test readonly properties
  });

  describe("inheritance", () => {
    // Test Error inheritance
  });
});
```

## Acceptance Criteria

- [ ] Class extends Error properly
- [ ] Constructor accepts message, operation, and optional cause
- [ ] Operation property is typed as "save" | "load" | "reset"
- [ ] Properties are marked as readonly
- [ ] Error name is set to class name
- [ ] V8 stack trace handling is implemented
- [ ] Comprehensive JSDoc documentation
- [ ] Unit tests provide 100% code coverage
- [ ] TypeScript compilation passes without errors

## Dependencies

- Standard JavaScript Error class
- Jest for unit testing framework

## Testing Requirements

- Create comprehensive unit tests for constructor and properties
- Test error inheritance and instanceof behavior
- Test all operation types
- No integration or performance tests

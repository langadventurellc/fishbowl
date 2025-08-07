---
kind: task
id: T-create-llmconfig-custom-error
title: Create LlmConfig custom error classes for service operations
status: open
priority: high
prerequisites: []
created: "2025-08-06T21:43:16.862971"
updated: "2025-08-06T21:43:16.862971"
schema_version: "1.1"
parent: F-core-llm-configuration-service
---

# Create LlmConfig Custom Error Classes for Service Operations

## Context

Implement custom error classes for the LLM Configuration Service that follow the established error handling patterns in the codebase. The service needs business-level errors that provide clear context for different failure scenarios.

## Technical Approach

Follow the existing error handling patterns found in `packages/shared/src/services/storage/errors/` where custom error classes extend a base `FileStorageError` class. The service will use these errors to provide consistent error handling across all CRUD operations.

## Implementation Requirements

### File Location

- Create `apps/desktop/src/electron/services/errors/LlmConfigError.ts`
- Follow the existing pattern of having error classes in a dedicated errors subdirectory

### Error Class Hierarchy

Create the following error classes that extend a base `LlmConfigError`:

```typescript
// Base error class for all LLM config service operations
export class LlmConfigError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: any,
    cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      cause: this.cause?.message,
    };
  }
}

// Specific error types
export class DuplicateConfigError extends LlmConfigError {}
export class ConfigNotFoundError extends LlmConfigError {}
export class InvalidConfigError extends LlmConfigError {}
export class ConfigOperationError extends LlmConfigError {}
```

### Error Class Specifications

1. **LlmConfigError** (Base class)
   - Extends built-in `Error`
   - Includes `code` field for error categorization
   - Includes optional `context` field for additional data
   - Includes optional `cause` field for chaining underlying errors
   - Implements `toJSON()` method for serialization (needed for IPC)
   - Sets proper `name` property and stack trace

2. **DuplicateConfigError**
   - Used when attempting to create config with duplicate name
   - Code: `DUPLICATE_CONFIG_NAME`

3. **ConfigNotFoundError**
   - Used when attempting to read/update/delete non-existent config
   - Code: `CONFIG_NOT_FOUND`

4. **InvalidConfigError**
   - Used when configuration data fails validation
   - Code: `INVALID_CONFIG_DATA`

5. **ConfigOperationError**
   - Used for general service operation failures
   - Code: `CONFIG_OPERATION_FAILED`

### Usage Examples

```typescript
// Duplicate name check
throw new DuplicateConfigError(
  `Configuration with name '${input.customName}' already exists`,
  "DUPLICATE_CONFIG_NAME",
  { attemptedName: input.customName },
);

// Configuration not found
throw new ConfigNotFoundError(
  `Configuration with ID '${id}' not found`,
  "CONFIG_NOT_FOUND",
  { configId: id },
);
```

## Detailed Acceptance Criteria

### Error Class Implementation

- ✓ Base `LlmConfigError` class extends `Error` with proper constructor
- ✓ All specific error classes extend `LlmConfigError`
- ✓ Each error class has appropriate default error codes
- ✓ All errors are serializable via `toJSON()` method
- ✓ Stack traces are properly captured using `Error.captureStackTrace`
- ✓ Error names are set correctly to the class name

### Error Context and Debugging

- ✓ Errors include contextual information in the `context` field
- ✓ Original errors can be chained using the `cause` field
- ✓ Error codes are consistent and meaningful
- ✓ Messages are descriptive and user-friendly

### File Organization

- ✓ Errors are organized in dedicated `errors/` subdirectory
- ✓ File follows TypeScript naming conventions
- ✓ Proper imports and exports for external usage
- ✓ File includes JSDoc comments for documentation

### Integration Requirements

- ✓ Error classes are compatible with existing logger service
- ✓ Errors can be serialized for IPC communication
- ✓ Follow existing error handling patterns from storage services
- ✓ Compatible with service layer error handling needs

## Unit Testing Requirements

Create comprehensive unit tests in `apps/desktop/src/electron/services/errors/__tests__/LlmConfigError.test.ts`:

### Test Scenarios

1. **Base Error Class Tests**
   - Constructor sets all properties correctly
   - `toJSON()` method serializes properly
   - Stack trace is captured correctly
   - Error name is set to class name

2. **Specific Error Class Tests**
   - Each specific error class extends base class properly
   - Default error codes are set correctly
   - Context information is preserved
   - Cause chaining works properly

3. **Serialization Tests**
   - Errors can be JSON serialized/deserialized
   - No circular reference issues
   - All important properties are preserved

### Test Implementation

```typescript
describe("LlmConfigError", () => {
  describe("constructor", () => {
    it("should set all properties correctly", () => {
      const cause = new Error("Original error");
      const error = new LlmConfigError(
        "Test message",
        "TEST_CODE",
        { testProp: "value" },
        cause,
      );

      expect(error.message).toBe("Test message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.context).toEqual({ testProp: "value" });
      expect(error.cause).toBe(cause);
      expect(error.name).toBe("LlmConfigError");
    });
  });

  // Additional test cases for each error type
});
```

## Security Considerations

- Never include sensitive data (API keys) in error context
- Sanitize error messages for user display
- Ensure error serialization doesn't expose internal paths
- Log errors appropriately without exposing secrets

## Dependencies

- None (pure TypeScript implementation)
- Uses built-in `Error` class
- Compatible with existing logger service patterns

## Estimated Completion Time

1-2 hours for implementation and comprehensive unit tests.

### Log

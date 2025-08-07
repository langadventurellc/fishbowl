---
kind: task
id: T-implement-error-serialization
parent: F-ipc-communication-layer
status: done
title: Implement error serialization utilities for IPC transport
priority: high
prerequisites:
  - T-create-ipc-channel-definitions-1
created: "2025-08-07T15:13:19.219336"
updated: "2025-08-07T15:38:27.345810"
schema_version: "1.1"
worktree: null
---

# Implement Error Serialization Utilities for IPC Transport

## Context

Create error serialization utilities that safely transform errors for IPC transport between main and renderer processes. The utilities must preserve error context while excluding sensitive information and ensuring consistent error handling across the application.

## Detailed Requirements

### 1. Core Serialization Function

Implement `serializeError` function that handles different error types:

```typescript
interface SerializedError {
  name: string;
  message: string;
  code: string;
  context?: any;
}

function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: (error as any).code || "UNKNOWN",
      context: (error as any).context,
    };
  }
  return {
    name: "UnknownError",
    message: String(error),
    code: "UNKNOWN",
  };
}
```

### 2. Error Type Handling

Support different error categories:

- **ValidationError**: Input validation failures
- **StorageError**: File or secure storage failures
- **ServiceError**: Business logic errors
- **UnknownError**: Unexpected errors

### 3. Security Considerations

- Never include stack traces in production builds
- Exclude sensitive information from error context
- Sanitize error messages to prevent information leakage
- Preserve error codes for client-side error handling

### 4. Response Wrapper Functions

Create helper functions for consistent response formatting:

```typescript
function createSuccessResponse<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

function createErrorResponse(error: unknown): {
  success: false;
  error: SerializedError;
} {
  return { success: false, error: serializeError(error) };
}
```

## Technical Implementation Steps

1. **Create error utilities file**:
   - Implement `serializeError` function with proper type handling
   - Add security filters to exclude sensitive data
   - Handle edge cases (null, undefined, non-Error objects)

2. **Add response wrapper functions**:
   - Create success and error response helpers
   - Ensure consistent response structure
   - Add TypeScript generics for type safety

3. **Implement error filtering**:
   - Remove stack traces in production mode
   - Sanitize error messages for security
   - Preserve useful debugging information

4. **Add logging integration**:
   - Log original errors for debugging
   - Use existing logger service patterns
   - Include request context in logs

## Acceptance Criteria

- ✓ `serializeError` handles all error types safely
- ✓ Stack traces are excluded from serialized errors
- ✓ Sensitive information is filtered from error context
- ✓ Error codes are preserved for client-side handling
- ✓ Response wrapper functions ensure consistent structure
- ✓ Unknown errors are handled gracefully
- ✓ Logging captures full error details for debugging
- ✓ TypeScript types ensure compile-time safety

## Unit Testing Requirements

Create comprehensive unit tests covering:

1. **Error serialization tests**:
   - Test standard Error objects are serialized correctly
   - Test custom error types with codes and context
   - Test unknown error types (strings, objects, null)
   - Verify sensitive data is excluded

2. **Response wrapper tests**:
   - Test success response structure
   - Test error response structure
   - Verify type safety with different data types

3. **Security filtering tests**:
   - Test stack traces are removed
   - Test sensitive context data is filtered
   - Verify error messages are sanitized

4. **Edge case handling**:
   - Test null and undefined errors
   - Test circular reference objects
   - Test very large error contexts

## Dependencies

- Requires `SerializedError` type from the channel definitions task
- Uses existing logger service from `@fishbowl-ai/shared`
- No external dependencies beyond project structure

## File Structure

```
apps/desktop/src/electron/
├── utils/
│   └── errorSerialization.ts       # Error serialization utilities
└── __tests__/
    └── errorSerialization.test.ts  # Unit tests
```

## Implementation Notes

- Keep error handling simple but comprehensive
- Follow existing error patterns in the codebase
- Ensure errors are useful for debugging without exposing sensitive data
- Use defensive programming for unknown error types
- Consider performance - error serialization should be fast

### Log

**2025-08-07T20:50:44.194498Z** - Implemented comprehensive error serialization utilities for IPC transport with context extraction, security filtering, and response helpers. Enhanced the existing serializeError function to extract and sanitize context from LlmConfigError, FileStorageError, and SettingsValidationError instances while filtering sensitive information (API keys, passwords, tokens). Added generic error type detection based on message content for ValidationError, ServiceError, and StorageError patterns. Created separate response helper functions (createSuccessResponse and createErrorResponse) following the project's single-export-per-file convention. All functionality includes comprehensive unit tests with 59 passing tests covering context extraction, security filtering, error type detection, and response helpers.

- filesChanged: ["apps/desktop/src/shared/ipc/types.ts", "apps/desktop/src/electron/utils/errorSerialization.ts", "apps/desktop/src/electron/utils/createSuccessResponse.ts", "apps/desktop/src/electron/utils/createErrorResponse.ts", "apps/desktop/src/electron/utils/__tests__/errorSerialization.test.ts"]

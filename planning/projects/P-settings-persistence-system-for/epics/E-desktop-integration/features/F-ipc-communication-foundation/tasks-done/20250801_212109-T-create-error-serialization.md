---
kind: task
id: T-create-error-serialization
parent: F-ipc-communication-foundation
status: done
title: Create error serialization utility for IPC boundary
priority: normal
prerequisites:
  - T-create-ipc-channel-constants-and
created: "2025-08-01T20:02:44.537528"
updated: "2025-08-01T21:08:20.545377"
schema_version: "1.1"
worktree: null
---

# Create Error Serialization Utility for IPC Boundary

## Context

This task creates a utility function to properly serialize JavaScript Error objects for transmission across the IPC boundary. Since Error objects don't serialize well with JSON.stringify(), we need a dedicated utility to extract relevant error information while maintaining security.

This utility will be used by the main process IPC handlers to convert caught exceptions into the standardized error format defined in the settings IPC types.

## Technical Approach

Create a utility module that exports a `serializeError` function, taking a JavaScript Error and returning a serializable error object that matches our IPC error structure.

## Detailed Implementation Requirements

### 1. Create Error Serialization Utility

- **File**: `apps/desktop/src/electron/utils/errorSerialization.ts`
- **Function**: Export `serializeError` function
- **Input**: JavaScript Error or any thrown value
- **Output**: Serializable error object matching IPC error structure

### 2. Implementation Structure

```typescript
export interface SerializableError {
  message: string;
  code: string;
  stack?: string; // Only in development
}

export function serializeError(error: unknown): SerializableError {
  // Handle different error types (Error, string, object, etc.)
  // Extract message, determine error code
  // Include stack trace only in development
  // Sanitize sensitive information
}
```

### 3. Error Type Handling

- **Error Objects**: Extract message and stack trace
- **String Errors**: Use string as message
- **Unknown Types**: Provide generic error message
- **Null/Undefined**: Handle gracefully with default message

### 4. Error Code Generation

- **Known Error Types**: Map to specific error codes
- **Generic Errors**: Use fallback codes like 'UNKNOWN_ERROR'
- **System Errors**: Categorize file system, network, etc. errors
- **Validation Errors**: Identify data validation failures

### 5. Security Considerations

- **No System Paths**: Strip file system paths from error messages
- **No Sensitive Data**: Remove any potentially sensitive information
- **Stack Traces**: Only include in development environment
- **Generic Messages**: Provide user-friendly error messages

### 6. Development vs Production

```typescript
const isDevelopment = process.env.NODE_ENV === "development";

return {
  message: sanitizeErrorMessage(extractMessage(error)),
  code: determineErrorCode(error),
  ...(isDevelopment && { stack: extractStack(error) }),
};
```

## Acceptance Criteria

- ✓ `serializeError` function handles all common error types
- ✓ Returns object matching `SerializableError` interface
- ✓ Strips sensitive information from error messages
- ✓ Includes stack traces only in development mode
- ✓ Provides meaningful error codes for different error types
- ✓ Handles edge cases (null, undefined, non-Error objects)
- ✓ Function is properly typed and exported
- ✓ Unit tests cover all error scenarios

## Dependencies

- **T-create-ipc-channel-constants-and**: Uses error structure from types
- No external dependencies - pure utility function

## Testing Requirements

- Test with standard JavaScript Error objects
- Test with custom Error subclasses
- Test with string error messages
- Test with null/undefined values
- Test with object errors (like JSON parse errors)
- Verify stack traces only appear in development
- Test error message sanitization
- Verify error code assignment logic

## Security Considerations

- **No Information Leakage**: Don't expose system internals
- **Path Sanitization**: Remove any file system paths
- **Generic Messages**: Provide safe, user-friendly messages
- **Code Security**: Don't include sensitive error codes
- **Stack Trace Filtering**: Remove internal system paths from stacks

## Files to Create

- **Create**: `apps/desktop/src/electron/utils/errorSerialization.ts`

## Implementation Notes

- Use TypeScript strict typing for error handling
- Consider using a whitelist approach for safe error properties
- Add JSDoc documentation for the utility function
- Keep the utility focused and single-purpose
- Consider creating error mapping for common error types
- Make the function testable and easy to mock

## Usage in Main Process Handlers

This utility will be used in the IPC handlers like:

```typescript
} catch (error) {
  return {
    success: false,
    error: serializeError(error)
  };
}
```

### Log

**2025-08-02T02:21:09.961673Z** - Implemented comprehensive error serialization utility for IPC boundary with robust error handling, security sanitization, and full test coverage. The utility handles different error types (standard JavaScript errors, Node.js system errors, custom FileStorageError subclasses), sanitizes sensitive information from error messages, and includes stack traces only in development mode. All quality checks pass.

- filesChanged: ["apps/desktop/src/electron/utils/errorSerialization.ts", "apps/desktop/src/shared/ipc/types.ts", "apps/desktop/src/shared/ipc/base.ts", "apps/desktop/src/shared/ipc/index.ts", "apps/desktop/src/electron/settingsHandlers.ts", "apps/desktop/src/electron/utils/__tests__/errorSerialization.test.ts"]

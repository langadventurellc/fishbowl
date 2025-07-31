---
kind: task
id: T-implement-custom-error-classes
parent: F-generic-file-storage-service
status: done
title: Implement custom error classes for file operations
priority: high
prerequisites: []
created: "2025-07-31T14:54:52.327031"
updated: "2025-07-31T14:58:41.949681"
schema_version: "1.1"
worktree: null
---

# Custom Error Classes for File Operations

## Context

This task implements a comprehensive error handling system for the generic file storage service with specific error types for different failure scenarios. These errors provide detailed context for debugging while maintaining security.

## Reference

- **Feature**: F-generic-file-storage-service
- **Location**: `packages/shared/src/services/storage/errors/` (new directory)
- **Dependencies**: Can be implemented independently

## Implementation Requirements

### 1. Base FileStorageError Class

Create `packages/shared/src/services/storage/errors/FileStorageError.ts`:

```typescript
export abstract class FileStorageError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly filePath: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
```

### 2. Specific Error Classes

Create `packages/shared/src/services/storage/errors/FileNotFoundError.ts`:

```typescript
export class FileNotFoundError extends FileStorageError {
  constructor(filePath: string, operation: string, cause?: Error) {
    super(`File not found: ${filePath}`, operation, filePath, cause);
  }
}
```

Create `packages/shared/src/services/storage/errors/InvalidJsonError.ts`:

```typescript
export class InvalidJsonError extends FileStorageError {
  constructor(
    filePath: string,
    operation: string,
    public readonly parseError: string,
    cause?: Error,
  ) {
    super(
      `Invalid JSON in file: ${filePath} - ${parseError}`,
      operation,
      filePath,
      cause,
    );
  }
}
```

Create `packages/shared/src/services/storage/errors/WritePermissionError.ts`:

```typescript
export class WritePermissionError extends FileStorageError {
  constructor(filePath: string, operation: string, cause?: Error) {
    super(`Write permission denied: ${filePath}`, operation, filePath, cause);
  }
}
```

### 3. Error Factory for Native Error Mapping

Create `packages/shared/src/services/storage/errors/ErrorFactory.ts`:

```typescript
export class ErrorFactory {
  static fromNodeError(
    error: NodeJS.ErrnoException,
    operation: string,
    filePath: string,
  ): FileStorageError {
    // Map ENOENT, EACCES, EPERM, etc. to appropriate custom errors
  }
}
```

### 4. Barrel Export

Create `packages/shared/src/services/storage/errors/index.ts`:

- Export all error classes
- Export error factory
- Follow project barrel export patterns

## Technical Approach

1. **Error Hierarchy**: Create proper inheritance chain from base Error class
2. **Context Preservation**: Include operation type, file path, and underlying cause
3. **Security**: Avoid exposing sensitive information in error messages
4. **Error Mapping**: Map Node.js errno codes to appropriate custom errors
5. **Stack Traces**: Preserve proper stack trace information

## Acceptance Criteria

✓ **Error Class Structure**:

- All errors extend base FileStorageError class
- Include contextual information (operation, filePath, cause)
- Proper error names and inheritance chain
- Follow TypeScript error class best practices

✓ **Error Types Coverage**:

- FileNotFoundError for missing files (ENOENT)
- InvalidJsonError for JSON parsing failures
- WritePermissionError for permission issues (EACCES, EPERM)
- Base class supports extensibility for future error types

✓ **Error Factory Functionality**:

- Maps Node.js error codes to appropriate custom errors
- Preserves original error as cause
- Provides consistent error mapping logic
- Handles unknown error codes gracefully

✓ **Security Requirements**:

- No sensitive file contents in error messages
- Safe path handling without exposing system structure
- Error messages are developer-friendly but not overly detailed
- Original error stack traces preserved when appropriate

✓ **Unit Tests** (include in same task):

- Test error construction and properties
- Test error factory mapping for common Node.js errors
- Test error inheritance and instanceof checks
- Test stack trace preservation

## Dependencies

- TypeScript built-in Error class
- Node.js ErrnoException type definitions

## Integration Points

- Will be used by FileStorageService for error handling
- Error factory maps fs operation errors to custom types

## Files to Create

- `packages/shared/src/services/storage/errors/FileStorageError.ts`
- `packages/shared/src/services/storage/errors/FileNotFoundError.ts`
- `packages/shared/src/services/storage/errors/InvalidJsonError.ts`
- `packages/shared/src/services/storage/errors/WritePermissionError.ts`
- `packages/shared/src/services/storage/errors/ErrorFactory.ts`
- `packages/shared/src/services/storage/errors/index.ts`
- Unit test file following project test patterns

### Log

**2025-07-31T20:10:56.040912Z** - Implemented comprehensive custom error class system for file operations with detailed contextual information, proper inheritance hierarchy, and full test coverage. Created four error classes: FileStorageError (base), FileNotFoundError, InvalidJsonError, and WritePermissionError. Added ErrorFactory for mapping Node.js system errors to custom error types. All error classes include operation context, file paths, and cause error chaining while maintaining security by not exposing sensitive information. Implemented proper TypeScript interfaces instead of relying on Node.js types for better compatibility. All code passes quality checks and achieves 100% test coverage with 183 passing tests.

- filesChanged: ["packages/shared/src/services/storage/errors/FileStorageError.ts", "packages/shared/src/services/storage/errors/FileNotFoundError.ts", "packages/shared/src/services/storage/errors/InvalidJsonError.ts", "packages/shared/src/services/storage/errors/WritePermissionError.ts", "packages/shared/src/services/storage/errors/ErrorFactory.ts", "packages/shared/src/services/storage/errors/index.ts", "packages/shared/src/services/storage/index.ts", "packages/shared/src/services/index.ts", "packages/shared/src/index.ts", "packages/shared/src/services/storage/errors/__tests__/FileStorageError.test.ts", "packages/shared/src/services/storage/errors/__tests__/FileNotFoundError.test.ts", "packages/shared/src/services/storage/errors/__tests__/InvalidJsonError.test.ts", "packages/shared/src/services/storage/errors/__tests__/WritePermissionError.test.ts", "packages/shared/src/services/storage/errors/__tests__/ErrorFactory.test.ts"]

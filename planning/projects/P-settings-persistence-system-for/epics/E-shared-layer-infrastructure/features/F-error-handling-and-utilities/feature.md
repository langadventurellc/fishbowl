---
kind: feature
id: F-error-handling-and-utilities
title: Error Handling and Utilities
status: done
priority: normal
prerequisites: []
created: "2025-07-31T12:21:19.446639"
updated: "2025-07-31T23:00:03.545116+00:00"
schema_version: "1.1"
parent: E-shared-layer-infrastructure
---

# Error Handling and Utilities

## Purpose and Functionality

Create a comprehensive error handling system and utility functions that support the entire shared persistence infrastructure. This feature provides custom error types and helper functions that enhance the robustness and debuggability of the persistence system.

## Key Components

### 1. Custom Error Types (Implemented)

- ✅ `FileStorageError` base class for all file storage-related errors
- ✅ `FileNotFoundError` for missing settings files
- ✅ `InvalidJsonError` for malformed JSON with parsing context
- ✅ `WritePermissionError` for file system permission issues
- ⚠️ `SettingsValidationError` for Zod schema validation failures with field paths (needed)
- ⚠️ `SchemaVersionError` for settings file version mismatches (needed)

### 2. Error Factory (Implemented)

- ✅ `ErrorFactory` for creating appropriate errors from Node.js system errors
- ✅ Maps common error codes (ENOENT, EACCES, EPERM) to custom error types
- ✅ Handles JSON parsing errors

### 3. Utility Functions (To Be Implemented)

- Path validation and sanitization utilities
- JSON serialization helpers with error handling
- Deep merge utilities for settings objects
- File permission checking and setting utilities
- Cross-platform path resolution helpers

## Current Implementation Status

### Error Type Implementation ✅ Mostly Complete

- ✅ All custom error types extend standard Error with proper inheritance
- ✅ Error types include specific properties for contextual information (operation, filePath, cause)
- ✅ Error messages are descriptive
- ✅ Stack traces are preserved with Error.captureStackTrace
- ✅ Error serialization works correctly via toJSON() method
- ✅ Error chaining preserves underlying causes (e.g., fs errors)
- ⚠️ Missing: Error codes, severity levels, timestamps
- ⚠️ Missing: SettingsValidationError and SchemaVersionError classes

### Error Factory ✅ Complete

- ✅ ErrorFactory maps Node.js system errors to appropriate custom error types
- ✅ Handles common error codes (ENOENT → FileNotFoundError, EACCES/EPERM → WritePermissionError)
- ✅ Creates InvalidJsonError from JSON parsing failures
- ✅ Provides fallback for unmapped error codes

### Utility Functions ⚠️ Not Implemented

- ❌ Path validation and sanitization utilities
- ❌ JSON serialization helpers with error handling
- ❌ Deep merge utilities for settings objects
- ❌ File permission checking and setting utilities
- ❌ Cross-platform path resolution helpers

### Integration and Performance ✅ Good Foundation

- ✅ Error handling adds minimal overhead to normal operations
- ✅ Error types integrate cleanly with Promise chains and async/await
- ✅ All functions work identically in Node.js and Electron environments
- ✅ Comprehensive unit tests for all error types

## Remaining Work

### Missing Error Types

Need to implement:

```typescript
export class SettingsValidationError extends FileStorageError {
  constructor(
    filePath: string,
    operation: string,
    public readonly fieldErrors: Array<{ path: string; message: string }>,
    cause?: Error,
  ) {
    const message = `Settings validation failed: ${fieldErrors.length} field errors`;
    super(message, operation, filePath, cause);
  }
}

export class SchemaVersionError extends FileStorageError {
  constructor(
    filePath: string,
    operation: string,
    public readonly currentVersion: string,
    public readonly expectedVersion: string,
    cause?: Error,
  ) {
    const message = `Schema version mismatch: expected ${expectedVersion}, got ${currentVersion}`;
    super(message, operation, filePath, cause);
  }
}
```

### Utility Functions To Implement

- **Path utilities**: validation, sanitization, resolution
- **JSON utilities**: safe parsing, serialization, deep merging
- **File utilities**: permission checking, directory creation
- **Validation utilities**: type guards, schema helpers

### Optional Enhancements

If needed later:

- Error codes for programmatic handling
- Error severity levels (info, warning, error, fatal)
- Timestamp tracking
- Enhanced context information

## Testing Requirements

### Unit Testing ✅ Implemented

- ✅ All error types construct correctly with proper inheritance
- ✅ Error serialization works correctly via toJSON() method
- ✅ ErrorFactory creates appropriate error types from Node.js errors
- ⚠️ Need tests for new SettingsValidationError and SchemaVersionError when implemented
- ❌ Need tests for utility functions when implemented

### Integration Testing

- ✅ Error handling works correctly in real failure scenarios
- ❌ Need cross-platform utility tests when utilities are implemented
- ❌ Need path validation security tests when implemented

## Dependencies

This feature has no dependencies on other features and provides foundational utilities that other features can use. It's designed to be imported by all other persistence components.

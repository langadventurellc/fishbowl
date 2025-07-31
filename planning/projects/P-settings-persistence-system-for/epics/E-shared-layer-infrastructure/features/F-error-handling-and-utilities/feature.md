---
kind: feature
id: F-error-handling-and-utilities
title: Error Handling and Utilities
status: in-progress
priority: normal
prerequisites: []
created: "2025-07-31T12:21:19.446639"
updated: "2025-07-31T12:21:19.446639"
schema_version: "1.1"
parent: E-shared-layer-infrastructure
---

# Error Handling and Utilities

## Purpose and Functionality

Create a comprehensive error handling system and utility functions that support the entire shared persistence infrastructure. This feature provides custom error types, error classification, logging utilities, and helper functions that enhance the robustness and debuggability of the persistence system.

## Key Components to Implement

### 1. Custom Error Types

- `PersistenceError` base class for all persistence-related errors
- `FileNotFoundError` for missing settings files with recovery suggestions
- `InvalidJsonError` for malformed JSON with parsing context
- `WritePermissionError` for file system permission issues
- `SettingsValidationError` for Zod schema validation failures with field paths
- `SchemaVersionError` for settings file version mismatches

### 2. Error Classification and Context

- Error severity levels (info, warning, error, fatal)
- Contextual information (operation type, file path, timestamp)
- Error codes for programmatic handling by UI layers
- Stack trace preservation and enhancement
- User-friendly error messages with actionable suggestions

### 3. Logging and Debugging Utilities

- Structured logging functions for persistence operations
- Debug mode support with detailed operation traces
- Sanitized logging that excludes sensitive data
- Log level configuration and filtering

### 4. Utility Functions

- Path validation and sanitization utilities
- JSON serialization helpers with error handling
- Deep merge utilities for settings objects
- File permission checking and setting utilities
- Cross-platform path resolution helpers

## Detailed Acceptance Criteria

### Error Type Implementation

- ✓ All custom error types extend standard Error with proper inheritance
- ✓ Error types include specific properties for contextual information
- ✓ Error messages are descriptive and include actionable recovery steps
- ✓ Error codes follow consistent naming convention (e.g., PERSISTENCE_001)
- ✓ Stack traces are preserved and enhanced with operation context
- ✓ Error serialization works correctly for logging and reporting

### Error Context and Debugging

- ✓ Errors include operation context (read, write, validate, migrate)
- ✓ File path information included in file-related errors (sanitized for security)
- ✓ Timestamp and severity level attached to all errors
- ✓ Error chaining preserves underlying causes (e.g., fs errors)
- ✓ Error classification helps UI layers determine appropriate responses

### Logging System Implementation

- ✓ Structured logging with consistent format across all operations
- ✓ Log levels (debug, info, warn, error) filter appropriately
- ✓ Sensitive data (file contents, user data) excluded from logs
- ✓ Log output configurable for different environments (dev, prod, test)
- ✓ Async logging doesn't block persistence operations

### Utility Functions

- ✓ Path validation rejects dangerous paths (../, ~/, absolute paths)
- ✓ JSON serialization handles edge cases (circular refs, undefined, functions)
- ✓ Deep merge preserves type safety and handles null/undefined correctly
- ✓ File permission utilities work across Windows, macOS, and Linux
- ✓ Cross-platform path resolution handles all separator types
- ✓ All utilities have comprehensive error handling

### Integration and Performance

- ✓ Error handling adds minimal overhead to normal operations
- ✓ Logging utilities don't cause memory leaks with large log volumes
- ✓ Utility functions perform efficiently for typical use cases
- ✓ Error types integrate cleanly with Promise chains and async/await
- ✓ Debug mode can be toggled without application restart
- ✓ All functions work identically in Node.js and Electron environments

## Implementation Guidance

### Error Type Hierarchy

```typescript
export abstract class PersistenceError extends Error {
  abstract readonly code: string;
  abstract readonly severity: "info" | "warning" | "error" | "fatal";
  readonly timestamp: Date;
  readonly operation?: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
    this.timestamp = new Date();
  }
}

export class SettingsValidationError extends PersistenceError {
  readonly code = "SETTINGS_VALIDATION_FAILED";
  readonly severity = "error" as const;
  readonly fieldErrors: Array<{ path: string; message: string }>;

  constructor(fieldErrors: Array<{ path: string; message: string }>) {
    const message = `Settings validation failed: ${fieldErrors.length} errors`;
    super(message);
    this.fieldErrors = fieldErrors;
  }
}
```

### Logging Utility Design

```typescript
export interface LogContext {
  operation?: string;
  filePath?: string;
  duration?: number;
  [key: string]: unknown;
}

export class PersistenceLogger {
  static debug(message: string, context?: LogContext): void;
  static info(message: string, context?: LogContext): void;
  static warn(message: string, context?: LogContext): void;
  static error(error: Error, context?: LogContext): void;
}
```

### Utility Function Categories

- **Path utilities**: validation, sanitization, resolution
- **JSON utilities**: safe parsing, serialization, deep merging
- **File utilities**: permission checking, directory creation
- **Validation utilities**: type guards, schema helpers

## Testing Requirements

### Unit Testing

- All error types construct correctly with proper inheritance
- Error serialization and deserialization works correctly
- Logging utilities format output consistently
- Path validation catches all security vulnerabilities
- JSON utilities handle edge cases without throwing
- Deep merge preserves object structure and types correctly

### Integration Testing

- Error handling works correctly in real failure scenarios
- Cross-platform utilities work on CI/CD systems
- Error recovery suggestions are actionable
- Debug mode provides useful troubleshooting information

### Security Testing

- Path validation prevents directory traversal attacks
- Logging doesn't expose sensitive information
- Error messages don't reveal internal system details
- File permission utilities enforce proper access controls

## Dependencies

This feature has no dependencies on other features and provides foundational utilities that other features can use. It's designed to be imported by all other persistence components.

### Log

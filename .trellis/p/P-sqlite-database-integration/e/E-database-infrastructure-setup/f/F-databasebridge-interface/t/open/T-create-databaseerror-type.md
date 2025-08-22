---
id: T-create-databaseerror-type
title: Create DatabaseError type hierarchy
status: open
priority: high
parent: F-databasebridge-interface
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-22T00:55:27.529Z
updated: 2025-08-22T00:55:27.529Z
---

# Create DatabaseError Type Hierarchy

## Context

This task implements a comprehensive error type hierarchy for database operations, providing specific error types for different failure scenarios. This enables proper error handling and type-safe error recovery throughout the application.

**Related Trellis Objects:**

- Feature: F-databasebridge-interface (DatabaseBridge Interface Definition)
- Epic: E-database-infrastructure-setup (Database Infrastructure Setup)
- Project: P-sqlite-database-integration (SQLite Database Integration for Fishbowl Desktop)

**Existing Patterns:**
Reference the error handling patterns in `packages/shared/src/services/storage/errors/` directory, particularly `FileStorageError.ts` and error factory patterns.

## Specific Implementation Requirements

### File Creation

Create `packages/shared/src/services/database/types/DatabaseError.ts` with:

1. **Base DatabaseError Class**
   - Extends native Error class
   - Properties: code, message, cause, context
   - Serializable for IPC communication

2. **Specific Error Types**
   - `ConnectionError` - Database connection failures
   - `QueryError` - SQL syntax or execution errors
   - `TransactionError` - Transaction-specific failures
   - `PermissionError` - File/database access issues

3. **Error Codes Enum**
   - Standardized error codes for programmatic handling
   - Mapping from database-specific errors to application errors
   - Consistent error categorization

### Technical Approach

```typescript
// Example structure (implement fully)
export enum DatabaseErrorCode {
  CONNECTION_FAILED = "CONNECTION_FAILED",
  QUERY_SYNTAX_ERROR = "QUERY_SYNTAX_ERROR",
  CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  // ... other codes
}

export class DatabaseError extends Error {
  constructor(
    public readonly code: DatabaseErrorCode,
    message: string,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(DatabaseErrorCode.CONNECTION_FAILED, message, cause);
    this.name = "ConnectionError";
  }
}
```

### Error Design Principles

- Clear inheritance hierarchy with specific error types
- Preserve original error information in `cause` property
- Context object for additional debugging information
- Serializable for cross-process communication
- Consistent with existing error patterns in codebase

## Detailed Acceptance Criteria

### Error Class Hierarchy

- [ ] DatabaseError base class extends Error properly
- [ ] ConnectionError, QueryError, TransactionError classes created
- [ ] PermissionError class for file access issues
- [ ] All error classes follow consistent constructor patterns

### Error Codes

- [ ] DatabaseErrorCode enum with comprehensive error types
- [ ] Error codes map to human-readable messages
- [ ] Codes cover both better-sqlite3 and expo-sqlite scenarios
- [ ] Consistent naming convention for error codes

### Error Properties

- [ ] All errors include code, message, cause, and context
- [ ] Serializable properties for IPC communication
- [ ] Proper error stack preservation
- [ ] Type-safe error properties

### Documentation

- [ ] Complete JSDoc for all error classes and enum
- [ ] Usage examples for different error scenarios
- [ ] Error handling best practices documented
- [ ] When to use each error type clearly defined

## Testing Requirements

Include unit tests in the same file or adjacent test file:

### Error Construction Tests

- [ ] Test all error classes construct properly with required parameters
- [ ] Verify error inheritance chain works correctly
- [ ] Test error serialization for IPC transport
- [ ] Validate error stack trace preservation

### Error Code Tests

- [ ] Test all error codes are properly defined
- [ ] Verify error code to error class mapping
- [ ] Test error code uniqueness
- [ ] Validate error message consistency

### Type Safety Tests

- [ ] Test TypeScript compilation of error types
- [ ] Verify proper type narrowing with instanceof
- [ ] Test error context typing
- [ ] Validate cause error typing

## Security Considerations

### Error Information

- Avoid exposing sensitive information in error messages
- Sanitize file paths and connection strings in errors
- Provide enough detail for debugging without security risks

### Error Logging

- Safe serialization of error context
- No credentials or secrets in error objects
- Appropriate error detail levels for different environments

## Dependencies

- None (foundational error types)
- Can be implemented in parallel with result types

## Estimated Time

1-2 hours for complete implementation including tests and documentation

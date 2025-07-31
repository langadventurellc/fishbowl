---
kind: task
id: T-implement-missing
title: Implement missing SettingsValidationError and SchemaVersionError classes
status: open
priority: high
prerequisites: []
created: "2025-07-31T16:19:07.493757"
updated: "2025-07-31T16:19:07.493757"
schema_version: "1.1"
parent: F-error-handling-and-utilities
---

# Implement Missing Error Types

## Context

Complete the error handling system by implementing the two remaining error types needed for settings validation and schema version mismatches.

## Implementation Details

### Files to Create

- `packages/shared/src/services/storage/errors/SettingsValidationError.ts`
- `packages/shared/src/services/storage/errors/SchemaVersionError.ts`
- `packages/shared/src/services/storage/errors/__tests__/SettingsValidationError.test.ts`
- `packages/shared/src/services/storage/errors/__tests__/SchemaVersionError.test.ts`

### Technical Approach

Follow the existing pattern from FileStorageError base class:

**SettingsValidationError** should:

- Extend FileStorageError
- Include fieldErrors array with path and message for each validation failure
- Override toJSON() to include fieldErrors
- Follow existing constructor pattern (filePath, operation, cause)

**SchemaVersionError** should:

- Extend FileStorageError
- Include currentVersion and expectedVersion properties
- Override toJSON() to include version information
- Follow existing constructor pattern

## Acceptance Criteria

### SettingsValidationError Implementation

- ✅ Extends FileStorageError with proper inheritance
- ✅ Includes fieldErrors: Array<{ path: string; message: string }>
- ✅ Constructor follows pattern: (filePath, operation, fieldErrors, cause?)
- ✅ Descriptive error message includes field count
- ✅ toJSON() method includes fieldErrors in serialization
- ✅ Comprehensive unit tests cover all functionality

### SchemaVersionError Implementation

- ✅ Extends FileStorageError with proper inheritance
- ✅ Includes currentVersion and expectedVersion properties
- ✅ Constructor follows pattern: (filePath, operation, currentVersion, expectedVersion, cause?)
- ✅ Descriptive error message includes version mismatch details
- ✅ toJSON() method includes version information
- ✅ Comprehensive unit tests cover all functionality

### Integration Requirements

- ✅ Export both classes from errors/index.ts barrel file
- ✅ Update ErrorFactory if needed for creating these error types
- ✅ Error serialization works correctly for logging/reporting
- ✅ Stack traces are preserved and enhanced with context
- ✅ All tests pass and maintain existing test patterns

## Testing Requirements

### Unit Tests Must Cover

- Constructor with all parameters
- Error message generation
- Property access (fieldErrors, currentVersion, expectedVersion)
- toJSON() serialization
- Error inheritance and instanceof checks
- Stack trace preservation
- Edge cases (empty fieldErrors, invalid versions)

## Dependencies

None - this task is independent and builds on existing FileStorageError foundation.

## File Locations

- Follow existing error class patterns in `packages/shared/src/services/storage/errors/`
- Use existing test patterns and setup
- Reference FileStorageError.ts, InvalidJsonError.ts for implementation patterns

### Log

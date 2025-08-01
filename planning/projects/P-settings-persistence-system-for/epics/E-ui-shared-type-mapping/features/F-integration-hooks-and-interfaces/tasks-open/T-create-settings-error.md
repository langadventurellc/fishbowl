---
kind: task
id: T-create-settings-error
title: Create settings error transformation utilities
status: open
priority: normal
prerequisites:
  - T-create-combined-settings-types
  - T-implement-4
created: "2025-08-01T15:02:05.421258"
updated: "2025-08-01T15:02:05.421258"
schema_version: "1.1"
parent: F-integration-hooks-and-interfaces
---

# Create settings error transformation utilities

## Purpose

Implement utility functions that transform various error types (Zod validation, persistence errors, etc.) into user-friendly error messages suitable for UI display. These utilities ensure consistent error handling across the settings system.

## Implementation Details

### File Structure

```
packages/ui-shared/src/utils/settings/
├── transformPersistenceError.ts
├── transformValidationError.ts
├── createSettingsError.ts
├── index.ts
└── __tests__/
    ├── transformPersistenceError.test.ts
    ├── transformValidationError.test.ts
    └── createSettingsError.test.ts
```

### Implementation Requirements

#### File 1: transformPersistenceError.ts

```typescript
/**
 * Transforms persistence adapter errors into user-friendly messages
 * @param error - The error from persistence operations
 * @param operation - The operation that failed
 * @returns User-friendly error message
 */
export function transformPersistenceError(
  error: unknown,
  operation: "save" | "load" | "reset",
): string;
```

- Handle SettingsPersistenceError instances
- Handle generic Error instances
- Handle unknown error types
- Provide context-appropriate messages for each operation
- Never expose technical details or stack traces

#### File 2: transformValidationError.ts

```typescript
/**
 * Transforms Zod validation errors into user-friendly messages
 * @param error - Zod validation error
 * @param category - Settings category for context
 * @returns User-friendly error message or array of messages
 */
export function transformValidationError(
  error: ZodError,
  category?: SettingsCategory,
): string | string[];
```

- Parse Zod error issues
- Group errors by field
- Create readable messages without technical jargon
- Handle nested validation errors
- Provide field-specific context

#### File 3: createSettingsError.ts

```typescript
/**
 * Factory for creating consistent settings errors
 * @param message - Error message
 * @param code - Error code for programmatic handling
 * @param details - Additional error context
 */
export function createSettingsError(
  message: string,
  code: SettingsErrorCode,
  details?: Record<string, unknown>,
): SettingsError;

export enum SettingsErrorCode {
  VALIDATION_FAILED = "VALIDATION_FAILED",
  PERSISTENCE_FAILED = "PERSISTENCE_FAILED",
  MAPPING_FAILED = "MAPPING_FAILED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class SettingsError extends Error {
  constructor(
    message: string,
    public readonly code: SettingsErrorCode,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "SettingsError";
  }
}
```

### Error Message Guidelines

1. Use plain language, avoid technical terms
2. Provide actionable guidance when possible
3. Be specific about what went wrong
4. Don't expose system internals
5. Keep messages concise

### Example Transformations

```typescript
// Persistence error
"Failed to save settings" → "Unable to save your settings. Please try again."

// Validation error
"fontSize must be >= 12" → "Font size must be at least 12"

// Unknown error
"TypeError: Cannot read property..." → "An unexpected error occurred. Please try again."
```

### Unit Testing Requirements

Test each utility with:

1. Various error types and scenarios
2. Edge cases (null, undefined, malformed errors)
3. Message formatting and readability
4. No sensitive data leakage
5. Consistent output format

**IMPORTANT**: This task should only include unit tests. Do NOT create integration tests or performance tests.

## Acceptance Criteria

- ✓ Three utility functions handle all error transformation needs
- ✓ Error messages are user-friendly and actionable
- ✓ No technical details or stack traces in output
- ✓ Consistent error message format across utilities
- ✓ Custom SettingsError class with error codes
- ✓ Comprehensive unit tests for all scenarios
- ✓ All utilities exported from utils/settings/index.ts
- ✓ JSDoc documentation with examples
- ✓ All quality checks pass

## Dependencies

- SettingsCategory from combined types
- SettingsPersistenceError from adapter interface
- Zod for validation error types

## Security Considerations

- Never include stack traces in user messages
- Sanitize any dynamic content in errors
- Don't expose file paths or system details
- Log detailed errors separately from user display

### Log

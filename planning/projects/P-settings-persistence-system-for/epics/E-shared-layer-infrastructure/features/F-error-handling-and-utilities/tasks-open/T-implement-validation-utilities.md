---
kind: task
id: T-implement-validation-utilities
title: Implement validation utilities and type guards
status: open
priority: normal
prerequisites:
  - T-implement-missing
created: "2025-07-31T16:20:50.005542"
updated: "2025-07-31T16:20:50.005542"
schema_version: "1.1"
parent: F-error-handling-and-utilities
---

# Implement Validation Utilities and Type Guards

## Context

Create validation utilities and type guards that work with Zod schemas and provide additional validation helpers for the persistence system, including integration with the new SettingsValidationError.

## Implementation Details

### Files to Create

- `packages/shared/src/services/storage/utils/validationUtils.ts`
- `packages/shared/src/services/storage/utils/__tests__/validationUtils.test.ts`

### Technical Approach

Implement utilities that integrate with existing Zod schemas and error handling:

**validateWithSchema<T>(data: unknown, schema: z.ZodSchema<T>, context?: string): T**

- Validate data against Zod schema with enhanced error handling
- Convert Zod validation errors to SettingsValidationError with field paths
- Include context information for better error messages
- Return validated and typed data on success

**createFieldErrors(zodError: z.ZodError): Array<{ path: string; message: string }>**

- Transform Zod error issues into structured field error format
- Extract field paths and human-readable error messages
- Handle nested object validation errors
- Support array index paths and complex object structures

**isValidJson(value: string): boolean**

- Type guard to check if string is valid JSON
- Return boolean without throwing errors
- Use for conditional validation logic

**isValidSchemaVersion(version: string): boolean**

- Validate schema version string format (e.g., "1.0.0")
- Check semantic version pattern
- Return boolean for version compatibility checks

**parseSchemaVersion(version: string): { major: number; minor: number; patch: number } | null**

- Parse semantic version string into components
- Return structured version object or null for invalid versions
- Enable version comparison operations

**validateSettingsData<T>(data: unknown, schema: z.ZodSchema<T>, filePath: string, operation: string): T**

- High-level settings validation with complete error handling
- Automatically creates SettingsValidationError with proper context
- Integrates with existing error hierarchy
- Returns validated data or throws structured error

## Acceptance Criteria

### Zod Integration ✅ Must Implement

- ✅ Seamlessly works with existing Zod schemas in the project
- ✅ Converts Zod validation errors to SettingsValidationError format
- ✅ Preserves field path information for nested validation failures
- ✅ Maintains TypeScript type safety throughout validation process
- ✅ Supports complex schema validations (unions, transforms, etc.)

### Error Handling Integration ✅ Must Implement

- ✅ Creates SettingsValidationError with proper field error details
- ✅ Includes contextual information (file path, operation) in errors
- ✅ Provides human-readable error messages for each field
- ✅ Maintains error chaining and stack trace information
- ✅ Integrates with existing FileStorageError hierarchy

### Type Guards ✅ Must Implement

- ✅ Provides boolean checks that don't throw errors
- ✅ TypeScript type narrowing works correctly
- ✅ Efficient performance for frequent validation checks
- ✅ Clear and descriptive function names
- ✅ Handles edge cases gracefully (null, undefined, empty strings)

### Schema Version Support ✅ Must Implement

- ✅ Validates semantic version format (major.minor.patch)
- ✅ Parses version strings into structured components
- ✅ Enables version comparison and compatibility checking
- ✅ Works with existing CURRENT_SCHEMA_VERSION constant
- ✅ Supports schema migration validation

### High-Level Validation ✅ Must Implement

- ✅ Provides convenient validation functions for common scenarios
- ✅ Automatically handles error conversion and context
- ✅ Integrates with FileStorageService validation needs
- ✅ Maintains consistent error handling patterns
- ✅ Supports generic validation for different schema types

## Testing Requirements

### Unit Tests Must Cover

**Zod Schema Integration:**

- Valid data passing schema validation
- Various Zod validation failure scenarios
- Nested object validation errors
- Array validation with index paths
- Union and transform schema validations
- Field path extraction for complex schemas

**Error Conversion:**

- Single field validation errors
- Multiple field validation errors
- Nested object field errors
- Array element validation errors
- Complex error message generation
- SettingsValidationError creation with proper context

**Type Guards:**

- Valid JSON strings of various complexity
- Invalid JSON strings (malformed, incomplete)
- Empty strings, null, and undefined inputs
- Valid and invalid semantic version strings
- Edge cases for version parsing

**Schema Version Utilities:**

- Valid semantic versions (1.0.0, 2.1.3, etc.)
- Invalid version formats
- Version component extraction
- Edge cases (missing components, non-numeric parts)

**High-Level Validation:**

- Successful validation with various schemas
- Validation failures with proper error context
- Integration with existing persistedSettingsSchema
- File path and operation context in errors

### Integration Tests

- Work with actual Zod schemas from the project
- Error integration with existing error handling
- TypeScript type safety validation
- Performance with complex schema validations

## Dependencies

- Zod library for schema validation
- SettingsValidationError (requires T-implement-missing completion)
- Existing schema definitions from types/settings/
- FileStorageError hierarchy

## File Locations

- Add to `packages/shared/src/services/storage/utils/`
- Use existing schema definitions from types/settings/
- Follow error handling patterns from services/storage/errors/
- Export from utils/index.ts barrel file

### Log

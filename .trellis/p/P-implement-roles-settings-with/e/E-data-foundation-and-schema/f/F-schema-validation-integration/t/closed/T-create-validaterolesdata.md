---
id: T-create-validaterolesdata
title: Create validateRolesData utility function
status: done
priority: high
parent: F-schema-validation-integration
prerequisites: []
affectedFiles:
  packages/shared/src/services/storage/utils/validateRolesData.ts:
    Created new validation utility function that follows validateSettingsData
    pattern exactly, with comprehensive JSDoc documentation and proper error
    handling
  packages/shared/src/services/storage/utils/index.ts: Added export for
    validateRolesData to make it available for import by other modules
  packages/shared/src/services/storage/utils/__tests__/validateRolesData.test.ts:
    Created comprehensive unit test suite with 24 test cases covering all
    validation scenarios, error handling, edge cases, and integration with
    existing validation infrastructure
log:
  - Successfully implemented validateRolesData utility function following the
    exact pattern established by validateSettingsData(). The function provides
    comprehensive validation for roles data with enhanced error handling,
    including field-level error reporting with detailed context, graceful
    handling of null timestamps (for direct JSON edits), and operation/file path
    context for debugging. All 24 unit tests pass, covering valid data
    scenarios, invalid data with specific error cases, edge cases, and error
    context preservation. The function integrates seamlessly with existing
    validation infrastructure using SettingsValidationError and
    validateWithSchema.
schema: v1.0
childrenIds: []
created: 2025-08-10T03:02:10.114Z
updated: 2025-08-10T03:02:10.114Z
---

# Create validateRolesData Utility Function

## Context

Create a standalone validation utility function for roles data that follows the exact patterns established by `validateSettingsData()` in the existing codebase. This function will provide the core validation integration between the existing `rolesSettingsSchema` and the established error handling patterns.

## Implementation Requirements

### Function Specification

- **Location**: `packages/shared/src/services/storage/utils/validateRolesData.ts`
- **Pattern**: Follow `validateSettingsData()` function structure exactly
- **Schema**: Use existing `persistedRolesSettingsSchema` from `rolesSettingsSchema.ts`
- **Error Handling**: Use existing `SettingsValidationError` class

### Function Signature

```typescript
export function validateRolesData<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  filePath: string,
  operation: string,
): T;
```

### Core Functionality

- Validate roles data against Zod schema using `schema.safeParse()`
- Convert Zod validation errors to `SettingsValidationError` with helpful field errors
- Handle null/undefined timestamps gracefully (they should be optional)
- Provide clear error messages for each validation failure
- Include file path and operation context in errors

### Error Handling Requirements

- Use existing `SettingsValidationError` class for consistency
- Format Zod errors using existing `createFieldErrors()` utility
- Provide field-specific error messages with paths
- Handle unexpected validation errors gracefully
- Include sanitized data values in error reporting (no sensitive data)

## Acceptance Criteria

- [ ] Function created in correct location following existing file structure
- [ ] Follows exact pattern of `validateSettingsData()` function
- [ ] Uses existing `persistedRolesSettingsSchema` for validation
- [ ] Handles null timestamps gracefully without validation errors
- [ ] Provides clear, actionable error messages for all validation failures
- [ ] Integrates with existing error handling infrastructure
- [ ] Includes comprehensive JSDoc documentation
- [ ] All TypeScript types properly defined with no `any` usage
- [ ] Function exported and ready for use by other modules

## Testing Requirements

- Unit tests for valid roles data validation
- Unit tests for invalid roles data with specific error scenarios
- Tests for null timestamp handling
- Tests for edge cases (empty arrays, malformed data)
- Error message format validation tests

## Dependencies

- Import `persistedRolesSettingsSchema` from existing schema file
- Import `SettingsValidationError` from existing error infrastructure
- Import `createFieldErrors` utility from existing validation utils
- Follow patterns from `validateSettingsData()` implementation

## Files to Reference

- `packages/shared/src/services/storage/utils/validateSettingsData.ts` (pattern)
- `packages/shared/src/types/settings/rolesSettingsSchema.ts` (schema)
- `packages/shared/src/services/storage/errors/SettingsValidationError.ts` (errors)

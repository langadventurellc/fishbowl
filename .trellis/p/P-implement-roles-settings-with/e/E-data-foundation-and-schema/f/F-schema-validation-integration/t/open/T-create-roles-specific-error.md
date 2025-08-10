---
id: T-create-roles-specific-error
title: Create roles-specific error formatting functions
status: open
priority: high
parent: F-schema-validation-integration
prerequisites:
  - T-create-validaterolesdata
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-10T03:02:29.422Z
updated: 2025-08-10T03:02:29.422Z
---

# Create Roles-Specific Error Formatting Functions

## Context

Create error formatting utilities specifically for roles validation that provide user-friendly error messages. These functions should follow the existing patterns used in `SettingsRepository.formatZodErrors()` and integrate with the roles validation workflow.

## Implementation Requirements

### Primary Function: formatRolesValidationErrors

- **Location**: `packages/shared/src/services/storage/utils/formatRolesValidationErrors.ts`
- **Purpose**: Convert Zod errors to user-friendly roles-specific error messages
- **Pattern**: Follow `SettingsRepository.formatZodErrors()` structure

### Function Specifications

```typescript
export function formatRolesValidationErrors(
  zodError: z.ZodError,
): Array<{ path: string; message: string }> {
  // Convert Zod issues to field errors with roles-specific messaging
}

export function createRolesValidationSummary(
  fieldErrors: Array<{ path: string; message: string }>,
): string {
  // Create user-friendly summary of validation errors
}
```

### Roles-Specific Error Messages

- **Name validation**: "Role name is required and must be 1-100 characters"
- **Description validation**: "Role description cannot exceed 500 characters"
- **System prompt validation**: "System prompt cannot exceed 5000 characters"
- **ID validation**: "Role ID is required and cannot be empty"
- **Timestamp validation**: "Invalid timestamp format (use ISO datetime or leave empty)"
- **Array validation**: "Roles must be provided as an array"

### Error Message Features

- Clear field identification (e.g., "Role name", not just "name")
- Specific character limits mentioned in error messages
- Actionable guidance for fixing errors
- Context about whether fields are required or optional
- Special handling for null/missing timestamps (should not error)

## Acceptance Criteria

- [ ] `formatRolesValidationErrors()` function created following existing patterns
- [ ] Roles-specific error messages for all schema validation rules
- [ ] Clear, user-friendly error messaging with specific guidance
- [ ] Character count information included in length validation errors
- [ ] Null timestamp handling does not generate error messages
- [ ] Function integrates seamlessly with `validateRolesData()` function
- [ ] Summary function provides helpful overview of multiple errors
- [ ] All error messages tested for clarity and usefulness
- [ ] TypeScript types properly defined for all error structures
- [ ] JSDoc documentation for all public functions

## Integration Requirements

- Works with `SettingsValidationError` from existing infrastructure
- Integrates with `validateRolesData()` function created in previous task
- Follows existing error formatting patterns for consistency
- Provides same error structure as other validation utilities

## Testing Requirements

- Unit tests for each type of validation error scenario
- Tests for multiple simultaneous validation errors
- Tests for null timestamp scenarios (should not generate errors)
- Error message content validation (check for helpful, specific text)
- Integration tests with `validateRolesData()` function

## Files to Reference

- `packages/shared/src/repositories/settings/SettingsRepository.ts` (formatZodErrors method)
- `packages/shared/src/types/settings/rolesSettingsSchema.ts` (validation rules)
- `packages/shared/src/services/storage/utils/createFieldErrors.ts` (existing pattern)

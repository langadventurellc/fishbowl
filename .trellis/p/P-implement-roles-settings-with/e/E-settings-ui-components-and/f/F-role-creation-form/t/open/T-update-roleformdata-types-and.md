---
id: T-update-roleformdata-types-and
title: Update RoleFormData types and ensure validation compatibility
status: open
priority: medium
parent: F-role-creation-form
prerequisites:
  - T-update-role-schema-to-match
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T21:38:59.384Z
updated: 2025-08-12T21:38:59.384Z
---

# Update RoleFormData Types and Validation Compatibility

## Context

With the schema changes to make `systemPrompt` required and increase character limits, we need to ensure all TypeScript types and validation utilities are updated consistently. The `RoleFormData` type is derived from the schema, but other related types and validation functions may need updates.

## Implementation Requirements

### Type Updates Required

1. **Verify RoleFormData Type**: Ensure it correctly reflects required systemPrompt
2. **Update Initial Data Types**: Ensure initialData properly handles systemPrompt
3. **Validation Utilities**: Update any validation helpers to support new requirements
4. **Type Exports**: Ensure all necessary types are exported from ui-shared

### Files to Review and Update

#### 1. RoleFormData Type

File: `packages/ui-shared/src/types/settings/RoleFormData.ts`

- Verify type correctly infers required systemPrompt from updated schema
- Ensure TypeScript compilation works with schema changes

#### 2. Validation Utilities

File: `packages/shared/src/services/storage/utils/roles/validateRoleFormData.ts`

- Update validation function to handle required systemPrompt
- Ensure validation logic matches schema requirements
- Update error handling for systemPrompt validation

#### 3. Component Props Types

Files to check:

- `packages/ui-shared/src/types/settings/CreateRoleFormProps.ts`
- `packages/ui-shared/src/types/settings/RoleFormModalProps.ts`
- Ensure `initialData` types support systemPrompt field

### Validation Logic Updates

#### Update validateRoleFormData Function

```typescript
// Ensure function validates systemPrompt as required
export const validateRoleFormData = (data: RoleFormData): ValidationResult => {
  // Add systemPrompt validation if not handled by schema
  if (!data.systemPrompt || data.systemPrompt.trim().length === 0) {
    return {
      isValid: false,
      errors: { systemPrompt: "System prompt is required" },
    };
  }

  if (data.systemPrompt.length > 5000) {
    return {
      isValid: false,
      errors: { systemPrompt: "System prompt must be 5000 characters or less" },
    };
  }

  // Existing validation logic for name and description
};
```

### Type Safety Verification

1. **Compilation Check**: Ensure TypeScript compiles without errors
2. **Type Inference**: Verify RoleFormData correctly infers systemPrompt as required
3. **Props Compatibility**: Ensure component props accept systemPrompt in initialData
4. **Store Integration**: Verify types work with roles store expectations

## Technical Approach

1. **Schema Update Impact**: Review how schema changes affect derived types
2. **Type Generation**: Ensure Zod schema properly generates TypeScript types
3. **Validation Sync**: Keep validation utilities in sync with schema
4. **Export Verification**: Ensure all types are properly exported and available
5. **Integration Testing**: Test type compatibility across packages

## Acceptance Criteria

- [ ] TypeScript compilation succeeds without type errors
- [ ] RoleFormData type correctly shows systemPrompt as required (not optional)
- [ ] validateRoleFormData function handles systemPrompt validation
- [ ] Component props types support systemPrompt in initialData
- [ ] No type mismatches between schema, validation, and components
- [ ] Edit mode properly types systemPrompt as available in initialData
- [ ] Form submission types match store expectations
- [ ] All validation error types include systemPrompt field errors

## Dependencies

- Requires `T-update-role-schema-to-match` for schema foundation
- Should be completed before form integration tasks

## Security Considerations

- Type safety prevents invalid data from reaching store layer
- Validation functions provide additional security layer beyond schema
- Required field typing prevents accidental omission of systemPrompt

## Testing Requirements

- TypeScript compilation test with strict mode
- Unit tests for validateRoleFormData with systemPrompt scenarios
- Type checking for form integration scenarios
- Verify error types match validation function outputs
- Test initialData typing in edit mode scenarios

## Implementation Steps

1. Run TypeScript compilation to identify type issues
2. Update validation utilities to match schema requirements
3. Verify all type exports are correct and available
4. Test type compatibility with existing form components
5. Ensure error handling types are consistent
6. Update any type documentation or comments

## Related Files

- `packages/ui-shared/src/types/settings/RoleFormData.ts`
- `packages/shared/src/services/storage/utils/roles/validateRoleFormData.ts`
- `packages/ui-shared/src/types/settings/CreateRoleFormProps.ts`
- `packages/ui-shared/src/types/settings/RoleFormModalProps.ts`
- `packages/ui-shared/src/schemas/roleSchema.ts`

---
id: T-update-role-schema-to-match
title: Update role schema to match feature requirements
status: done
priority: high
parent: F-role-creation-form
prerequisites: []
affectedFiles:
  packages/ui-shared/src/schemas/roleSchema.ts: Updated character limits from
    50/200/2000 to 100/500/5000 and made systemPrompt required by removing
    .optional()
  packages/ui-shared/src/mapping/roles/utils/normalizeRoleFields.ts:
    Updated systemPrompt character limit from 2000 to 5000 in documentation and
    implementation
  packages/ui-shared/src/data/sampleRoles.ts: Added systemPrompt field to all sample roles with appropriate default values
  packages/ui-shared/src/mapping/roles/mapSingleRolePersistenceToUI.ts: Updated mapping to provide default systemPrompt value instead of undefined
  apps/desktop/src/components/settings/roles/RoleNameInput.tsx: Updated character limit validation and display from 50 to 100 characters
  apps/desktop/src/components/settings/roles/RoleDescriptionTextarea.tsx:
    Updated default maxLength from 200 to 500 characters and updated
    documentation
  apps/desktop/src/components/settings/roles/CreateRoleForm.tsx: Updated maxLength prop passed to RoleDescriptionTextarea from 200 to 500
  packages/ui-shared/src/schemas/__tests__/roleSchema.test.ts:
    Updated all tests to reflect new character limits and required systemPrompt
    field
  packages/ui-shared/src/mapping/roles/__tests__/mapRolesUIToPersistence.test.ts: Added systemPrompt field to test objects
  packages/ui-shared/src/mapping/roles/__tests__/mapSingleRoleUIToPersistence.test.ts:
    Updated test expectations and character limits, added systemPrompt to test
    objects
  packages/ui-shared/src/mapping/roles/__tests__/mapSingleRolePersistenceToUI.test.ts: Updated character limits and default value expectations in tests
  packages/ui-shared/src/mapping/roles/__tests__/mapRolesPersistenceToUI.test.ts: Updated character limits in field truncation tests
  packages/ui-shared/src/mapping/roles/utils/__tests__/normalizeRoleFields.test.ts: Updated systemPrompt character limit expectations from 2000 to 5000
  packages/ui-shared/src/stores/__tests__/rolesStore.test.ts: Fixed test data
    issues including duplicate role names and sample role definitions to ensure
    proper test behavior
  packages/ui-shared/src/data/__tests__/sampleRoles.test.ts: Updated validation test to include systemPrompt field
log:
  - "Successfully updated role schema to match feature requirements. Made
    systemPrompt required and updated character limits (name: 100, description:
    500, systemPrompt: 5000). Updated all related code including normalization
    utilities, UI components, tests, and sample data. Fixed all test failures
    properly. All quality checks pass and shared packages rebuilt."
schema: v1.0
childrenIds: []
created: 2025-08-12T21:37:20.601Z
updated: 2025-08-12T21:37:20.601Z
---

# Update Role Schema to Match Feature Requirements

## Context

The current `roleSchema` in `packages/ui-shared/src/schemas/roleSchema.ts` has inconsistencies with the feature specification:

- `systemPrompt` field is marked as optional but should be required
- Maximum length is 2000 characters but feature spec requires 5000 characters
- Field requirements don't match the comprehensive feature specification

## Implementation Requirements

### Schema Updates Required

1. **System Prompt Field**: Change from optional to required with proper validation
2. **Character Limits**: Update to match feature specification (5000 chars for systemPrompt)
3. **Validation Messages**: Ensure error messages are clear and helpful

### Specific Changes to `roleSchema.ts`

```typescript
systemPrompt: z.string()
  .min(1, "System prompt is required")
  .max(5000, "System prompt must be 5000 characters or less")
  .refine(
    (val) => val.trim().length > 0,
    "System prompt cannot be only whitespace",
  );
// Remove .optional() to make it required
```

### Technical Approach

1. Open `packages/ui-shared/src/schemas/roleSchema.ts`
2. Modify the `systemPrompt` field validation rules
3. Remove the `.optional()` modifier to make it required
4. Update character limit from 2000 to 5000
5. Ensure validation messages are consistent with other fields

## Acceptance Criteria

- [ ] System prompt field is required (validation fails if empty/whitespace)
- [ ] Maximum character limit is 5000 characters
- [ ] Validation error messages are clear and helpful
- [ ] Schema changes don't break existing TypeScript compilation
- [ ] All existing tests continue to pass
- [ ] Schema validation works correctly in development

## Dependencies

- None - this is a foundational change needed for other form tasks

## Security Considerations

- Validate input length limits to prevent oversized data
- Ensure sanitization of user input through Zod validation
- Character limit enforcement protects against potential memory issues

## Testing Requirements

- Verify schema validation with valid system prompt (1-5000 chars)
- Test validation failure with empty system prompt
- Test validation failure with system prompt over 5000 chars
- Confirm TypeScript types are updated correctly

---
id: T-update-createpersonalityformpr
title: Update CreatePersonalityFormProps to match roles pattern
status: open
priority: high
parent: F-refactor-unified-personalityfo
prerequisites:
  - T-create-personalityformmodalpro
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T15:57:39.285Z
updated: 2025-08-17T15:57:39.285Z
---

# Update CreatePersonalityFormProps to Match Roles Pattern

## Context

Update the existing CreatePersonalityFormProps interface to match the CreateRoleFormProps pattern, supporting both create and edit modes with proper state management integration.

## Acceptance Criteria

### Interface Updates

- [ ] Update `CreatePersonalityFormProps.ts` in `packages/ui-shared/src/types/settings/`
- [ ] Add `mode: "create" | "edit"` property
- [ ] Change `initialData?: Partial<PersonalityFormData>` to `initialData?: PersonalityViewModel`
- [ ] Add `existingPersonalities?: PersonalityViewModel[]` for validation
- [ ] Add `isLoading?: boolean = false` property
- [ ] Keep existing `onSave` and `onCancel` methods
- [ ] Update JSDoc documentation to reflect new capabilities

### Type Safety

- [ ] Ensure PersonalityViewModel import is available
- [ ] Verify all imports resolve correctly
- [ ] Update any existing references to maintain compatibility
- [ ] Follow TypeScript strict mode requirements

### Implementation Details

- Match the CreateRoleFormProps interface structure exactly
- Support both create and edit modes like roles form
- Include proper default values documentation
- Follow existing project conventions for optional props

### Testing Requirements

- Include unit tests verifying interface compliance
- Test TypeScript compilation with new interface
- Verify backward compatibility where possible

## Files to Modify

- `packages/ui-shared/src/types/settings/CreatePersonalityFormProps.ts`

## Reference Implementation

Base updates on `packages/ui-shared/src/types/settings/CreateRoleFormProps.ts` structure and patterns.

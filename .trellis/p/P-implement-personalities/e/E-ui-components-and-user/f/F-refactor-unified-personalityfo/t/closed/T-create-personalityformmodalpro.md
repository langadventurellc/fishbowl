---
id: T-create-personalityformmodalpro
title: Create PersonalityFormModalProps interface
status: done
priority: high
parent: F-refactor-unified-personalityfo
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/settings/PersonalityFormModalProps.ts:
    Created new interface file with PersonalityFormModalProps following
    RoleFormModalProps pattern
  packages/ui-shared/src/types/settings/__tests__/PersonalityFormModalProps.test.ts:
    Added comprehensive unit tests for interface type checking and import
    validation
log:
  - Successfully created PersonalityFormModalProps interface following the exact
    pattern of RoleFormModalProps. The interface includes all required
    properties (isOpen, onOpenChange, mode, onSave) and optional properties
    (personality, isLoading) with proper TypeScript typing. Added comprehensive
    unit tests covering interface structure, type checking, and import
    validation. All quality checks pass including linting, formatting, and type
    compilation.
schema: v1.0
childrenIds: []
created: 2025-08-17T15:57:27.543Z
updated: 2025-08-17T15:57:27.543Z
---

# Create PersonalityFormModalProps Interface

## Context

Following the exact pattern established by RoleFormModalProps, create the interface for the PersonalityFormModal wrapper component that will handle modal state, unsaved changes protection, and accessibility features.

## Acceptance Criteria

### Interface Requirements

- [ ] Create `PersonalityFormModalProps.ts` in `packages/ui-shared/src/types/settings/`
- [ ] Interface matches RoleFormModalProps structure exactly:
  - `isOpen: boolean`
  - `onOpenChange: (open: boolean) => void`
  - `mode: "create" | "edit"`
  - `personality?: PersonalityViewModel`
  - `onSave: (data: PersonalityFormData) => void`
  - `isLoading?: boolean`
- [ ] Proper imports for PersonalityViewModel and PersonalityFormData
- [ ] JSDoc documentation following project conventions

### Implementation Details

- Use the same interface structure as RoleFormModalProps
- Import PersonalityViewModel from existing types
- Import PersonalityFormData from existing types
- Follow existing file naming and documentation patterns

### Testing Requirements

- Include unit tests to verify interface type checking
- Ensure proper TypeScript compilation
- Verify imports resolve correctly

## Files to Create

- `packages/ui-shared/src/types/settings/PersonalityFormModalProps.ts`

## Reference Implementation

Base this exactly on `packages/ui-shared/src/types/settings/RoleFormModalProps.ts` but adapted for personality types.

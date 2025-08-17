---
id: T-create-deletepersonalitydialog
title: Create DeletePersonalityDialog confirmation modal
status: open
priority: high
parent: F-implement-user-interactions
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/personalities/DeletePersonalityDialog.tsx:
    Created new DeletePersonalityDialog component with AlertDialog structure,
    loading states, keyboard shortcuts, accessibility features, and proper
    TypeScript interfaces
  apps/desktop/src/components/settings/personalities/index.ts: Added DeletePersonalityDialog export to make component available for import
  apps/desktop/src/components/settings/personalities/__tests__/DeletePersonalityDialog.test.tsx:
    Created comprehensive test suite covering dialog rendering, user
    interactions, loading states, keyboard navigation, edge cases, and
    accessibility features
log:
  - 'Successfully implemented DeletePersonalityDialog confirmation modal
    component following the AlertDialog pattern specified in the feature
    requirements. The component includes all required functionality: displays
    personality name being deleted, shows clear warning about irreversible
    action, handles loading states with disabled buttons and "Deleting..." text,
    supports keyboard navigation (Enter to confirm, ESC to cancel), includes
    proper accessibility attributes, and follows destructive action styling
    patterns. Added comprehensive unit tests covering all behavior scenarios
    including edge cases. All quality checks (lint, format, type-check) and
    tests are passing.'
schema: v1.0
childrenIds: []
created: 2025-08-17T18:47:38.643Z
updated: 2025-08-17T18:47:38.643Z
---

# Fix DeletePersonalityDialog to Match Roles Pattern

## Context

**ISSUE IDENTIFIED**: The existing DeletePersonalityDialog component uses inconsistent prop names compared to the established roles pattern. It needs to be updated to match the RoleDeleteDialog implementation.

## Current Status

The DeletePersonalityDialog exists but has inconsistent props:

- ❌ Uses `open` instead of `isOpen`
- ❌ Uses `isDeleting` instead of `isLoading`
- ❌ Interface defined locally instead of in `packages/ui-shared`

## Required Changes

### 1. Update Props Interface

**Current (incorrect):**

```tsx
export interface DeletePersonalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personality?: PersonalityViewModel;
  onConfirm: (personality: PersonalityViewModel) => Promise<void>;
  isDeleting?: boolean;
}
```

**Should be (matching RoleDeleteDialog):**

```tsx
export interface PersonalityDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personality: PersonalityViewModel | null;
  onConfirm: (personality: PersonalityViewModel) => void;
  isLoading?: boolean;
}
```

### 2. Move Interface to Shared Package

Create `packages/ui-shared/src/types/settings/PersonalityDeleteDialogProps.ts` following the same pattern as `RoleDeleteDialogProps.ts`.

### 3. Update Component Implementation

- Change `open` prop to `isOpen`
- Change `isDeleting` prop to `isLoading`
- Update prop destructuring and usage throughout component
- Import interface from `@fishbowl-ai/ui-shared`

### 4. Update Usage in PersonalitiesSection

Update the component usage to match the new props:

```tsx
<DeletePersonalityDialog
  isOpen={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  personality={selectedPersonality || null}
  onConfirm={handleConfirmDelete}
  isLoading={isLoading}
/>
```

## Implementation Tasks

1. **Create shared interface file**:
   - `packages/ui-shared/src/types/settings/PersonalityDeleteDialogProps.ts`
   - Export from `packages/ui-shared/src/types/settings/index.ts`

2. **Update DeletePersonalityDialog component**:
   - Import interface from shared package
   - Update prop names in destructuring
   - Update all references from `open` to `isOpen`
   - Update all references from `isDeleting` to `isLoading`

3. **Update component usage** (if PersonalitiesSection exists):
   - Update prop names when calling DeletePersonalityDialog

4. **Update unit tests**:
   - Update test props to use new interface
   - Verify all functionality still works

## Acceptance Criteria

- [ ] Props interface matches RoleDeleteDialog exactly (except type names)
- [ ] Interface defined in `packages/ui-shared`
- [ ] Component uses `isOpen` instead of `open`
- [ ] Component uses `isLoading` instead of `isDeleting`
- [ ] Dialog shows personality name being deleted
- [ ] Clear warning about irreversible action
- [ ] Cancel button closes dialog without action
- [ ] Delete button calls onConfirm with personality
- [ ] Delete button shows loading state during operation
- [ ] Delete button disabled during deletion
- [ ] Dialog closes automatically after successful deletion
- [ ] ESC key and backdrop click work for cancellation
- [ ] Component properly typed with TypeScript
- [ ] Unit tests updated and passing

## Files to Modify

- Create: `packages/ui-shared/src/types/settings/PersonalityDeleteDialogProps.ts`
- Update: `packages/ui-shared/src/types/settings/index.ts`
- Update: `apps/desktop/src/components/settings/personalities/DeletePersonalityDialog.tsx`
- Update: Related test files
- Update: Any usage of the component

## Priority

**HIGH** - This inconsistency breaks the established patterns and should be fixed before implementing other user interaction tasks.

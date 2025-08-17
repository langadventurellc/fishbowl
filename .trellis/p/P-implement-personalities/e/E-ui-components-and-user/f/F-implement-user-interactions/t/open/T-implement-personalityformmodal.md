---
id: T-implement-personalityformmodal
title: Implement PersonalityFormModal with dialog structure
status: open
priority: high
parent: F-implement-user-interactions
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T18:47:21.159Z
updated: 2025-08-17T18:47:21.159Z
---

# Implement PersonalityFormModal Component

## Context

**IMPORTANT**: The PersonalityFormModal component already exists and correctly follows the roles pattern. This task should verify the existing implementation matches the established patterns rather than recreating it.

## Current Status

The PersonalityFormModal already exists at `apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx` and follows the correct patterns from the roles section. The component uses the proper props interface defined in `packages/ui-shared`.

## Verification Requirements

### Modal Structure

- ✅ Uses shadcn/ui Dialog components (Dialog, DialogContent, DialogHeader, DialogTitle)
- ✅ Proper props interface matching roles pattern:
  ```tsx
  interface PersonalityFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    personality?: PersonalityViewModel;
    onSave: (data: PersonalityFormData) => void;
    isLoading?: boolean;
  }
  ```
- ✅ Modal title changes based on mode: "Create Personality" vs "Edit Personality"
- ✅ Renders PersonalityForm inside DialogContent
- ✅ Handles backdrop clicks and ESC key to close modal

### Features

- ✅ Modal backdrop prevents background scrolling
- ✅ ESC key closes modal (built into Dialog component)
- ✅ Clicking backdrop closes modal
- ✅ Dialog animates smoothly on open/close
- ✅ Focus is trapped within modal when open
- ✅ Unsaved changes protection
- ✅ Keyboard shortcuts (Ctrl/Cmd+S to save)

## Acceptance Criteria

- [x] Component exists and follows roles pattern exactly
- [x] Props interface matches `RoleFormModalProps` structure
- [x] Modal renders PersonalityForm with correct props
- [x] Modal title updates based on create/edit mode
- [x] ESC key closes modal properly
- [x] Backdrop click closes modal
- [x] Modal prevents background scrolling when open
- [x] Focus is trapped within modal
- [x] Animation works smoothly
- [x] Component properly typed with TypeScript
- [x] Integration with existing store patterns

## Testing Requirements

- Verify modal opens and closes properly
- Test title changes based on mode
- Test PersonalityForm receives correct props
- Test keyboard navigation (ESC key)
- Test backdrop click behavior
- Test focus management
- Test unsaved changes protection

## Dependencies

- PersonalityForm component (available)
- shadcn/ui Dialog components
- PersonalityViewModel and PersonalityFormData types
- PersonalityFormModalProps from @fishbowl-ai/ui-shared

## Files to Verify

- ✅ `apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx` (exists)
- ✅ `packages/ui-shared/src/types/settings/PersonalityFormModalProps.ts` (exists)
- Existing unit tests (verify completeness)

## Notes

This component already correctly implements the roles pattern. Any changes should focus on ensuring consistency with the roles implementation rather than recreating functionality.

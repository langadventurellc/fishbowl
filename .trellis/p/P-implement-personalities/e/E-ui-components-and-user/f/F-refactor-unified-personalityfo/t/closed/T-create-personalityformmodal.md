---
id: T-create-personalityformmodal
title: Create PersonalityFormModal wrapper component
status: done
priority: medium
parent: F-refactor-unified-personalityfo
prerequisites:
  - T-refactor-createpersonalityform
affectedFiles:
  apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx:
    Created new PersonalityFormModal component that wraps PersonalityForm with
    modal state management, unsaved changes protection, focus management, and
    keyboard shortcuts following the exact RoleFormModal pattern
  packages/ui-shared/src/hooks/usePersonalities.ts: Created new usePersonalities
    hook to provide a convenient interface to the personalities store with
    memoized callbacks, matching the useRoles pattern
  packages/ui-shared/src/hooks/index.ts: Added export for usePersonalities hook
  packages/ui-shared/src/types/settings/index.ts: Added export for PersonalityFormModalProps interface
log:
  - Successfully implemented PersonalityFormModal wrapper component following
    the exact pattern of RoleFormModal. Created the modal interface with
    comprehensive features including unsaved changes protection, keyboard
    shortcuts, focus management, accessibility support, and proper integration
    with the PersonalityForm component. Also created the missing
    usePersonalities hook to maintain consistency with the roles pattern.
schema: v1.0
childrenIds: []
created: 2025-08-17T15:58:42.097Z
updated: 2025-08-17T15:58:42.097Z
---

# Create PersonalityFormModal Wrapper Component

## Context

Create a PersonalityFormModal wrapper component that follows the exact pattern of RoleFormModal, providing modal state management, unsaved changes protection, focus management, accessibility features, and keyboard shortcuts.

## Acceptance Criteria

### Component Structure

- [ ] Create `PersonalityFormModal.tsx` in `apps/desktop/src/components/settings/personalities/`
- [ ] Accept `PersonalityFormModalProps` interface
- [ ] Wrap the refactored `PersonalityForm` component
- [ ] Follow RoleFormModal component structure exactly

### Modal State Management

- [ ] Use Dialog component for modal container
- [ ] Handle `isOpen` prop for modal visibility
- [ ] Implement `onOpenChange` callback for parent communication
- [ ] Support controlled modal state from parent component

### Unsaved Changes Protection

- [ ] Import and use `useConfirmationDialog` hook
- [ ] Import and use `useUnsavedChanges` hook
- [ ] Show confirmation dialog when closing with unsaved changes
- [ ] Use "Unsaved Changes" dialog with appropriate messaging
- [ ] Configure "Close Without Saving" vs "Continue Editing" options

### Focus Management and Accessibility

- [ ] Import and use `useFocusTrap` hook for modal focus containment
- [ ] Set up triggerRef to restore focus on modal close
- [ ] Configure initial focus selector (`[data-personality-modal-initial-focus]`)
- [ ] Implement screen reader announcements on modal open
- [ ] Add appropriate ARIA labels and descriptions

### Keyboard Shortcuts

- [ ] Implement Ctrl/Cmd+S keyboard shortcut for form submission
- [ ] Handle Escape key for modal close (via DialogContent)
- [ ] Prevent default browser behavior for save shortcut
- [ ] Trigger form submission through DOM event dispatch

### Form Integration

- [ ] Pass through mode, personality, and loading props to PersonalityForm
- [ ] Handle form save callback and close modal on success
- [ ] Handle form cancel callback with unsaved changes protection
- [ ] Manage loading states during form submission

### Modal Styling and Layout

- [ ] Use `personality-form-modal` className for CSS targeting
- [ ] Set max-width to `max-w-2xl` (matching roles modal)
- [ ] Set max-height to `max-h-[80vh]` with `overflow-y-auto`
- [ ] Apply proper dialog content styling

### Event Handling

- [ ] Implement `handleOpenChange` with unsaved changes checking
- [ ] Implement `handleCancel` to trigger modal close
- [ ] Implement `handleSave` to process save and close modal
- [ ] Add proper error handling for save operations

### Screen Reader Support

- [ ] Announce modal state changes to screen readers
- [ ] Use appropriate politeness levels for announcements
- [ ] Provide context about create vs edit modes
- [ ] Include navigation instructions in announcements

### Testing Requirements

- [ ] Test modal open/close behavior
- [ ] Test unsaved changes protection flow
- [ ] Test keyboard shortcuts functionality
- [ ] Test focus management and restoration
- [ ] Test accessibility features with screen readers
- [ ] Test integration with PersonalityForm component

## Files to Create

- `apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx`

## Implementation Pattern

Follow the RoleFormModal implementation exactly:

1. State management with useConfirmationDialog and useUnsavedChanges
2. Focus trap setup with initial focus configuration
3. Screen reader announcements on modal state changes
4. Keyboard shortcuts with proper event handling
5. Unsaved changes protection with confirmation dialog
6. Proper callback handling for save/cancel operations

## Reference Implementation

Base the implementation on `apps/desktop/src/components/settings/roles/RoleFormModal.tsx` structure and patterns.

## Integration Notes

This modal will be used by PersonalitiesSection to handle create and edit operations, replacing the current direct form usage.

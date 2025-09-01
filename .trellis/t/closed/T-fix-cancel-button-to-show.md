---
id: T-fix-cancel-button-to-show
title: Fix cancel button to show unsaved changes confirmation in SettingsFormModal
status: done
priority: medium
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/common/SettingsFormModal.tsx:
    Modified to use forwardRef, added useImperativeHandle to expose handleClose
    method, imported and rendered ConfirmationDialog component to display
    confirmation dialogs
  apps/desktop/src/components/settings/common/SettingsFormModalRef.ts:
    Created new interface file defining SettingsFormModalRef with async
    handleClose method
  apps/desktop/src/components/settings/agents/AgentFormModal.tsx:
    Added modal ref, imported SettingsFormModalRef, updated handleCancel to use
    modal's handleClose method, passed ref to SettingsFormModal
  apps/desktop/src/components/settings/roles/RoleFormModal.tsx:
    Added modal ref, imported SettingsFormModalRef, updated handleCancel to use
    modal's handleClose method, passed ref to SettingsFormModal
  apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx:
    Added modal ref, imported SettingsFormModalRef, updated handleCancel to use
    modal's handleClose method, passed ref to SettingsFormModal
  apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx:
    Added modal ref, imported SettingsFormModalRef, updated cancel button
    onClick to use modal's handleClose method, passed ref to SettingsFormModal
log:
  - >-
    Successfully implemented cancel button confirmation dialog for all settings
    form modals. The issue was that cancel buttons were directly calling
    onOpenChange(false), bypassing the SettingsFormModal's confirmation logic. 


    The solution involved:

    1. Creating a SettingsFormModalRef interface to expose the handleClose
    method via React ref

    2. Adding the ConfirmationDialog component to SettingsFormModal to actually
    render confirmation dialogs

    3. Updating all modal components (Agent, Role, Personality, LLM Config) to
    use the modal ref for cancel handling


    Key debugging discovered that the useConfirmationDialog hook provides props
    but requires the ConfirmationDialog component to be rendered. All cancel
    buttons now show unsaved changes confirmation when appropriate, maintaining
    consistency with other close triggers (Escape key, click outside, X button).
schema: v1.0
childrenIds: []
created: 2025-09-01T20:09:29.537Z
updated: 2025-09-01T20:09:29.537Z
---

# Fix Cancel Button Confirmation in Settings Form Modals

## Problem

Currently, when users click the "Cancel" button in settings form modals (Agent, Role, Personality, LLM Config), the modal closes immediately without showing the unsaved changes confirmation dialog. The confirmation only works for external close triggers like Escape key, clicking outside the modal, or the X button.

## Root Cause

Cancel buttons in form components directly call `onOpenChange(false)`, bypassing the `SettingsFormModal`'s confirmation logic (`handleClose` method) that checks for unsaved changes.

**Current flow:**

1. User clicks Cancel button in form
2. Form calls `handleCancel()` → `onOpenChange(false)`
3. Modal closes immediately (no confirmation)

**Expected flow:**

1. User clicks Cancel button in form
2. Form triggers modal's confirmation logic
3. If unsaved changes exist, show confirmation dialog
4. Only close if user confirms discarding changes

## Technical Solution (Option B)

Expose the `SettingsFormModal`'s `handleClose` method via React ref so that cancel buttons can use the same confirmation logic as other close triggers.

### Implementation Steps

1. **Modify SettingsFormModal component** (`apps/desktop/src/components/settings/common/SettingsFormModal.tsx`):
   - Add forwardRef wrapper to expose methods
   - Create imperative handle with `handleClose` method
   - Export interface for ref methods

2. **Update modal components** to use the exposed handleClose method:
   - `AgentFormModal.tsx` (line 45)
   - `RoleFormModal.tsx` (line 48)
   - `PersonalityFormModal.tsx` (line 118)
   - `LlmConfigModal.tsx` (line 280)

3. **Test confirmation flow** works for all close triggers:
   - Cancel button click
   - Escape key
   - Click outside modal
   - X button (if present)

## Detailed Implementation

### 1. SettingsFormModal Changes

```typescript
// Add interface for ref methods
export interface SettingsFormModalRef {
  handleClose: () => Promise<void>;
}

// Wrap component with forwardRef
export const SettingsFormModal = forwardRef<
  SettingsFormModalRef,
  SettingsFormModalProps
>(({ isOpen, onOpenChange /* other props */ }, ref) => {
  // ... existing code ...

  // Expose handleClose via imperative handle
  useImperativeHandle(
    ref,
    () => ({
      handleClose,
    }),
    [handleClose],
  );

  // ... rest of component
});
```

### 2. Modal Component Updates

Update each modal to use ref and call handleClose:

```typescript
// Example for AgentFormModal
const modalRef = useRef<SettingsFormModalRef>(null);

const handleCancel = useCallback(() => {
  modalRef.current?.handleClose();
}, []);

return (
  <SettingsFormModal
    ref={modalRef}
    // ... other props
  >
    <AgentForm onCancel={handleCancel} />
  </SettingsFormModal>
);
```

## Files to Modify

1. `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`
   - Add forwardRef wrapper and imperative handle
   - Export SettingsFormModalRef interface

2. `apps/desktop/src/components/settings/agents/AgentFormModal.tsx`
   - Add ref usage and update handleCancel

3. `apps/desktop/src/components/settings/roles/RoleFormModal.tsx`
   - Add ref usage and update handleCancel

4. `apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx`
   - Add ref usage and update handleCancel

5. `apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx`
   - Add ref usage and update handleCancel

## Acceptance Criteria

- [ ] Cancel button shows confirmation dialog when there are unsaved changes
- [ ] Cancel button closes modal immediately when there are no unsaved changes
- [ ] Confirmation dialog shows correct message and buttons
- [ ] User can choose to continue editing or discard changes
- [ ] Form data is properly reset when user chooses to discard
- [ ] All existing close triggers (Escape, click outside) continue to work
- [ ] No TypeScript errors in modified components
- [ ] All existing functionality remains intact

## Testing Requirements

### Unit Tests (include in same task)

- Test SettingsFormModal ref exposes handleClose method
- Test modal components properly call handleClose on cancel
- Mock confirmation dialog and verify correct behavior

### Manual Testing Scenarios

1. Make changes to form → click Cancel → verify confirmation shows
2. No changes to form → click Cancel → verify modal closes immediately
3. Make changes → click Cancel → click "Continue Editing" → verify modal stays open
4. Make changes → click Cancel → click "Discard Changes" → verify form resets and modal closes
5. Test all four modal types (Agent, Role, Personality, LLM Config)
6. Verify Escape key and click-outside still work correctly

## Security Considerations

- No security implications for this UI-only change
- Confirmation dialog prevents accidental data loss

## Performance Considerations

- Minimal performance impact (adds one ref and method exposure)
- No additional re-renders introduced

## Dependencies

- No external dependencies
- Depends on existing `useConfirmationDialog` hook
- Must maintain compatibility with existing form validation logic

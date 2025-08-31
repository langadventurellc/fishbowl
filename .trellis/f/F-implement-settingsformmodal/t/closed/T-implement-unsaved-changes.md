---
id: T-implement-unsaved-changes
title: Implement unsaved changes confirmation dialog
status: done
priority: medium
parent: F-implement-settingsformmodal
prerequisites:
  - T-implement-keyboard-event
affectedFiles:
  apps/desktop/src/components/settings/common/SettingsFormModal.tsx:
    Added useConfirmationDialog hook integration with conditional confirmation
    logic, implemented handleClose function that shows confirmation dialog when
    confirmOnClose.enabled is true, added handleDialogOpenChange to intercept
    external close triggers, updated Dialog onOpenChange to use confirmation
    flow, and maintained backward compatibility when no confirmation is needed
log:
  - Implemented unsaved changes confirmation dialog functionality in
    SettingsFormModal component. Added conditional confirmation logic using
    useConfirmationDialog hook that shows confirmation dialog when
    confirmOnClose.enabled is true. The implementation includes custom message
    support with configurable confirm/cancel button text, discard callback
    handling, and seamless integration with existing keyboard event handling.
    All external close triggers (Escape key, clicking outside, etc.) now go
    through the confirmation flow when enabled, preventing accidental data loss
    while maintaining clean user experience.
schema: v1.0
childrenIds: []
created: 2025-08-31T04:52:11.213Z
updated: 2025-08-31T04:52:11.213Z
---

# Implement Unsaved Changes Confirmation Dialog

## Context

Add conditional confirmation dialog functionality to SettingsFormModal that prompts users before closing when there are unsaved changes. This prevents accidental data loss and provides clear user control over discarding changes.

## Implementation Requirements

### 1. Confirmation Dialog Integration

- **Hook Usage**: Use existing `useConfirmationDialog` pattern from codebase
- **Conditional Logic**: Only show confirmation when `confirmOnClose.enabled` is true
- **Custom Messages**: Support configurable confirmation dialog text
- **Button Labels**: Configurable confirm/cancel button text with sensible defaults

### 2. Close Flow Management

- **Intercept Close**: Block immediate close when confirmation is needed
- **Confirmation Handling**: Show dialog and wait for user decision
- **Discard Callback**: Call `onDiscard` before closing to reset form state
- **Cancel Behavior**: Keep modal open if user cancels

### 3. Integration with Keyboard Events

- **Escape Key**: Should trigger confirmation flow when enabled
- **Event Coordination**: Work seamlessly with existing keyboard event handling
- **Priority Handling**: Confirmation takes precedence over immediate close

## Technical Approach

### 1. Confirmation Dialog Pattern

```typescript
import { useConfirmationDialog } from "@fishbowl-ai/shared"; // Verify path

const SettingsFormModal: React.FC<SettingsFormModalProps> = ({
  confirmOnClose,
  onOpenChange,
  onDiscard,
  // ... other props
}) => {
  const { showConfirmationDialog } = useConfirmationDialog();

  const handleClose = useCallback(async () => {
    if (confirmOnClose?.enabled) {
      const confirmed = await showConfirmationDialog({
        title: confirmOnClose.message.title,
        body: confirmOnClose.message.body,
        confirmText: confirmOnClose.message.confirmText || "Discard Changes",
        cancelText: confirmOnClose.message.cancelText || "Cancel",
      });

      if (confirmed) {
        confirmOnClose.onDiscard?.();
        onOpenChange(false);
      }
      // If not confirmed, do nothing (keep modal open)
    } else {
      // No confirmation needed, close immediately
      onOpenChange(false);
    }
  }, [confirmOnClose, onOpenChange, showConfirmationDialog]);

  // ... rest of component
};
```

### 2. Keyboard Event Integration

- Modify keyboard event handler to use `handleClose` instead of direct `onOpenChange`
- Ensure escape key triggers confirmation flow when enabled
- Maintain existing event prevention and stopPropagation

### 3. Dialog Close Integration

- Override default Dialog onOpenChange behavior
- Route all close requests through confirmation logic
- Handle external close triggers (clicking outside, etc.)

## Acceptance Criteria

### Confirmation Dialog Behavior

- ✅ **Conditional Display**: Only shows when `confirmOnClose.enabled` is true
- ✅ **Custom Messages**: Uses provided title and body text
- ✅ **Button Labels**: Supports custom confirm/cancel text with defaults
- ✅ **Discard Callback**: Calls `onDiscard` before closing when confirmed
- ✅ **Cancel Behavior**: Keeps modal open when user cancels

### Integration Requirements

- ✅ **Escape Key**: Triggers confirmation flow when enabled
- ✅ **External Triggers**: All close methods go through confirmation
- ✅ **No Confirmation**: Direct close when `confirmOnClose.enabled` is false
- ✅ **Form Reset**: onDiscard called to reset form state before close

### User Experience

- ✅ **Clear Messaging**: Users understand what changes will be lost
- ✅ **Intuitive Controls**: Confirm/cancel buttons behave as expected
- ✅ **No Surprise Data Loss**: All destructive actions are confirmed

### Unit Testing

Write comprehensive tests covering:

- ✅ **Confirmation Dialog**: showConfirmationDialog called with correct parameters
- ✅ **Conditional Logic**: No confirmation when enabled is false
- ✅ **Discard Callback**: onDiscard called before close when confirmed
- ✅ **Cancel Behavior**: Modal stays open when user cancels
- ✅ **Button Text**: Custom confirm/cancel text used correctly
- ✅ **Default Text**: Default button labels used when not provided
- ✅ **Escape Key Integration**: Escape triggers confirmation when enabled

## Dependencies

- **Prerequisite**: T-implement-keyboard-event (keyboard event handling)
- **External Dependencies**:
  - `useConfirmationDialog` hook from shared package

## Out of Scope

- Form state management (child component responsibility)
- Validation of unsaved changes (child component determines when confirmation is needed)
- Specific form field dirty tracking (handled by parent forms)

## Research Required

- Verify exact import path and API for `useConfirmationDialog` hook
- Check existing confirmation dialog patterns in codebase
- Review how other form modals handle unsaved changes

## Files to Modify

- `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`
- Unit test file updates for confirmation dialog testing

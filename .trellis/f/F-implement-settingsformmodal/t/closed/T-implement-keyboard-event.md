---
id: T-implement-keyboard-event
title: Implement keyboard event handling with capture-phase priority
status: done
priority: high
parent: F-implement-settingsformmodal
prerequisites:
  - T-create-settingsformmodal-base
affectedFiles:
  apps/desktop/src/components/settings/common/SettingsFormModal.tsx:
    Added useEffect import, implemented useKeyboardHandling custom hook with
    capture-phase event listeners for Escape and Ctrl/Cmd+S handling, integrated
    hook with SettingsFormModal component, added onRequestSave prop handling
log:
  - Implemented keyboard event handling with capture-phase priority for
    SettingsFormModal. Added custom useKeyboardHandling hook that uses
    capture-phase document listeners to ensure form modals handle keyboard
    events before parent modals. Escape key closes form modal with
    preventDefault and stopPropagation to prevent bubbling to parent
    SettingsModal. Ctrl/Cmd+S shortcuts delegate to onRequestSave callback when
    provided. Event listeners are properly managed with cleanup on unmount and
    conditional activation only when modal is open.
schema: v1.0
childrenIds: []
created: 2025-08-31T04:51:19.122Z
updated: 2025-08-31T04:51:19.122Z
---

# Implement Keyboard Event Handling

## Context

Add high-priority keyboard event handling to SettingsFormModal to resolve escape key conflicts with the main SettingsModal. This implementation uses capture-phase event listeners to ensure form modals handle keyboard events before the parent modal.

## Implementation Requirements

### 1. Escape Key Handling

- **Priority**: Capture-phase document listener (`addEventListener(event, handler, true)`)
- **Behavior**: Close form modal without affecting parent SettingsModal
- **Event Control**: Call `preventDefault()` and `stopPropagation()` to prevent bubbling
- **Conditional**: Only active when `isOpen` is true

### 2. Save Shortcut Handling

- **Shortcuts**: Ctrl+S (Windows/Linux) and Cmd+S (macOS)
- **Behavior**: Delegate to `onRequestSave` callback when provided
- **Event Control**: Prevent default browser save behavior
- **Conditional**: Only when `onRequestSave` prop is provided

### 3. Event Listener Lifecycle

- **Activation**: Add listeners when modal opens (`isOpen` becomes true)
- **Cleanup**: Remove listeners when modal closes or component unmounts
- **Memory Management**: Proper cleanup to prevent memory leaks

## Technical Approach

### 1. Custom Hook Pattern

Create internal hook for keyboard handling:

```typescript
const useKeyboardHandling = (
  isOpen: boolean,
  onClose: () => void,
  onRequestSave?: () => void,
) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key handling
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      // Save shortcuts
      if (
        onRequestSave &&
        (event.ctrlKey || event.metaKey) &&
        event.key === "s"
      ) {
        event.preventDefault();
        event.stopPropagation();
        onRequestSave();
        return;
      }
    };

    // Use capture phase for priority
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, onClose, onRequestSave]);
};
```

### 2. Integration with Base Component

- Call the hook in SettingsFormModal component
- Pass appropriate props for event handling
- Ensure proper dependency management

## Acceptance Criteria

### Functional Requirements

- ✅ **Escape Key**: Closes form modal without affecting parent SettingsModal
- ✅ **Save Shortcuts**: Ctrl/Cmd+S triggers onRequestSave callback
- ✅ **Event Priority**: Capture-phase listeners run before SettingsModal handlers
- ✅ **Event Prevention**: preventDefault and stopPropagation called appropriately
- ✅ **Conditional Activation**: Listeners only active when isOpen is true

### Technical Requirements

- ✅ **Lifecycle Management**: Listeners added/removed correctly
- ✅ **Memory Safety**: No memory leaks from uncleaned listeners
- ✅ **Platform Support**: Works on Windows, macOS, and Linux
- ✅ **Browser Compatibility**: Chrome, Firefox, Safari, Edge

### Unit Testing

Write comprehensive tests covering:

- ✅ **Escape Key**: Verify onOpenChange called with false
- ✅ **Save Shortcuts**: Verify onRequestSave callback triggered
- ✅ **Event Prevention**: Mock event.preventDefault/stopPropagation calls
- ✅ **Conditional Logic**: No listeners when isOpen is false
- ✅ **Cleanup**: Listeners removed on unmount
- ✅ **Platform Detection**: Cmd key on Mac, Ctrl key on Windows/Linux

## Dependencies

- **Prerequisite**: T-create-settingsformmodal-base (base component structure)

## Out of Scope

- Focus management (separate task)
- Confirmation dialogs for unsaved changes (separate task)
- Integration testing with SettingsModal (separate integration task)

## Files to Modify

- `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`
- Unit test file updates for keyboard event testing

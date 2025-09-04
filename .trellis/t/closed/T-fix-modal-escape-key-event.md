---
id: T-fix-modal-escape-key-event
title: Fix modal escape key event handling conflict between SettingsModal and
  SettingsFormModal
status: done
priority: high
parent: none
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/common/SettingsFormModal.tsx:
    Updated useKeyboardHandling hook to use stopImmediatePropagation() instead
    of stopPropagation() for both escape key and save shortcut handling,
    ensuring proper event isolation in nested modal scenarios. Added
    comprehensive JSDoc documentation explaining the event handling strategy.
  apps/desktop/src/components/settings/SettingsModal.tsx: Enhanced nested dialog
    detection with error handling, performance optimizations, and synchronous
    fallback checks. Updated MutationObserver to be more efficient by filtering
    relevant mutations. Added double-check in escape key handler to prevent
    timing issues with nested dialog state.
log:
  - Fixed modal escape key event handling conflict between SettingsModal and
    SettingsFormModal by implementing stopImmediatePropagation() in the
    SettingsFormModal's keyboard event handler and enhancing the SettingsModal's
    nested dialog detection with error handling and performance optimizations.
    The implementation ensures that escape key presses in nested form modals
    only close the topmost modal, not the parent SettingsModal, resolving the
    negative user experience issue.
schema: v1.0
childrenIds: []
created: 2025-09-04T17:38:46.254Z
updated: 2025-09-04T17:38:46.254Z
---

# Fix Modal Escape Key Event Handling Conflict

## Problem Description

When a user presses the Escape key in a nested form modal (e.g., AgentFormModal, RoleFormModal, PersonalityFormModal), both the form modal AND the parent SettingsModal close simultaneously. This creates a negative user experience where users lose their place in the settings interface.

**Expected Behavior**: Escape key should only close the topmost (form) modal, leaving the SettingsModal open.

**Current Behavior**: Escape key closes both modals, returning user to the main application.

**Exception**: When the form has unsaved changes, the confirmation dialog correctly prevents the parent modal from closing.

## Root Cause Analysis

The issue stems from **conflicting keyboard event handlers**:

1. **SettingsFormModal** (`apps/desktop/src/components/settings/common/SettingsFormModal.tsx`, lines 60-92):
   - Uses capture-phase event listeners (`addEventListener(..., true)`)
   - Calls `event.stopPropagation()` which only affects bubble phase
   - Cannot prevent SettingsModal's listener from firing

2. **SettingsModal** (`apps/desktop/src/components/settings/SettingsModal.tsx`, lines 172-187):
   - Uses standard (bubble-phase) event listeners via `useGlobalKeyboardShortcuts`
   - Has `hasNestedDialog` detection but may have timing issues
   - Still receives escape events even when form modal is open

## Technical Implementation Requirements

### Primary Fix: Improve Event Handling in SettingsFormModal

**File**: `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`

**Changes needed in `useKeyboardHandling` hook (lines 55-92)**:

1. **Replace `stopPropagation()` with `stopImmediatePropagation()`**:

   ```typescript
   if (event.key === "Escape") {
     event.preventDefault();
     event.stopImmediatePropagation(); // Changed from stopPropagation()
     onClose();
     return;
   }
   ```

2. **Add event listener priority management**: Ensure the capture-phase listener can fully prevent parent handlers from executing.

### Secondary Fix: Improve Nested Dialog Detection

**File**: `apps/desktop/src/components/settings/SettingsModal.tsx`

**Enhancement needed in nested dialog detection (lines 138-161)**:

1. **Add synchronous dialog detection** to reduce timing issues:

   ```typescript
   const checkForNestedDialogs = () => {
     const hasDialog = document.querySelector("[data-form-modal]") !== null;
     setHasNestedDialog(hasDialog);

     // Immediately return current state for synchronous access
     return hasDialog;
   };
   ```

2. **Update useGlobalKeyboardShortcuts logic** to check both state and DOM directly:
   ```typescript
   useGlobalKeyboardShortcuts({
     shortcuts: {
       Escape: () => {
         // Double-check for nested dialogs before closing
         const hasActiveNestedDialog =
           document.querySelector("[data-form-modal]") !== null;
         if (!hasActiveNestedDialog) {
           onOpenChange(false);
         }
       },
       // ... other shortcuts
     },
     enabled: open && !hasNestedDialog,
     preventDefault: true,
   });
   ```

## Detailed Implementation Steps

### Step 1: Update SettingsFormModal Event Handling

1. Open `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`
2. Locate the `useKeyboardHandling` hook (lines 55-92)
3. In the escape key handler (lines 65-70), change `event.stopPropagation()` to `event.stopImmediatePropagation()`
4. Add JSDoc comments explaining the event handling strategy

### Step 2: Enhance SettingsModal Nested Dialog Detection

1. Open `apps/desktop/src/components/settings/SettingsModal.tsx`
2. Locate the nested dialog detection logic (lines 138-161)
3. Modify the `checkForNestedDialogs` function to provide synchronous access
4. Update the escape key handler in `useGlobalKeyboardShortcuts` to double-check for nested dialogs

### Step 3: Add Unit Tests

Create tests in corresponding test files to verify:

- Escape key only closes form modal when nested
- Escape key closes settings modal when no nesting
- Event propagation is properly prevented
- Confirmation dialog behavior remains unchanged

## Acceptance Criteria

### Functional Requirements

- ✅ Escape key in form modal only closes the form modal, not parent SettingsModal
- ✅ Escape key in SettingsModal (without nested dialog) closes the SettingsModal
- ✅ Confirmation dialog behavior for unsaved changes remains unchanged
- ✅ All existing keyboard shortcuts continue to work as expected
- ✅ Focus management works correctly after form modal closes

### Technical Requirements

- ✅ Event handling uses `stopImmediatePropagation()` in capture phase
- ✅ Nested dialog detection has both async state and synchronous fallback
- ✅ No breaking changes to existing modal APIs
- ✅ Unit tests cover both success and edge cases

### Testing Requirements

- ✅ Unit tests for `useKeyboardHandling` hook event handling
- ✅ Unit tests for nested dialog detection logic
- ✅ Manual testing of escape key behavior in all form modals:
  - AgentFormModal (`apps/desktop/src/components/settings/agents/AgentFormModal.tsx`)
  - RoleFormModal (`apps/desktop/src/components/settings/roles/RoleFormModal.tsx`)
  - PersonalityFormModal (`apps/desktop/src/components/settings/personalities/PersonalityFormModal.tsx`)
  - LlmConfigModal (`apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx`)

## Key Files to Modify

1. **Primary**: `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`
   - Update `useKeyboardHandling` hook event handling
2. **Secondary**: `apps/desktop/src/components/settings/SettingsModal.tsx`
   - Enhance nested dialog detection and escape key handling

3. **Testing**: Add/update corresponding test files for modified components

## Related Context

- **Bug Report Location**: This issue was identified in the analysis of modal escape behavior
- **Form Modals Using SettingsFormModal**: AgentFormModal, RoleFormModal, PersonalityFormModal, LlmConfigModal
- **Event Handling Architecture**: Uses capture-phase listeners for priority and bubble-phase prevention
- **Focus Management**: Integrated with `useFocusTrap` hook for accessibility

## Out of Scope

- Major architectural changes to modal system
- Changes to third-party dialog library (shadcn/ui)
- Performance optimizations not directly related to the bug
- Additional keyboard shortcuts or modal features
- Changes to confirmation dialog behavior (working correctly)

## Security Considerations

- Ensure event handling doesn't introduce XSS vulnerabilities
- Verify that event prevention doesn't break accessibility features
- Maintain proper focus trap behavior for security compliance

---
id: T-implement-unsaved-changes
title: Implement unsaved changes detection and confirmation dialog
status: done
priority: medium
parent: F-agent-form-simplification
prerequisites:
  - T-set-up-react-hook-form-with
affectedFiles:
  apps/desktop/src/components/settings/agents/AgentForm.tsx: Implemented unsaved
    changes detection with ConfirmationDialog component, added state management
    for dialog visibility, updated cancel and save handlers to properly manage
    form dirty state and reset behavior
log:
  - >-
    Implemented unsaved changes detection and confirmation dialog for the
    AgentForm component. Replaced native browser confirm() dialog with proper
    ConfirmationDialog component using React Hook Form's formState.isDirty for
    change detection. The implementation includes:


    • Added state management for unsaved changes dialog visibility

    • Replaced browser confirm() with ConfirmationDialog component using
    "destructive" variant

    • Updated handleCancel to check for unsaved changes before showing dialog  

    • Implemented handleConfirmCancel to reset form to original values on
    confirmation

    • Enhanced form.reset() calls with explicit options to properly clear dirty
    state

    • Integrated with existing useUnsavedChanges hook for global state
    management


    The dialog appears only when there are actual unsaved changes, provides
    clear messaging about data loss, and maintains consistent behavior with
    other forms in the application. All quality checks and tests pass
    successfully.
schema: v1.0
childrenIds: []
created: 2025-08-19T18:26:08.213Z
updated: 2025-08-19T18:26:08.213Z
---

# Implement unsaved changes detection and confirmation dialog

## Context

Add unsaved changes detection using React Hook Form's formState.isDirty and implement confirmation dialogs when users attempt to cancel with unsaved changes. This prevents accidental loss of form data and provides a better user experience.

## Detailed Implementation Requirements

### Unsaved Changes Detection

- Use formState.isDirty to track when form has been modified
- Track dirty state changes and update UI accordingly
- Clear dirty state after successful form submission
- Reset form to original values on confirmed cancel

### Confirmation Dialog Implementation

```typescript
const {
  formState: { isDirty },
} = form;

const handleCancel = useCallback(() => {
  if (isDirty) {
    // Show confirmation dialog
    setShowUnsavedDialog(true);
  } else {
    // Safe to cancel immediately
    onCancel?.();
  }
}, [isDirty, onCancel]);

const handleConfirmCancel = useCallback(() => {
  form.reset(); // Reset to original values
  setShowUnsavedDialog(false);
  onCancel?.();
}, [form, onCancel]);
```

### Dialog Component Integration

```typescript
<AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
      <AlertDialogDescription>
        You have unsaved changes that will be lost if you continue.
        Are you sure you want to cancel?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
        Keep Editing
      </AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmCancel}>
        Discard Changes
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Save State Management

- Clear dirty state after successful save: `form.reset(newValues, { keepValues: true })`
- Show visual indication when form has unsaved changes
- Disable cancel without confirmation when no changes exist
- Handle form submission errors without clearing dirty state

## Technical Implementation

### Files to Modify

- `apps/desktop/src/components/settings/agents/AgentForm.tsx`

### Dependencies

- AlertDialog components from shadcn/ui
- React Hook Form formState.isDirty
- useCallback for event handlers
- Existing patterns from CreateRoleForm and PersonalityForm

### Key Implementation Steps

1. Import AlertDialog components
2. Set up state for unsaved changes dialog
3. Track formState.isDirty for change detection
4. Implement cancel handler with confirmation logic
5. Add confirmation dialog component
6. Update save handler to clear dirty state
7. Test unsaved changes detection and dialog flow

## Acceptance Criteria

### Change Detection

- ✅ Form tracks when any field has been modified
- ✅ Dirty state updates immediately when user makes changes
- ✅ Dirty state cleared after successful form submission
- ✅ Form reset restores original values and clears dirty state

### Confirmation Dialog

- ✅ Dialog appears when canceling with unsaved changes
- ✅ Dialog does not appear when canceling without changes
- ✅ "Keep Editing" button returns to form without losing changes
- ✅ "Discard Changes" button cancels and resets form

### User Experience

- ✅ Clear messaging about unsaved changes
- ✅ Easy to understand dialog options
- ✅ No accidental data loss
- ✅ Consistent behavior with other forms in the app

### Form Integration

- ✅ Works correctly with all form fields and validation
- ✅ Save operation clears dirty state appropriately
- ✅ Form errors don't interfere with unsaved changes detection
- ✅ Programmatic form changes handled correctly

### Accessibility

- ✅ Dialog properly announces to screen readers
- ✅ Focus management handles dialog open/close
- ✅ Keyboard navigation works for dialog buttons
- ✅ Clear semantic structure for confirmation options

### Unit Testing Requirements

- Test dirty state detection with field changes
- Test confirmation dialog appearance with unsaved changes
- Test dialog dismissal without data loss
- Test confirmed cancel clears form and closes
- Test save operation clears dirty state

## Dependencies

- Requires T-set-up-react-hook-form-with to be completed
- Uses AlertDialog from shadcn/ui
- Follows patterns from existing forms with unsaved changes

## Security Considerations

- Ensure confirmation dialog cannot be bypassed
- Validate that form reset actually clears all data
- Prevent memory leaks from event handlers
- Handle edge cases with form state corruption

## Performance Considerations

- isDirty tracking should not impact form performance
- Dialog rendering should be lightweight
- Event handlers properly memoized to prevent unnecessary renders
- No memory leaks from confirmation dialog state

## Notes

- Follow existing patterns from CreateRoleForm for unsaved changes
- Use consistent dialog styling and messaging
- Ensure dialog behavior is predictable and user-friendly

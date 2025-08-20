---
id: T-implement-delete-confirmation
title: Implement Delete Confirmation Dialog in LibraryTab
status: open
priority: high
parent: F-delete-agent-feature
prerequisites:
  - T-connect-librarytab-to-real
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-20T00:50:56.790Z
updated: 2025-08-20T00:50:56.790Z
---

## Purpose

Wire up the delete confirmation dialog in the LibraryTab component to enable agent deletion with proper confirmation flow.

## Context

The delete agent functionality is partially implemented:

- `deleteAgent` function exists in `useAgentsStore` (packages/ui-shared/src/stores/useAgentsStore.ts)
- `ConfirmationDialog` component exists (apps/desktop/src/components/ui/confirmation-dialog.tsx)
- `useConfirmationDialog` hook exists (apps/desktop/src/hooks/useConfirmationDialog.ts)
- `AgentCard` has delete button that calls `onDelete` callback
- Currently, LibraryTab only logs delete requests but doesn't show confirmation or call the store

## Implementation Requirements

### 1. Import Required Dependencies

- Import `useConfirmationDialog` hook
- Import `useAgentsStore` for delete functionality
- Import `ConfirmationDialog` component

### 2. Add Confirmation Dialog State

- Integrate `useConfirmationDialog` hook in LibraryTab component
- Add confirmation dialog props to component JSX

### 3. Implement Delete Handler

- Replace the current logging-only `onDelete` callback in LibraryTab
- Show confirmation dialog with agent name and warning about permanent deletion
- Call `deleteAgent` from store after user confirms
- Handle both confirm and cancel scenarios

### 4. Error Handling and Feedback

- Display error messages if deletion fails
- Show success feedback using screen reader announcements
- Maintain existing logger.info calls for audit trail

### 5. Loading States

- Add loading state during deletion process
- Disable relevant UI elements during deletion

## Technical Approach

1. **File to modify**: `apps/desktop/src/components/settings/agents/LibraryTab.tsx`

2. **Pattern to follow**: Similar to how other sections handle delete operations (refer to LlmSetupSection for patterns)

3. **Confirmation dialog configuration**:

   ```typescript
   {
     title: "Delete Agent",
     message: `Are you sure you want to delete "${agentName}"? This action cannot be undone.`,
     confirmText: "Delete",
     cancelText: "Cancel",
     variant: "destructive"
   }
   ```

4. **Error handling**: Use the existing error state from `useAgentsStore`

## Acceptance Criteria

- [ ] Clicking delete button on agent card shows confirmation dialog
- [ ] Confirmation dialog displays agent name and permanent deletion warning
- [ ] User can cancel deletion without any changes
- [ ] User can confirm deletion and agent is removed from store and UI
- [ ] Error states are properly displayed to user
- [ ] Success feedback is announced to screen readers
- [ ] Loading states prevent multiple deletion attempts
- [ ] Deletion respects the existing store's optimistic update pattern

## Testing Requirements

Create unit tests in `apps/desktop/src/components/settings/agents/__tests__/LibraryTab.test.tsx` that verify:

- [ ] Confirmation dialog appears when delete button is clicked
- [ ] Dialog shows correct agent name in message
- [ ] Cancel button closes dialog without calling deleteAgent
- [ ] Confirm button calls deleteAgent with correct agent ID
- [ ] Error handling displays appropriate error messages
- [ ] Success scenarios announce completion to screen readers
- [ ] Loading states are properly managed

## Security Considerations

- Validate agent ID exists before attempting deletion
- Ensure proper error handling prevents UI crashes
- Log deletion events for audit trail

## Dependencies

- Requires existing `useConfirmationDialog` hook
- Requires existing `ConfirmationDialog` component
- Requires existing `useAgentsStore.deleteAgent` function
- Integrates with existing `AgentCard` component

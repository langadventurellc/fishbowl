---
id: T-fix-commandn-shortcut-ui
title: Fix Command+N shortcut UI refresh by using store method and removing
  unused hook
status: done
priority: high
parent: none
prerequisites: []
affectedFiles:
  apps/desktop/src/hooks/useElectronIPC.ts: Replaced useCreateConversation hook
    with direct store method call, added async callback for await support
  apps/desktop/src/hooks/conversations/index.ts: Removed useCreateConversation export and updated JSDoc examples
  apps/desktop/src/hooks/conversations/useCreateConversation.ts: Deleted unused hook implementation
  apps/desktop/src/hooks/conversations/__tests__/useCreateConversation.test.tsx: Deleted unused hook test file
log:
  - >-
    Fixed Command+N keyboard shortcut UI refresh issue by replacing the
    IPC-triggered hook-based conversation creation with a direct call to the
    store's atomic createConversationAndSelect() method. This ensures both
    database creation and UI state updates occur together, eliminating the need
    for manual reload to see new conversations.


    Key changes made:

    - Updated IPC handler to use
    useConversationStore.getState().createConversationAndSelect() instead of
    useCreateConversation hook

    - Made the IPC callback async to properly handle the await call

    - Removed unused useCreateConversation hook and its comprehensive test suite

    - Updated barrel export file to remove references to deleted hook

    - Maintained same error handling pattern and logging behavior


    The Command+N shortcut now creates conversations AND refreshes the UI
    immediately, matching the behavior of the UI button flow. All quality checks
    pass with no TypeScript errors or linting issues.
schema: v1.0
childrenIds: []
created: 2025-09-04T16:48:53.155Z
updated: 2025-09-04T16:48:53.155Z
---

# Fix Command+N Shortcut UI Refresh Issue

## Context

The Command+N keyboard shortcut successfully creates new conversations in the database but fails to refresh the UI, requiring a manual reload to see the new conversation. This is caused by two different conversation creation paths that don't properly synchronize:

1. **IPC-Triggered Flow (Command+N)**: Uses `useCreateConversation` hook which only creates the conversation via IPC without updating UI state
2. **UI Button Flow**: Uses `useConversationStore.createConversationAndSelect()` which creates conversation, refreshes list, AND selects it

## Implementation Requirements

### Primary Changes

1. **Update IPC Handler** (`apps/desktop/src/hooks/useElectronIPC.ts`):
   - Remove import of `useCreateConversation` hook
   - Remove usage of `createConversation` from the hook
   - Replace with direct call to `useConversationStore.getState().createConversationAndSelect()`
   - Ensure proper error handling is maintained

2. **Remove Unused Hook Files**:
   - Delete `apps/desktop/src/hooks/conversations/useCreateConversation.ts`
   - Delete `apps/desktop/src/hooks/conversations/__tests__/useCreateConversation.test.tsx`
   - Remove export from `apps/desktop/src/hooks/conversations/index.ts`

### Technical Approach

1. **Modify useElectronIPC.ts**:

   ```typescript
   // Remove these lines:
   import { useCreateConversation } from "./conversations/useCreateConversation";
   const { createConversation } = useCreateConversation();

   // Add this import:
   import { useConversationStore } from "@fishbowl-ai/ui-shared";

   // Replace the IPC handler call from:
   createConversation();

   // To:
   useConversationStore.getState().createConversationAndSelect();
   ```

2. **Update useElectronIPC dependency array**:
   - Remove `createConversation` from the useEffect dependency array
   - Ensure the effect still works correctly after the change

3. **Clean up unused files**:
   - Delete the hook implementation file
   - Delete the comprehensive test suite (396 lines)
   - Remove the export from the index file

## Acceptance Criteria

### Functional Requirements

- [ ] Command+N keyboard shortcut creates a new conversation AND updates the UI immediately
- [ ] New conversation appears in the sidebar without requiring a manual reload
- [ ] New conversation is automatically selected after creation
- [ ] Error handling works correctly if conversation creation fails
- [ ] No broken imports or TypeScript errors after cleanup

### Code Quality

- [ ] All references to `useCreateConversation` hook are removed
- [ ] No unused imports remain in any files
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without issues
- [ ] The IPC handler maintains the same error logging behavior

### Testing Requirements

- [ ] Manual testing: Command+N creates conversation and updates UI immediately
- [ ] Manual testing: UI button still works correctly (should be unchanged)
- [ ] Manual testing: Both paths create conversations with identical behavior
- [ ] Verify no console errors or warnings appear
- [ ] Test error scenarios (e.g., when not in Electron environment)

## Files to Modify

1. **apps/desktop/src/hooks/useElectronIPC.ts**
   - Remove `useCreateConversation` import and usage
   - Add store method call
   - Update dependency array

2. **apps/desktop/src/hooks/conversations/index.ts**
   - Remove `useCreateConversation` export

## Files to Delete

1. **apps/desktop/src/hooks/conversations/useCreateConversation.ts**
2. **apps/desktop/src/hooks/conversations/**tests**/useCreateConversation.test.tsx**

## Dependencies

This task has no prerequisites and does not block other tasks.

## Security Considerations

No security implications - this is an internal refactoring that maintains the same conversation creation functionality through a different code path.

## Out of Scope

- Changes to the UI button conversation creation flow (already works correctly)
- Changes to the store implementation itself
- Adding new features or functionality beyond fixing the UI refresh issue

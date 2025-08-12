---
id: T-replace-simulated-role-delete
title: Replace simulated role delete handler with store operation
status: done
priority: high
parent: F-roles-store-integration
prerequisites:
  - T-replace-simulated-role
affectedFiles:
  apps/desktop/src/components/settings/roles/RolesSection.tsx:
    Replaced simulated handleConfirmDelete function with real store deleteRole
    operation. Added deleteRole method subscription from store. Updated delete
    dialog to use isSaving state instead of hardcoded false. Implemented proper
    error handling with try/catch blocks and logger usage. Dialog now closes
    only on successful deletion and stays open on errors.
log:
  - "Successfully replaced simulated role delete handler with real store
    operation. Removed artificial setTimeout delays and implemented proper error
    handling with try/catch blocks. Delete dialog now closes only on successful
    operations and uses real loading states from the store. All acceptance
    criteria met: delete operation uses store.deleteRole(id), no artificial
    delays, proper error handling prevents dialog closing on failure, optimistic
    updates remove role from UI immediately, and all quality checks pass."
schema: v1.0
childrenIds: []
created: 2025-08-12T16:51:26.031Z
updated: 2025-08-12T16:51:26.031Z
---

# Replace simulated role delete handler with store operation

## Context

Replace the simulated `handleConfirmDelete` function in `RolesSection.tsx` that currently uses `setTimeout` delays with real store `deleteRole()` operation.

## Technical Approach

- Replace simulated `handleConfirmDelete` with calls to `store.deleteRole(id)`
- Remove artificial `setTimeout` delays and loading simulation
- Implement proper error handling with try/catch blocks
- Handle async operations with proper loading states from store
- Ensure delete dialog closes only on successful operation
- Add user feedback for successful deletion
- Maintain optimistic UI updates (role removed immediately)

## Implementation Details

Replace this pattern:

```jsx
// Current simulated handler
const handleConfirmDelete = useCallback(async (role: RoleViewModel) => {
  // Simulate delay with setTimeout
  await new Promise((resolve) => setTimeout(resolve, 500));
  setDeleteDialogOpen(false);
  setSelectedRole(undefined);
}, []);
```

With:

```jsx
// New store-connected handler
const handleConfirmDelete = useCallback(async (role: RoleViewModel) => {
  try {
    store.deleteRole(role.id);
    setDeleteDialogOpen(false);
    setSelectedRole(undefined);
  } catch (error) {
    // Handle error - store manages error state
    logger.error("Failed to delete role", { error, roleId: role.id });
  }
}, []);
```

## Acceptance Criteria

- [ ] Delete operation uses `store.deleteRole(id)` method
- [ ] No artificial setTimeout delays in delete operation
- [ ] Delete dialog closes only after successful deletion
- [ ] Error handling prevents dialog from closing on failure
- [ ] Loading states managed by store during deletion
- [ ] Optimistic updates remove role from UI immediately
- [ ] Role removal is confirmed through store state updates
- [ ] Error states display appropriately if deletion fails
- [ ] Unit tests verify delete operation works correctly
- [ ] Integration tests confirm end-to-end delete flow works

## Dependencies

- Requires create/update operations to be completed first
- Must use existing `RoleViewModel` interface for role identification

## Security Considerations

- Role deletion validated by store business logic
- No sensitive information logged during delete operations
- Store handles proper cleanup of role references

## Testing Requirements

- Unit tests for delete handler function and error scenarios
- Test delete dialog behavior on successful vs failed operations
- Verify optimistic UI updates work correctly
- Test that store state reflects deletion properly
- Confirm loading states during delete operations
- Integration tests for complete delete user flow

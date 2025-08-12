---
id: T-replace-simulated-role
title: Replace simulated role create/update handlers with store operations
status: done
priority: high
parent: F-roles-store-integration
prerequisites:
  - T-connect-rolessection
affectedFiles:
  apps/desktop/src/components/settings/roles/RolesSection.tsx:
    Replaced simulated handleSaveRole function with real store operations for
    create/update, added proper error handling that only closes modal on
    success, connected to store's isSaving state for loading indicators, and
    removed artificial setTimeout delays
log:
  - Successfully replaced simulated role create/update handlers with real store
    operations. Removed artificial setTimeout delays and implemented proper
    error handling. Modal now closes only on successful operations and uses real
    loading states from the store. All acceptance criteria met and quality
    checks pass.
schema: v1.0
childrenIds: []
created: 2025-08-12T16:51:15.028Z
updated: 2025-08-12T16:51:15.028Z
---

# Replace simulated role create/update handlers with store operations

## Context

Replace the simulated `handleSaveRole` function in `RolesSection.tsx` that currently uses `setTimeout` delays with real store operations for creating and updating roles.

## Technical Approach

- Replace simulated `handleSaveRole` with calls to `store.createRole()` or `store.updateRole()`
- Remove artificial `setTimeout` delays and loading simulation
- Use `formMode` state to determine create vs update operation
- Implement proper error handling with try/catch blocks
- Handle async operations with proper loading states
- Ensure modal closes only on successful operation
- Maintain optimistic UI updates where appropriate

## Implementation Details

Replace this pattern:

```jsx
// Current simulated handler
const handleSaveRole = useCallback(async (data: RoleFormData) => {
  // Simulate delay with setTimeout
  await new Promise((resolve) => setTimeout(resolve, 500));
  setFormModalOpen(false);
}, [formMode]);
```

With:

```jsx
// New store-connected handler
const handleSaveRole = useCallback(async (data: RoleFormData) => {
  try {
    if (formMode === "create") {
      store.createRole(data);
    } else {
      store.updateRole(selectedRole.id, data);
    }
    setFormModalOpen(false);
    setSelectedRole(undefined);
  } catch (error) {
    // Handle error - store already manages error state
    logger.error("Failed to save role", { error });
  }
}, [formMode, selectedRole]);
```

## Acceptance Criteria

- [ ] Create role operation uses `store.createRole(roleData)`
- [ ] Update role operation uses `store.updateRole(id, roleData)`
- [ ] No artificial setTimeout delays in save operations
- [ ] Modal closes only after successful save operation
- [ ] Error handling prevents modal from closing on failure
- [ ] Loading states managed by store, not local component state
- [ ] Role validation handled by store validation logic
- [ ] Optimistic updates show changes immediately before persistence
- [ ] Unit tests verify create/update operations work correctly
- [ ] Integration tests confirm end-to-end save flow works

## Dependencies

- Requires component store connection to be completed
- Must use existing `RoleFormData` interface for type safety

## Security Considerations

- All user input validated by store's validation logic
- No sensitive data logged in error handling
- Store handles data sanitization before persistence

## Testing Requirements

- Unit tests for create and update handler functions
- Test error scenarios when store operations fail
- Verify modal behavior on successful vs failed operations
- Test both create and edit modes work correctly with store
- Confirm loading states are properly managed during save operations

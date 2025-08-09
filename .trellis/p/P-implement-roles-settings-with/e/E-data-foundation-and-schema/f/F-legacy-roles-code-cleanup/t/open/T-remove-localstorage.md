---
id: T-remove-localstorage
title: Remove localStorage persistence and update rolesStore
status: open
priority: high
parent: F-legacy-roles-code-cleanup
prerequisites:
  - T-analyze-and-document-all
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T21:53:31.453Z
updated: 2025-08-09T21:53:31.453Z
---

# Task: Remove localStorage Persistence and Update rolesStore

## Context

The legacy localStorage-based persistence for roles is being replaced with a new database-backed persistence system. This task removes the old persistence layer and updates the rolesStore to remove persistence-related code.

## Files to Modify

- **Delete**: `packages/ui-shared/src/stores/rolesPersistence.ts`
- **Update**: `packages/ui-shared/src/stores/rolesStore.ts`
- **Update**: `packages/ui-shared/src/stores/__tests__/rolesStore.test.ts`

## Implementation Steps

1. **Delete rolesPersistence.ts**
   - Remove the entire file `packages/ui-shared/src/stores/rolesPersistence.ts`
   - This file contains localStorage-based persistence logic that is no longer needed

2. **Update rolesStore.ts**
   - Remove the import statement for `rolesPersistence`
   - Remove the `loadRoles` method (lines ~166-176)
   - Remove the `saveRoles` method (lines ~178-181)
   - Remove async save calls in `createRole`, `updateRole`, and `deleteRole` methods
   - Update the interface to remove `loadRoles` and `saveRoles` from `RolesActions`
   - Keep all CRUD operations (createRole, updateRole, deleteRole) intact
   - Maintain in-memory state management functionality

3. **Update rolesStore.test.ts**
   - Remove the mock for `rolesPersistence`
   - Remove any tests that specifically test loading/saving functionality
   - Update remaining tests to work without persistence layer
   - Ensure all CRUD operation tests still pass

4. **Write Unit Tests**
   - Verify rolesStore CRUD operations work without persistence
   - Test that createRole, updateRole, deleteRole still function correctly
   - Ensure state management remains intact
   - Test error handling for CRUD operations

## Acceptance Criteria

- [ ] `rolesPersistence.ts` file deleted
- [ ] No import references to `rolesPersistence` remain in rolesStore
- [ ] `loadRoles` and `saveRoles` methods removed from rolesStore
- [ ] Async save calls removed from CRUD methods
- [ ] rolesStore tests updated and passing
- [ ] TypeScript compilation succeeds with no errors
- [ ] All CRUD operations continue to work in-memory

## Technical Approach

```typescript
// After removal, rolesStore should look like:
interface RolesActions {
  createRole: (roleData: RoleFormData) => string;
  updateRole: (id: string, roleData: RoleFormData) => void;
  deleteRole: (id: string) => void;
  getRoleById: (id: string) => RoleViewModel | undefined;
  isRoleNameUnique: (name: string, excludeId?: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  // loadRoles and saveRoles removed
}

// Remove these lines from CRUD methods:
// get().saveRoles(); // Remove all occurrences
```

## Testing Requirements

- Run existing unit tests and update as needed
- Verify TypeScript compilation: `pnpm type-check`
- Test that rolesStore can still create, update, and delete roles in memory
- Ensure no runtime errors from missing persistence methods

## Dependencies

- Prerequisite: T-analyze-and-document-all (to know all affected files)

## Estimated Time

1.5 hours - Involves careful removal of persistence code while maintaining store functionality

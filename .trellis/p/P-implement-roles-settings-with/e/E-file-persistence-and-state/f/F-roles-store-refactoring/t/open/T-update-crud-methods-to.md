---
id: T-update-crud-methods-to
title: Update CRUD methods to integrate persistence
status: open
priority: high
parent: F-roles-store-refactoring
prerequisites:
  - T-add-comprehensive-error
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-11T18:30:09.498Z
updated: 2025-08-11T18:30:09.498Z
---

# Update CRUD Methods to Integrate Persistence

## Purpose

Modify existing CRUD operations (createRole, updateRole, deleteRole) to trigger auto-save functionality while maintaining their current API and behavior for backward compatibility.

## Implementation Details

### Method Integration Strategy

Update each CRUD method to:

1. Perform existing validation and state updates (unchanged)
2. Trigger debounced auto-save after successful state changes
3. Handle persistence errors without affecting UI responsiveness
4. Track pending operations during save processes

### File Locations

- Update: `packages/ui-shared/src/stores/rolesStore.ts`

## Technical Requirements

### createRole Method Updates

- Maintain existing return value (role ID or empty string)
- Preserve current validation logic and error handling
- Add auto-save trigger after successful role creation
- Track creation in pending operations queue

### updateRole Method Updates

- Maintain existing void return and parameter signature
- Preserve current validation and uniqueness checks
- Add auto-save trigger after successful role update
- Track update operation with role ID

### deleteRole Method Updates

- Maintain existing void return and parameter signature
- Preserve current existence checks and error handling
- Add auto-save trigger after successful role deletion
- Track deletion with deleted role snapshot (for potential rollback)

### Backward Compatibility

- No changes to method signatures or return types
- Existing error handling behavior unchanged
- Same validation rules and error messages
- UI consumers require no code changes

## Integration Points

### Auto-save Triggering

- Call `_debouncedSave()` after each successful CRUD operation
- Pass current roles state to trigger persistence
- Handle auto-save errors independently from CRUD errors
- Never block CRUD operations for save failures

### Operation Tracking

Add operation tracking for better error handling:

```typescript
interface PendingOperation {
  type: "create" | "update" | "delete";
  roleId: string;
  timestamp: string;
  rollbackData?: RoleViewModel; // For rollback on save failure
}
```

### Error Isolation

- CRUD validation errors work exactly as before
- Persistence errors handled separately and don't affect CRUD flow
- Users see immediate UI updates regardless of save status
- Save errors appear as background notifications, not blocking errors

## State Management

### Optimistic Updates

- Apply UI changes immediately (existing behavior)
- Store rollback data before changes
- Rollback only on persistent save failures, not CRUD validation failures
- Maintain separate error states for CRUD vs persistence errors

### Operation Queuing

- Add operations to pending queue before save
- Remove from queue after successful persistence
- Use queue for retry logic and user feedback
- Clear queue on successful batch saves

## Dependencies

- Requires comprehensive error handling implementation
- Uses debounced save functionality from auto-save task
- Imports existing validation and mapping functions

## Acceptance Criteria

- [ ] `createRole` triggers auto-save after successful creation
- [ ] `updateRole` triggers auto-save after successful update
- [ ] `deleteRole` triggers auto-save after successful deletion
- [ ] Method signatures and return types unchanged
- [ ] Existing validation logic preserved exactly
- [ ] CRUD errors work independently from persistence errors
- [ ] UI updates remain immediate and responsive
- [ ] Rollback works for save failures but not validation failures

## Testing Requirements

- Unit tests confirming unchanged CRUD behavior
- Integration tests verifying auto-save triggering
- Tests for error isolation (CRUD vs persistence)
- Tests for optimistic updates and rollbacks
- Backward compatibility tests with existing consumer code

## Edge Cases

- Handle rapid CRUD operations with debounced saves
- Manage concurrent operations safely
- Handle adapter being null/undefined gracefully
- Preserve existing behavior when store not initialized

## Implementation Notes

- Modify existing methods minimally to reduce risk
- Add auto-save calls at the end of successful operations
- Use existing error handling patterns for consistency
- Log persistence operations for debugging
- Ensure thread safety for concurrent operations
- Test thoroughly with existing UI components to ensure no breaking changes

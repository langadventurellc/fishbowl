---
id: T-add-sync-and-bulk-operation
title: Add sync and bulk operation methods
status: done
priority: medium
parent: F-roles-store-refactoring
prerequisites:
  - T-implement-auto-save-logic
affectedFiles:
  packages/ui-shared/src/stores/rolesStore.ts: "Added three new methods to
    RolesActions interface and implemented them: exportRoles() transforms
    current UI state to persistence format, importRoles() validates and imports
    external data then saves to persistence, resetRoles() clears store state and
    calls adapter reset"
  packages/ui-shared/src/stores/__tests__/rolesStore.test.ts:
    Added comprehensive
    test suite for sync and bulk operation methods including success cases,
    error handling, adapter validation, and data structure validation tests
log:
  - Successfully implemented sync and bulk operation methods for the roles
    store, adding exportRoles(), importRoles(), and resetRoles() methods with
    comprehensive error handling, loading state management, and data validation.
    The syncWithStorage() method was already implemented. All methods follow the
    existing patterns for adapter integration, async operations, and state
    management. Added extensive unit tests covering success cases, error
    handling, and edge cases. All quality checks and tests pass.
schema: v1.0
childrenIds: []
created: 2025-08-11T18:29:17.979Z
updated: 2025-08-11T18:29:17.979Z
---

# Add Sync and Bulk Operation Methods

## Purpose

Implement additional persistence methods for manual sync operations and bulk data operations, enabling external change detection and data import/export functionality.

## Implementation Details

### New Store Methods

Add these methods to `RolesActions`:

- `syncWithStorage(): Promise<void>` - Reload from storage (for external changes)
- `exportRoles(): Promise<PersistedRolesSettingsData>` - Export current roles for backup
- `importRoles(data: PersistedRolesSettingsData): Promise<void>` - Import roles from backup
- `resetRoles(): Promise<void>` - Clear all roles and reset storage

### File Locations

- Update: `packages/ui-shared/src/stores/rolesStore.ts`

## Technical Requirements

### Sync Implementation

- `syncWithStorage()`:
  - Load fresh data from adapter
  - Transform using mapping functions
  - Update store state with loaded data
  - Handle case where no data exists (empty array)
  - Preserve UI state like error messages during sync

### Bulk Operations

- `exportRoles()`:
  - Transform current UI state to persistence format
  - Return formatted data structure ready for serialization
  - Include schema version and timestamps

- `importRoles()`:
  - Validate imported data structure
  - Transform from persistence to UI format
  - Replace current store state with imported data
  - Save imported data to persistence
  - Update `lastSyncTime` after successful import

- `resetRoles()`:
  - Clear local store state
  - Call adapter's `reset()` method
  - Set `isInitialized = false` to allow re-initialization

### Error Handling

- Wrap all async operations in try/catch blocks
- Log detailed error information for debugging
- Set appropriate error states in store
- Never corrupt existing data during failed operations
- Provide recovery suggestions in error messages

## State Management Updates

### Loading States

- Set `isLoading: true` during sync operations
- Set `isSaving: true` during import/reset operations
- Clear loading states on completion or error

### Data Consistency

- Validate all imported data against schemas
- Filter out invalid roles during import
- Maintain data integrity during all operations
- Update timestamps appropriately

## Dependencies

- Requires auto-save logic implementation
- Import both mapping functions: `mapRolesPersistenceToUI`, `mapRolesUIToPersistence`
- Import validation schemas from `@fishbowl-ai/shared`

## Acceptance Criteria

- [ ] `syncWithStorage()` reloads data from persistence
- [ ] `exportRoles()` returns properly formatted data
- [ ] `importRoles()` validates and imports external data
- [ ] `resetRoles()` clears store and storage completely
- [ ] All operations handle errors gracefully
- [ ] Loading states provide proper user feedback
- [ ] Data validation prevents corruption
- [ ] Operations work correctly with empty/null data

## Testing Requirements

- Unit tests for each new method
- Integration tests with mock adapter
- Error handling tests for network/file failures
- Data validation tests with malformed input
- Round-trip tests (export → import → verify)

## Security Considerations

- Validate all imported data structures
- Sanitize imported role data before storage
- Never expose internal adapter errors to UI
- Implement rate limiting for rapid sync operations

## Implementation Notes

- Follow async/await patterns consistently
- Use existing validation utilities from shared package
- Log operations for debugging and monitoring
- Maintain backward compatibility with existing methods
- Consider performance implications for large role datasets

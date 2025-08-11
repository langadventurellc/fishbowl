---
id: T-add-adapter-integration-to
title: Add adapter integration to roles store
status: open
priority: high
parent: F-roles-store-refactoring
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-11T18:28:34.903Z
updated: 2025-08-11T18:28:34.903Z
---

# Add Adapter Integration to Roles Store

## Purpose

Integrate the `RolesPersistenceAdapter` interface into the existing Zustand roles store, adding the foundation for file-based persistence while maintaining backward compatibility.

## Implementation Details

### Store State Additions

Add these new state properties to `RolesState` interface:

- `adapter: RolesPersistenceAdapter | null` - The persistence adapter instance
- `isInitialized: boolean` - Whether initial data has been loaded
- `isSaving: boolean` - Whether a save operation is in progress
- `lastSyncTime: string | null` - ISO timestamp of last successful sync
- `pendingOperations: Array<{ type: string; timestamp: string }>` - Queue of pending operations

### Store Actions Additions

Add these new methods to `RolesActions` interface:

- `setAdapter(adapter: RolesPersistenceAdapter): void` - Set the adapter instance
- `initialize(adapter: RolesPersistenceAdapter): Promise<void>` - Load initial data from persistence

### File Locations

- Update: `packages/ui-shared/src/stores/rolesStore.ts`

## Technical Requirements

### State Management

- Add new state properties with proper TypeScript typing
- Initialize new properties with appropriate defaults
- Ensure backward compatibility with existing store consumers

### Method Implementation

- `setAdapter`: Simple setter that stores the adapter instance
- `initialize`:
  - Sets the adapter
  - Loads data using the adapter's `load()` method
  - Uses mapping functions to transform persistence data to UI format
  - Sets `isInitialized = true` after successful load
  - Handles load errors gracefully

## Dependencies

- Import `RolesPersistenceAdapter` from `@fishbowl-ai/ui-shared`
- Import mapping functions: `mapRolesPersistenceToUI`
- Use existing error handling patterns from the store

## Acceptance Criteria

- [ ] New state properties added with proper typing
- [ ] `setAdapter` method stores adapter reference
- [ ] `initialize` method loads initial data from adapter
- [ ] Store maintains backward compatibility
- [ ] Error handling matches existing store patterns
- [ ] TypeScript compilation succeeds
- [ ] Unit tests pass for new functionality

## Testing Requirements

- Add unit tests for `setAdapter` method
- Add unit tests for `initialize` method with mock adapter
- Test error handling during initialization
- Ensure existing tests continue to pass

## Implementation Notes

- Follow the exact patterns used in existing settings stores
- Use proper async/await error handling
- Log detailed errors for debugging
- Never throw errors that could crash the UI

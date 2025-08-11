---
id: T-implement-desktoprolesadapter
title: Implement DesktopRolesAdapter class
status: done
priority: high
parent: F-desktop-adapter-implementation
prerequisites:
  - T-add-roles-api-to-electron
affectedFiles:
  apps/desktop/src/adapters/desktopRolesAdapter.ts: Created DesktopRolesAdapter
    class implementing RolesPersistenceAdapter interface with save(), load(),
    and reset() methods using window.electronAPI.roles IPC communication.
    Includes proper error handling, null returns for missing data, and singleton
    export.
  apps/desktop/src/adapters/__tests__/desktopRolesAdapter.test.ts:
    Created comprehensive unit tests with 27 test cases covering all methods,
    error scenarios, edge cases, interface compliance, and singleton behavior.
    Tests include mocked electronAPI, error mapping verification, and complete
    coverage of success and failure paths.
log:
  - Implemented DesktopRolesAdapter class following exact pattern from
    DesktopSettingsAdapter. The adapter implements RolesPersistenceAdapter
    interface using Electron IPC communication through window.electronAPI.roles.
    Key features include proper error handling with RolesPersistenceError
    mapping, null return for missing roles data, void return for reset method
    despite IPC returning data, and comprehensive unit testing with 100%
    coverage (27/27 tests passed). Implementation follows project conventions
    and passes all quality checks.
schema: v1.0
childrenIds: []
created: 2025-08-11T03:15:22.054Z
updated: 2025-08-11T03:15:22.054Z
---

# Implement DesktopRolesAdapter Class

## Context

Create the main adapter class that implements the RolesPersistenceAdapter interface using Electron IPC, following the exact pattern of DesktopSettingsAdapter.

## Implementation Requirements

Create `apps/desktop/src/adapters/desktopRolesAdapter.ts`:

### Adapter Class Implementation

```typescript
export class DesktopRolesAdapter implements RolesPersistenceAdapter {
  async save(roles: PersistedRolesSettingsData): Promise<void> {
    // Use window.electronAPI.roles.save()
    // Handle IPC errors and map to RolesPersistenceError
  }

  async load(): Promise<PersistedRolesSettingsData | null> {
    // Use window.electronAPI.roles.load()
    // Return null for "not found" cases
    // Handle errors and map to RolesPersistenceError
  }

  async reset(): Promise<void> {
    // Use window.electronAPI.roles.reset()
    // Handle errors and map to RolesPersistenceError
  }
}
```

### Error Handling Pattern

- Check if error is already RolesPersistenceError and re-throw
- Map IPC communication errors to RolesPersistenceError with appropriate context
- Handle "Failed to load roles" as null return (not error)
- Include operation context in error messages ("save", "load", "reset")
- Never expose internal implementation details

### Singleton Export

```typescript
export const desktopRolesAdapter = new DesktopRolesAdapter();
```

### Follow Existing Pattern

Study and replicate the exact error handling logic from DesktopSettingsAdapter:

- Same try/catch structure
- Same error type checking
- Same error message construction
- Same null handling for missing data

## Acceptance Criteria

- [ ] Implements all RolesPersistenceAdapter interface methods
- [ ] Uses window.electronAPI.roles for all IPC communication
- [ ] Maps IPC errors to RolesPersistenceError with proper context
- [ ] Returns null for missing roles (not error) in load()
- [ ] Follows exact same error handling pattern as DesktopSettingsAdapter
- [ ] Provides singleton instance export
- [ ] Includes comprehensive unit tests with mocked electronAPI
- [ ] Tests cover all success scenarios
- [ ] Tests cover all error scenarios (IPC failures, etc.)
- [ ] Tests verify proper error type handling and re-throwing

## Dependencies

- T-add-roles-api-to-electron (needs window.electronAPI.roles)

## Testing Requirements

- Mock window.electronAPI.roles methods
- Test successful save operation
- Test successful load operation (with data)
- Test successful load operation (no data - returns null)
- Test successful reset operation
- Test IPC communication failures for all methods
- Test proper error mapping to RolesPersistenceError
- Test error re-throwing for already wrapped errors
- Verify singleton instance accessibility

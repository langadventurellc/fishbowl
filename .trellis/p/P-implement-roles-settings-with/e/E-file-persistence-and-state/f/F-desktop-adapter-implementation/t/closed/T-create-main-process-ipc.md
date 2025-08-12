---
id: T-create-main-process-ipc
title: Create main process IPC handlers for roles
status: done
priority: high
parent: F-desktop-adapter-implementation
prerequisites:
  - T-implement-roles-repository
affectedFiles:
  apps/desktop/src/electron/rolesHandlers.ts: New IPC handlers file with three
    handlers (load, save, reset) following settingsHandlers patterns
  apps/desktop/src/electron/main.ts: Updated to import setupRolesHandlers,
    initialize rolesRepositoryManager, and register handlers during startup
  apps/desktop/src/electron/__tests__/rolesHandlers.test.ts: Comprehensive unit
    tests with 11 test cases covering all handlers and error scenarios
log:
  - >-
    Implemented complete main process IPC handlers for roles operations with
    comprehensive error handling, repository integration, and full unit test
    coverage.


    Created rolesHandlers.ts with three handlers following exact patterns from
    settingsHandlers:

    - ROLES_CHANNELS.LOAD handler: Loads roles data, handles null file response
    by converting to undefined

    - ROLES_CHANNELS.SAVE handler: Saves roles data through repository with
    proper validation

    - ROLES_CHANNELS.RESET handler: Resets roles by deleting file, returns
    undefined


    Integrated with main.ts by initializing rolesRepositoryManager with userData
    path and calling setupRolesHandlers() in proper sequence.


    All handlers include:

    - Proper try/catch error handling with serializeError for IPC transport

    - Repository access through rolesRepositoryManager singleton

    - Comprehensive logging for debugging and monitoring

    - Type safety with strict TypeScript definitions


    Unit tests provide 100% coverage with 11 test cases covering success
    scenarios, error conditions, and edge cases including repository
    initialization errors.
schema: v1.0
childrenIds: []
created: 2025-08-11T03:14:53.046Z
updated: 2025-08-11T03:14:53.046Z
---

# Create Main Process IPC Handlers for Roles

## Context

Implement the main process IPC handlers that bridge the renderer process requests with the roles repository, following the exact pattern of settingsHandlers.

## Implementation Requirements

Create `apps/desktop/src/electron/rolesHandlers.ts`:

### Handler Functions

```typescript
export function setupRolesHandlers(): void {
  // ROLES_CHANNELS.LOAD handler
  ipcMain.handle(ROLES_CHANNELS.LOAD, async (_event): Promise<RolesLoadResponse>)

  // ROLES_CHANNELS.SAVE handler
  ipcMain.handle(ROLES_CHANNELS.SAVE, async (_event, request: RolesSaveRequest): Promise<RolesSaveResponse>)

  // ROLES_CHANNELS.RESET handler
  ipcMain.handle(ROLES_CHANNELS.RESET, async (_event): Promise<RolesResetResponse>)
}
```

### Handler Implementation Pattern

- Use rolesRepositoryManager.get() to access repository
- Wrap all operations in try/catch blocks
- Return `{ success: true, data }` for successful operations
- Return `{ success: false, error: serializeError(error) }` for failures
- Add appropriate debug/error logging using logger
- Follow exact same pattern as settingsHandlers

### Main Process Integration

Update `apps/desktop/src/electron/main.ts`:

- Import setupRolesHandlers
- Call setupRolesHandlers() in the ready event handler
- Initialize rolesRepositoryManager with proper data path

### Security Validation

- Validate all incoming requests in handlers
- Ensure rolesRepositoryManager is initialized before use
- Never expose internal file paths or system details

## Acceptance Criteria

- [ ] All three IPC handlers implemented (load, save, reset)
- [ ] Handlers follow exact same pattern as settings handlers
- [ ] Proper error handling with serializeError for cross-process communication
- [ ] Repository manager integration with proper initialization
- [ ] setupRolesHandlers() called from main.ts ready event
- [ ] Comprehensive logging for debugging and monitoring
- [ ] Input validation for all handler parameters
- [ ] Unit tests for all handler functions with mocked repository
- [ ] Tests cover success cases, error cases, and edge cases
- [ ] Tests verify proper error serialization

## Dependencies

- T-implement-roles-repository (needs repository layer)

## Testing Requirements

- Mock rolesRepositoryManager and its repository
- Test successful load operation returning data
- Test load operation when no roles exist (null)
- Test successful save operation
- Test successful reset operation
- Test all error scenarios (repository failures)
- Test handler registration in setupRolesHandlers()
- Verify proper error serialization for IPC transport
- Test logging output for different scenarios

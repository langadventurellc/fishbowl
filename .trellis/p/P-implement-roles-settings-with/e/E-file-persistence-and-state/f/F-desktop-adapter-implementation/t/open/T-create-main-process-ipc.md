---
id: T-create-main-process-ipc
title: Create main process IPC handlers for roles
status: open
priority: high
parent: F-desktop-adapter-implementation
prerequisites:
  - T-implement-roles-repository
affectedFiles: {}
log: []
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

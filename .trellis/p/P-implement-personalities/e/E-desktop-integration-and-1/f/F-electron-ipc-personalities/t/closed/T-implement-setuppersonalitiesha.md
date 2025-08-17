---
id: T-implement-setuppersonalitiesha
title: Implement setupPersonalitiesHandlers with IPC channel handlers
status: done
priority: high
parent: F-electron-ipc-personalities
prerequisites:
  - T-create-personalitiesrepository
affectedFiles:
  apps/desktop/src/data/repositories/personalitiesRepositoryManager.ts:
    Created PersonalitiesRepositoryManager singleton following
    rolesRepositoryManager pattern with initialize, get, and reset methods
  apps/desktop/src/electron/personalitiesHandlers.ts: Implemented
    setupPersonalitiesHandlers with three IPC handlers (load, save, reset)
    including error handling, logging, and integration with
    PersonalitiesRepository
  apps/desktop/src/electron/__tests__/personalitiesHandlers.test.ts:
    Created comprehensive unit tests with 100% coverage testing all success and
    error paths for each handler
log:
  - Successfully implemented setupPersonalitiesHandlers with all three IPC
    channel handlers (load, save, reset) following the exact pattern from
    rolesHandlers. Created PersonalitiesRepositoryManager for singleton access
    and comprehensive unit tests with 100% coverage. All handlers include proper
    error handling, logging, and integration with PersonalitiesRepository.
    Quality checks and all 11 unit tests pass successfully.
schema: v1.0
childrenIds: []
created: 2025-08-17T02:59:50.512Z
updated: 2025-08-17T02:59:50.512Z
---

# Implement setupPersonalitiesHandlers with IPC channel handlers

## Context and Purpose

Create the main process IPC handlers for personalities operations, following the exact pattern established by `setupRolesHandlers`. This function will register three IPC channel handlers that integrate with the PersonalitiesRepository for secure file operations.

## Implementation Requirements

### File Location

- Create `apps/desktop/src/electron/personalitiesHandlers.ts`
- Follow the exact structure and patterns from `apps/desktop/src/electron/rolesHandlers.ts`

### Required Imports

```typescript
import { ipcMain } from "electron";
import { PERSONALITIES_CHANNELS } from "../shared/ipc/personalitiesConstants";
import {
  PersonalitiesLoadResponse,
  PersonalitiesSaveRequest,
  PersonalitiesSaveResponse,
  PersonalitiesResetResponse,
} from "../shared/ipc/personalitiesTypes";
import { serializeError } from "@fishbowl-ai/shared";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { personalitiesRepositoryManager } from "../data/repositories/personalitiesRepositoryManager";
```

### Function Structure

```typescript
export function setupPersonalitiesHandlers(): void {
  // Handler for personalities:load
  ipcMain.handle(
    PERSONALITIES_CHANNELS.LOAD,
    async (_event): Promise<PersonalitiesLoadResponse> => {
      // Implementation following rolesHandlers pattern
    },
  );

  // Handler for personalities:save
  ipcMain.handle(
    PERSONALITIES_CHANNELS.SAVE,
    async (
      _event,
      request: PersonalitiesSaveRequest,
    ): Promise<PersonalitiesSaveResponse> => {
      // Implementation following rolesHandlers pattern
    },
  );

  // Handler for personalities:reset
  ipcMain.handle(
    PERSONALITIES_CHANNELS.RESET,
    async (_event): Promise<PersonalitiesResetResponse> => {
      // Implementation following rolesHandlers pattern
    },
  );

  logger.info("Personalities IPC handlers initialized");
}
```

### Handler Implementation Details

**Load Handler (personalities:load):**

- Use `personalitiesRepositoryManager.get()` to access repository
- Call `repository.loadPersonalities()`
- Return `{ success: true, data: personalities || undefined }` for success
- Return `{ success: false, error: serializeError(error) }` for errors
- Log debug messages for load operations and results

**Save Handler (personalities:save):**

- Accept `PersonalitiesSaveRequest` with personalities data
- Use repository to save: `repository.savePersonalities(request.personalities)`
- Return `{ success: true }` for successful saves
- Return `{ success: false, error: serializeError(error) }` for errors
- Log debug messages for save operations with data counts

**Reset Handler (personalities:reset):**

- Call `repository.resetPersonalities()` to restore defaults
- Return `{ success: true, data: undefined }` after successful reset
- Return `{ success: false, error: serializeError(error) }` for errors
- Log debug messages for reset operations

### Error Handling

- Wrap all operations in try-catch blocks
- Use `serializeError` utility for consistent error serialization
- Log errors at error level with context
- Log successful operations at debug level
- Never expose sensitive file system paths in error responses

### Integration Requirements

- Use existing `PERSONALITIES_CHANNELS` constants
- Follow exact response type structure from roles handlers
- Integrate with PersonalitiesRepository through repository manager pattern
- Use consistent logging format and levels
- Handle async operations properly with Promise returns

## Unit Tests Requirements

Create comprehensive unit tests in `apps/desktop/src/electron/__tests__/personalitiesHandlers.test.ts`:

**Test Coverage Required:**

- Handler registration verification for all three channels
- Successful load operation returning valid data
- Load operation returning null for missing file
- Load operation error handling with proper error serialization
- Successful save operation with valid personalities data
- Save operation error handling with repository failures
- Successful reset operation returning undefined data
- Reset operation error handling with repository failures
- Proper logging verification for all operations
- Error serialization testing for different error types

**Test Structure:**

- Mock `ipcMain.handle` to capture registered handlers
- Mock `personalitiesRepositoryManager` and repository methods
- Mock logger to verify logging calls
- Test all success and error paths for each handler
- Verify response format matches expected types
- Test error serialization with `serializeError`

## Dependencies

- `PersonalitiesRepository` (created in previous task)
- `personalitiesRepositoryManager` (needs creation following roles pattern)
- IPC response types from personalities IPC types
- `PERSONALITIES_CHANNELS` constants
- `serializeError` utility from shared package
- Logging utilities from shared package

## Acceptance Criteria

- [ ] setupPersonalitiesHandlers function created following rolesHandlers pattern exactly
- [ ] All three IPC handlers (load, save, reset) implemented with proper error handling
- [ ] Integration with PersonalitiesRepository through repository manager
- [ ] Consistent response format matching expected IPC types
- [ ] Comprehensive unit tests with 100% code coverage
- [ ] All tests passing with proper mocking
- [ ] Error serialization working correctly
- [ ] Logging implemented at appropriate levels
- [ ] Handler registration verified in tests

**File References:**

- Pattern: `apps/desktop/src/electron/rolesHandlers.ts:20-84`
- Tests: `apps/desktop/src/electron/__tests__/rolesHandlers.test.ts`
- IPC Types: `apps/desktop/src/shared/ipc/rolesTypes.ts` (for pattern reference)

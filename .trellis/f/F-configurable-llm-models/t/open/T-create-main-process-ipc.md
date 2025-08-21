---
id: T-create-main-process-ipc
title: Create main process IPC handlers for LLM models
status: open
priority: high
parent: F-configurable-llm-models
prerequisites:
  - T-create-ipc-constants-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-21T22:38:50.066Z
updated: 2025-08-21T22:38:50.066Z
---

Implement main process IPC handlers that use the existing LLM models repository to serve data to the renderer process through secure IPC channels.

## Context

The renderer process needs to load LLM models data through IPC instead of directly accessing the repository. This task creates the main process side of the IPC communication, following the established pattern used by LLM configurations.

## Implementation Requirements

**Create IPC Handler File:**

- File: `apps/desktop/src/electron/handlers/llmModelsHandlers.ts`
- Implement `setupLlmModelsHandlers(ipcMain, service)` function
- Follow the pattern established in `llmConfigHandlers.ts`

**Handler Implementation:**

- Register handler for `LLM_MODELS_CHANNELS.LOAD` channel
- Use dependency injection pattern with LlmModelsRepositoryManager
- Handle errors gracefully with proper error serialization
- Return data in established response format

**Error Handling:**

- Use `serializeError` function for consistent error formatting
- Handle repository initialization failures
- Handle file read errors and validation failures
- Log errors appropriately for debugging

**Integration with Repository:**

- Use existing `llmModelsRepositoryManager.get()` to access repository
- Call `repository.loadLlmModels()` to get data
- Transform repository data to proper response format
- Handle case where repository is not initialized

## Technical Approach

**Follow Existing Patterns:**

- Study `llmConfigHandlers.ts` as reference implementation
- Use the same error handling, logging, and dependency injection patterns
- Follow the same handler registration and response format

**Handler Structure:**

```typescript
export function setupLlmModelsHandlers(
  ipcMain: IpcMain,
  service?: LlmModelsService,
): void {
  ipcMain.handle(
    LLM_MODELS_CHANNELS.LOAD,
    async (): Promise<LlmModelsLoadResponse> => {
      try {
        // Implementation here
      } catch (error) {
        return {
          success: false,
          error: serializeError(error),
        };
      }
    },
  );
}
```

**Service Integration:**

- Create LlmModelsService class that wraps repository operations
- Follow the pattern used by LlmConfigService for consistency
- Handle repository initialization and error states

## Acceptance Criteria

- IPC handler file created following established patterns
- LOAD handler implemented with proper error handling
- Uses existing LlmModelsRepository through dependency injection
- Returns data in correct response format with success/error structure
- Handles all error conditions gracefully
- Logs errors appropriately for debugging
- Code follows established naming and organizational patterns

## Dependencies

- Requires IPC constants and types from previous task
- Requires existing `LlmModelsRepository` and `llmModelsRepositoryManager`
- Should follow patterns from `llmConfigHandlers.ts`

## Testing Requirements

- Add comprehensive unit tests for handler functions
- Test successful data loading scenarios
- Test error handling for repository failures
- Test error handling for missing/invalid data
- Mock dependencies appropriately for isolation
- Verify response format matches type definitions

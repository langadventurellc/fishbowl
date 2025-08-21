---
id: T-add-llm-models-api-to-context
title: Add LLM models API to context bridge in preload script
status: done
priority: high
parent: F-configurable-llm-models
prerequisites:
  - T-create-main-process-ipc
affectedFiles:
  apps/desktop/src/electron/preload.ts: Added llmModels API with load() method
    following established patterns, including proper error handling and logging
  apps/desktop/src/types/electron.d.ts: Updated ElectronAPI interface to include
    llmModels property with JSDoc documentation for TypeScript support
log:
  - Successfully implemented LLM models API in the context bridge following
    established patterns from roles, personalities, and agents APIs. Added
    llmModels.load() method to electronAPI object with proper error handling,
    logging, and TypeScript types. The implementation uses ipcRenderer.invoke()
    to communicate with the main process handler and includes comprehensive
    error handling for both IPC communication failures and response errors. All
    quality checks (lint, format, type-check) pass successfully.
schema: v1.0
childrenIds: []
created: 2025-08-21T22:39:09.251Z
updated: 2025-08-21T22:39:09.251Z
---

Expose LLM models IPC API through the context bridge in the preload script so the renderer process can securely access LLM models data.

## Context

The renderer process needs to access LLM models data through `window.electronAPI.llmModels.load()`. This task adds the llmModels API to the context bridge following the established pattern used by other features.

## Implementation Requirements

**Update Preload Script:**

- File: `apps/desktop/src/electron/preload.ts`
- Add `llmModels` property to the `electronAPI` object
- Implement `load()` method that calls the IPC handler
- Follow the pattern used by `roles`, `personalities`, and `agents` APIs

**API Implementation:**

- Create `llmModels.load()` async function
- Use `ipcRenderer.invoke()` to call the main process handler
- Handle response success/error states
- Throw appropriate errors for renderer consumption
- Add proper error logging

**Error Handling:**

- Check response success flag and throw errors for failures
- Log errors using the preload logger
- Provide meaningful error messages for renderer
- Handle IPC communication failures

**Type Safety:**

- Import required types for request/response
- Add proper TypeScript typing for the API
- Update `ElectronAPI` interface to include llmModels

## Technical Approach

**Follow Existing Patterns:**

- Study the `roles`, `personalities`, and `agents` API implementations
- Use the same error handling and logging patterns
- Follow the same async/await and response handling approach

**API Structure:**

```typescript
llmModels: {
  load: async (): Promise<LlmModelsSettingsData> => {
    try {
      const response = (await ipcRenderer.invoke(
        LLM_MODELS_CHANNELS.LOAD,
      )) as LlmModelsLoadResponse;
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to load LLM models");
      }
      return response.data!;
    } catch (error) {
      logger.error("Error loading LLM models:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to communicate with main process");
    }
  };
}
```

**Type Updates:**

- Update `apps/desktop/src/types/electron.ts` to include llmModels API
- Import `LlmModelsSettingsData` type from shared package
- Ensure type consistency across IPC boundary

## Acceptance Criteria

- llmModels API added to electronAPI object in preload.ts
- load() method implemented with proper error handling
- Uses established IPC communication patterns
- Proper error logging and meaningful error messages
- ElectronAPI interface updated with llmModels type
- Code follows established naming and organizational patterns
- API returns correctly typed data to renderer

## Dependencies

- Requires IPC constants and types from previous tasks
- Requires main process handlers to be implemented
- Should follow patterns from existing preload API implementations

## Testing Requirements

- Add unit tests for preload API functions
- Test successful data loading scenarios
- Test error handling for IPC failures
- Test error handling for malformed responses
- Mock IPC renderer appropriately for isolation
- Verify API integration with ElectronAPI interface

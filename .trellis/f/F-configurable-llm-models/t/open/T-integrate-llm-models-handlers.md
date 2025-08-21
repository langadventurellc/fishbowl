---
id: T-integrate-llm-models-handlers
title: Integrate LLM models handlers into main process initialization
status: open
priority: medium
parent: F-configurable-llm-models
prerequisites:
  - T-create-main-process-ipc
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-21T22:39:58.225Z
updated: 2025-08-21T22:39:58.225Z
---

Register the LLM models IPC handlers in the main process initialization code so they are available when the application starts, following the established pattern used by other features.

## Context

The IPC handlers for LLM models need to be registered during main process initialization so they are available for renderer process calls. This follows the same pattern used by LLM configurations, roles, personalities, and agents.

## Implementation Requirements

**Find Main Process Setup:**

- Locate the main process initialization file where IPC handlers are registered
- This is likely in `apps/desktop/src/electron/main.ts` or similar main process entry point
- Study how other handlers (llmConfig, roles, personalities, agents) are registered

**Register Handlers:**

- Import the `setupLlmModelsHandlers` function
- Call it during main process initialization with appropriate dependencies
- Follow the same pattern used by other feature handlers
- Ensure proper error handling if handler setup fails

**Service Integration:**

- Determine if a LlmModelsService needs to be created or if direct repository access is sufficient
- Follow the dependency injection pattern used by other features
- Ensure repository manager is available and initialized before handler setup

**Initialization Order:**

- Register handlers after repository managers are initialized
- Follow the established initialization sequence
- Ensure handlers are ready before renderer process starts

## Technical Approach

**Follow Existing Patterns:**

- Study how `setupLlmConfigHandlers` is integrated into main process
- Use the same import and registration patterns
- Follow the same error handling and logging approaches

**Integration Structure:**

```typescript
// Import handlers
import { setupLlmModelsHandlers } from "./handlers/llmModelsHandlers";

// Register during initialization
setupLlmModelsHandlers(ipcMain, llmModelsService);
```

**Service Dependencies:**

- Determine if existing repository manager is sufficient
- Create service wrapper if needed following LlmConfigService pattern
- Ensure proper dependency injection and error handling

## Acceptance Criteria

- LLM models handlers registered in main process initialization
- Handlers available when renderer process makes IPC calls
- Follows established patterns from other feature integrations
- Proper error handling if handler setup fails
- Repository/service dependencies properly injected
- Integration doesn't break existing functionality
- Initialization order respects dependencies

## Dependencies

- Requires main process IPC handlers to be implemented
- Requires understanding of main process initialization patterns
- May require LlmModelsService creation if not using direct repository access

## Testing Requirements

- Add tests for main process handler registration
- Test that handlers are available for IPC calls
- Test error handling for failed handler setup
- Test integration with existing main process initialization
- Verify that other features continue to work after integration

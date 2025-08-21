---
id: T-create-ipc-constants-and
title: Create IPC constants and types for LLM models
status: done
priority: high
parent: F-configurable-llm-models
prerequisites: []
affectedFiles:
  apps/desktop/src/shared/ipc/llmModelsConstants.ts:
    Created IPC channel constants
    file with LLM_MODELS_CHANNELS object containing LOAD channel and
    LlmModelsChannelType
  apps/desktop/src/shared/ipc/llmModelsTypes.ts: Created IPC types file with
    LlmModelsLoadResponse interface extending
    IPCResponse<PersistedLlmModelsSettingsData>
  apps/desktop/src/shared/ipc/index.ts: Updated barrel export file to include LLM models constants and response types
  apps/desktop/src/shared/ipc/__tests__/llmModelsIPC.test.ts:
    Added comprehensive
    unit tests for constants, types, error handling, and integration validation
log:
  - Successfully implemented IPC constants and types infrastructure for LLM
    models following established patterns. Created llmModelsConstants.ts with
    LLM_MODELS_CHANNELS containing the LOAD channel, and llmModelsTypes.ts with
    LlmModelsLoadResponse interface that extends IPCResponse. Updated the shared
    IPC index file to export all new constants and types. Added comprehensive
    unit tests covering constants validation, type compilation, error handling,
    and barrel exports. All quality checks pass including linting, formatting,
    and type checking. Tests confirm proper integration with existing IPC
    patterns and compatibility with PersistedLlmModelsSettingsData from shared
    package.
schema: v1.0
childrenIds: []
created: 2025-08-21T22:38:31.499Z
updated: 2025-08-21T22:38:31.499Z
---

Create IPC communication infrastructure for LLM models following the established pattern used by LLM configurations, roles, personalities, and agents.

## Context

The current `useLlmModels` hook is incorrectly trying to directly import and use the `LlmModelsRepository` from the renderer process, which violates Electron's security model. The renderer process cannot directly access Node.js modules like file system operations. This needs to be fixed by implementing proper IPC communication.

## Implementation Requirements

**Create IPC Constants File:**

- File: `apps/desktop/src/shared/ipc/llmModelsConstants.ts`
- Define `LLM_MODELS_CHANNELS` object with `LOAD` channel constant
- Follow the pattern used in `llmConfigConstants.ts`, `rolesConstants.ts`, etc.

**Create IPC Types:**

- File: `apps/desktop/src/shared/ipc/llmModelsTypes.ts`
- Define `LlmModelsLoadResponse` type with success/error pattern
- Use the established response format: `{ success: boolean; data?: T; error?: { message: string; name: string } }`
- Import and re-export types in `apps/desktop/src/shared/ipc/index.ts`

**Update Shared Types:**

- Import `LlmModelsSettingsData` from `@fishbowl-ai/shared` for use in response types
- Ensure consistent typing across the IPC boundary

## Technical Approach

**Follow Existing Patterns:**

- Study `llmConfigConstants.ts` and `llmConfigTypes.ts` as reference implementations
- Use the same error handling and response structure patterns
- Follow the same file organization and naming conventions

**Constants Structure:**

```typescript
export const LLM_MODELS_CHANNELS = {
  LOAD: "llm-models:load",
} as const;
```

**Types Structure:**

```typescript
export interface LlmModelsLoadResponse {
  success: boolean;
  data?: LlmModelsSettingsData;
  error?: { message: string; name: string };
}
```

## Acceptance Criteria

- IPC constants file created with LOAD channel
- IPC types file created with proper response types
- Types exported from shared IPC index file
- All types properly imported from shared package
- Code follows established naming and organizational patterns
- Types are compatible with existing LlmModelsRepository return types

## Dependencies

- Requires `LlmModelsSettingsData` type from `@fishbowl-ai/shared`
- Should follow patterns established in existing IPC constants and types files

## Testing Requirements

- Add unit tests for type definitions and constants
- Verify type compatibility with repository return types
- Test that constants are properly exported and accessible

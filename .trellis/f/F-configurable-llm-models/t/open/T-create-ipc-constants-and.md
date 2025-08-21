---
id: T-create-ipc-constants-and
title: Create IPC constants and types for LLM models
status: open
priority: high
parent: F-configurable-llm-models
prerequisites: []
affectedFiles: {}
log: []
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

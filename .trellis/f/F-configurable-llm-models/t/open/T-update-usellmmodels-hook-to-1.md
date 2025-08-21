---
id: T-update-usellmmodels-hook-to-1
title: Update useLlmModels hook to use IPC instead of direct repository access
status: open
priority: high
parent: F-configurable-llm-models
prerequisites:
  - T-add-llm-models-api-to-context
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-21T22:39:37.623Z
updated: 2025-08-21T22:39:37.623Z
---

Replace the direct repository import in useLlmModels hook with proper IPC calls to the main process, fixing the crypto module error and following established architectural patterns.

## Context

The current `useLlmModels` hook is incorrectly trying to import and use the `LlmModelsRepository` directly from the renderer process, causing a crypto module error because the renderer cannot access Node.js modules. This needs to be replaced with IPC calls using `window.electronAPI.llmModels.load()`.

## Implementation Requirements

**Update Hook Implementation:**

- File: `apps/desktop/src/hooks/useLlmModels.ts`
- Replace `loadModelsFromRepository` function with IPC-based implementation
- Remove direct repository imports and manager access
- Use `window.electronAPI.llmModels.load()` to get data from main process
- Remove all debugging console.log statements added for troubleshooting

**Function Changes:**

- Replace repository loading with: `const modelsData = await window.electronAPI.llmModels.load();`
- Remove crypto/Node.js dependencies that caused the original error
- Keep the same data transformation logic for converting to LlmModel format
- Maintain the same error handling patterns and return types

**Environment Checks:**

- Add proper Electron environment detection like other hooks
- Check for `window.electronAPI?.llmModels?.load` availability
- Handle non-Electron environments gracefully
- Follow the pattern used in `useLlmConfig` for environment checks

**Error Handling:**

- Handle IPC communication errors appropriately
- Maintain existing error state management and logging
- Remove repository-specific error handling
- Keep user-facing error messages consistent

## Technical Approach

**Follow Existing Patterns:**

- Study `useLlmConfig` hook as reference for IPC-based data loading
- Use the same environment detection and error handling patterns
- Keep the same hook interface and return values

**Implementation Structure:**

```typescript
const loadModelsFromRepository = useCallback(async (): Promise<LlmModel[]> => {
  try {
    // Check if running in Electron environment
    if (
      typeof window === "undefined" ||
      !window.electronAPI?.llmModels?.load ||
      typeof window.electronAPI.llmModels.load !== "function"
    ) {
      services.logger.warn(
        "Not running in Electron environment, using empty models list",
      );
      return [];
    }

    const modelsData = await window.electronAPI.llmModels.load();

    // Transform repository data to LlmModel format (keep existing logic)
    const transformedModels: LlmModel[] = [];
    for (const provider of modelsData.providers) {
      for (const model of provider.models) {
        transformedModels.push({
          id: model.id,
          name: model.name,
          provider: provider.name,
          contextLength: model.contextLength,
        });
      }
    }

    return transformedModels;
  } catch (error) {
    services.logger.error("Failed to load LLM models via IPC", error as Error);
    return []; // Fallback to empty array
  }
}, [services.logger]);
```

**Clean Up:**

- Remove all debugging console.log statements
- Remove repository manager imports
- Remove Node.js-specific imports that caused the crypto error
- Keep only the necessary imports for the hook functionality

## Acceptance Criteria

- Hook uses IPC calls instead of direct repository access
- No more crypto module errors in renderer process
- Maintains same API and behavior for consuming components
- Proper Electron environment detection with graceful fallbacks
- Error handling follows established patterns from other IPC-based hooks
- All debugging console.log statements removed
- No Node.js-specific imports remain in renderer code
- Data transformation logic preserved and working correctly

## Dependencies

- Requires context bridge API to be implemented
- Requires main process IPC handlers to be functional
- Should follow patterns from useLlmConfig hook

## Testing Requirements

- Add unit tests for IPC-based data loading
- Test Electron environment detection and fallbacks
- Test error handling for IPC failures
- Test data transformation logic remains correct
- Mock window.electronAPI appropriately for testing
- Verify hook behavior matches existing interface
- Test that crypto module errors are resolved

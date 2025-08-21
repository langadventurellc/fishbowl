---
id: T-update-usellmmodels-hook-to
title: Update useLlmModels hook to load models from repository
status: open
priority: high
parent: F-configurable-llm-models
prerequisites:
  - T-integrate-llmmodelsrepositorym
  - T-update-llmmodel-interface-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-21T19:39:44.816Z
updated: 2025-08-21T19:39:44.816Z
---

## Context

Update the `useLlmModels` hook in `apps/desktop/src/hooks/useLlmModels.ts` to load LLM models from the repository configuration file instead of the hard-coded switch statement. The hook's external API must remain unchanged to maintain compatibility with existing UI components.

This task replaces the hard-coded `_getModelsForProvider` function with repository-based data loading while preserving all existing functionality and error handling patterns.

## Specific Implementation Requirements

### 1. Replace Hard-coded Model Loading

Remove the current `_getModelsForProvider` function and replace it with repository-based loading:

**Current Implementation to Remove:**

```typescript
const _getModelsForProvider = useCallback(
  (providerType: string, providerName: string): LlmModel[] => {
    switch (providerType.toLowerCase()) {
      case "openai":
        return [
          /* hard-coded models */
        ];
      case "anthropic":
        return [
          /* hard-coded models */
        ];
      default:
        return [];
    }
  },
  [],
);
```

**New Implementation:**

```typescript
const [configuredModels, setConfiguredModels] = useState<LlmModel[]>([]);

const loadModelsFromRepository = useCallback(async (): Promise<LlmModel[]> => {
  try {
    const { llmModelsRepositoryManager } = await import(
      "../data/repositories/llmModelsRepositoryManager"
    );
    const repository = llmModelsRepositoryManager.get();
    const modelsData = await repository.loadLlmModels();

    // Transform repository data to LlmModel format
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
    services.logger.error("Failed to load LLM models from repository", error);
    return []; // Fallback to empty array
  }
}, [services.logger]);
```

### 2. Update Model Loading Logic

Replace the current `loadModels` function to use repository data:

**Updated loadModels Function:**

```typescript
const loadModels = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    // Load all configured models from repository
    const allModels = await loadModelsFromRepository();
    setConfiguredModels(allModels);

    // Filter models based on actual LLM provider configurations
    const availableModels = configurations.flatMap((config) => {
      return allModels
        .filter(
          (model) =>
            model.provider.toLowerCase() === config.provider.toLowerCase(),
        )
        .map((model) => ({
          ...model,
          provider: config.customName || config.provider, // Use custom name if available
        }));
    });

    setModels(availableModels);
  } catch (err) {
    const error =
      err instanceof Error ? err : new Error("Failed to load models");
    setError(error);
    services.logger.error("Failed to load LLM models", error);
    setModels([]); // Fallback to empty array
  } finally {
    setLoading(false);
  }
}, [configurations, services.logger, loadModelsFromRepository]);
```

### 3. Handle Repository Access Errors

Add proper error handling for repository access:

```typescript
// Handle case where repository is not initialized
if (!repository) {
  services.logger.warn(
    "LLM models repository not initialized, using empty models list",
  );
  return [];
}
```

### 4. Maintain Hook API Compatibility

Ensure the hook continues to return the same interface:

```typescript
return {
  models, // Array of LlmModel objects
  loading, // Boolean loading state
  error, // String, Error, or null
  refresh, // Function to reload models
};
```

### 5. Remove Unused Code

Remove the hard-coded model definitions and the `_getModelsForProvider` function completely.

## Technical Approach

1. **Preserve External API**: Keep hook return interface unchanged
2. **Replace Data Source**: Repository instead of hard-coded switch
3. **Maintain Error Handling**: Same error patterns and logging
4. **Add Repository Loading**: Async loading from repository
5. **Transform Data**: Convert repository format to LlmModel interface
6. **Handle Async Operations**: Proper async/await patterns
7. **Cleanup Dead Code**: Remove hard-coded model definitions

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Hook loads models from repository configuration file
- ✅ Models are filtered based on actual LLM provider configurations
- ✅ Custom provider names are used when available
- ✅ Hook API remains unchanged (models, loading, error, refresh)
- ✅ UI components continue to work without modification

### Data Transformation Requirements

- ✅ Repository provider data is correctly transformed to LlmModel format
- ✅ Provider names match configured LLM provider names
- ✅ Model IDs, names, and context lengths are preserved
- ✅ Models from unavailable providers are filtered out

### Error Handling Requirements

- ✅ Repository access errors are caught and logged
- ✅ Invalid repository data doesn't crash the hook
- ✅ Fallback to empty array when repository fails
- ✅ Error state is properly managed in hook state

### Performance Requirements

- ✅ Repository data is loaded efficiently (avoid repeated loads)
- ✅ Model transformation is performed once per configuration change
- ✅ Hook doesn't cause unnecessary re-renders
- ✅ Loading states are properly managed during async operations

### Integration Requirements

- ✅ Hook works with existing useLlmConfig integration
- ✅ Provider filtering works with configured LLM providers
- ✅ Custom provider names are respected
- ✅ Refresh functionality reloads data from repository

### Testing Requirements

- ✅ Unit tests for repository loading functionality
- ✅ Test error handling for repository failures
- ✅ Test data transformation from repository to LlmModel format
- ✅ Test integration with existing useLlmConfig hook
- ✅ Test hook API compatibility

## Dependencies

- Requires T-integrate-llmmodelsrepositorym for repository manager availability
- Requires T-update-llmmodel-interface-to for updated LlmModel interface

## Security Considerations

- **Error Isolation**: Repository errors don't crash UI components
- **Data Validation**: Repository data is validated before transformation
- **Access Control**: Repository access through proper manager interface
- **Logging Security**: Error messages don't expose sensitive information

## Files Modified

- `apps/desktop/src/hooks/useLlmModels.ts` - Replace hard-coded models with repository loading

## Integration Impact

- UI components using useLlmModels continue to work unchanged
- Model selection dropdowns show models from configuration file
- LLM provider configurations control which models are available
- Advanced users can modify models by editing JSON configuration file

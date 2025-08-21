---
id: T-update-llmmodel-interface-to
title: Update LlmModel interface to remove vision and functionCalling properties
status: done
priority: high
parent: F-configurable-llm-models
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/settings/LlmModel.ts: Removed vision and functionCalling boolean properties from interface
  apps/desktop/src/hooks/useLlmModels.ts: Removed vision and functionCalling
    properties from all OpenAI, Anthropic, and implied model definitions
log:
  - Successfully removed `vision` and `functionCalling` properties from LlmModel
    interface. Updated interface definition in ui-shared package and removed
    these properties from all hard-coded model objects in useLlmModels hook. All
    TypeScript compilation, linting, formatting, and tests pass. No breaking
    changes to existing functionality as these properties were unused in the
    codebase.
schema: v1.0
childrenIds: []
created: 2025-08-21T19:36:17.733Z
updated: 2025-08-21T19:36:17.733Z
---

## Context

Remove the `vision` and `functionCalling` boolean properties from the `LlmModel` interface as requested. This is a breaking change that simplifies the model representation to focus on core properties.

The current interface in `packages/ui-shared/src/types/settings/LlmModel.ts` includes properties that are no longer needed for the new configuration-based approach.

## Specific Implementation Requirements

### 1. Update LlmModel Interface

Modify `packages/ui-shared/src/types/settings/LlmModel.ts`:

**Current Interface:**

```typescript
export interface LlmModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  vision: boolean; // REMOVE
  functionCalling: boolean; // REMOVE
}
```

**Updated Interface:**

```typescript
export interface LlmModel {
  /** Unique identifier for the model (typically the model name) */
  id: string;

  /** Human-readable display name for the model */
  name: string;

  /** Provider that offers this model (OpenAI, Anthropic, etc.) */
  provider: string;

  /** Context window size in tokens */
  contextLength: number;
}
```

### 2. Update Hard-coded Model Definitions

Temporarily update the hard-coded models in `apps/desktop/src/hooks/useLlmModels.ts` to remove the vision and functionCalling properties from all model objects. This ensures the application continues to work during the transition.

Remove these properties from all models in the `_getModelsForProvider` function:

- Remove `vision: true/false` from all model objects
- Remove `functionCalling: true/false` from all model objects

### 3. Find and Update All References

Search the codebase for any components or functions that reference the removed properties:

- Search for `\.vision` usage patterns
- Search for `\.functionCalling` usage patterns
- Remove or comment out any code that depends on these properties
- Add TODO comments where functionality might need to be restored differently later

## Technical Approach

1. **Interface Update**: Remove properties and update JSDoc comments
2. **Hook Update**: Remove properties from hard-coded model objects
3. **Reference Search**: Use comprehensive search to find all usages
4. **Safe Removal**: Remove references or add TODO comments for future work
5. **Compilation Check**: Ensure TypeScript compilation succeeds
6. **Test Update**: Update any tests that reference removed properties

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ LlmModel interface contains only id, name, provider, and contextLength
- ✅ All hard-coded model objects in useLlmModels hook are updated
- ✅ No remaining references to .vision or .functionCalling in codebase
- ✅ TypeScript compilation succeeds without errors
- ✅ Existing model selection UI continues to work

### Code Quality Requirements

- ✅ Interface has clear JSDoc documentation
- ✅ Removed properties are completely eliminated (no dead code)
- ✅ TODO comments added where functionality might be needed later
- ✅ Consistent formatting and style with existing code

### Testing Requirements

- ✅ Update unit tests to remove references to deleted properties
- ✅ Add test cases for simplified interface
- ✅ Verify existing tests still pass
- ✅ Test model selection functionality works with simplified interface

### Integration Requirements

- ✅ UI components can still display model information correctly
- ✅ Model selection dropdowns continue to work
- ✅ No runtime errors from accessing undefined properties

## Dependencies

None - this task can be completed independently and helps prepare for the configuration-based approach.

## Security Considerations

- **Interface Simplification**: Removing properties reduces potential attack surface
- **Type Safety**: Maintained through TypeScript interface definitions
- **Backward Compatibility**: Breaking change is intentional and documented

## Files Modified

- `packages/ui-shared/src/types/settings/LlmModel.ts` - Remove vision and functionCalling properties
- `apps/desktop/src/hooks/useLlmModels.ts` - Update hard-coded model objects
- Any test files that reference the removed properties
- Any other components that access model.vision or model.functionCalling

---
id: T-add-llmconfigid-to-shared
title: Add llmConfigId to shared persistence schema and rebuild libs
status: done
priority: high
parent: F-add-llm-configuration-id-to
prerequisites: []
affectedFiles:
  packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts:
    Added optional llmConfigId field to persistedAgentSchema with proper
    validation (non-empty string when present)
  packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts:
    Added comprehensive tests for optional llmConfigId field covering valid
    values, missing values, empty strings, and invalid types
log:
  - Successfully implemented optional llmConfigId field in shared persistence
    schema following gradual migration strategy. Added comprehensive validation
    tests and ensured all existing functionality remains intact. The optional
    field allows gradual rollout without breaking existing code or round-trip
    mappings.
schema: v1.0
childrenIds: []
created: 2025-08-28T18:33:54.065Z
updated: 2025-08-28T18:33:54.065Z
---

# Add llmConfigId to Shared Persistence Schema

## Context

This task implements the foundational schema changes for the LLM Configuration ID feature by updating the shared persistence schema to include `llmConfigId` field.

## ⚠️ CRITICAL: Gradual Migration Strategy Required

**Previous attempt failed** due to making `llmConfigId` required immediately, which broke all downstream code and tests. The UI schemas don't have `llmConfigId` yet (separate tasks), causing round-trip mapping failures.

## Recommended Gradual Approach

### Phase 1: Make llmConfigId OPTIONAL (This Task)

Update `persistedAgentSchema` with:

```typescript
// LLM configuration identifier - OPTIONAL initially for gradual migration
llmConfigId: z
  .string({ message: "LLM Configuration ID must be a string" })
  .min(1, "LLM Configuration ID is required")
  .optional(), // ← KEY: Optional to avoid breaking existing code
```

### What to Update (Minimal Changes)

1. **Schema only** - Add optional field to `persistedAgentSchema`
2. **Default creation** - Update `createDefaultAgentsSettings()` to include field
3. **New test data only** - Update tests that create brand new agents
4. **Leave mappers alone** - Don't touch any mapping functions yet

### What NOT to Touch

- ❌ Don't modify any mapper functions
- ❌ Don't update UI types (separate tasks)
- ❌ Don't make field required yet
- ❌ Don't touch existing test data for round-trip tests

## Technical Approach (Revised)

1. Update `persistedAgentSchema` with **optional** `llmConfigId` field
2. Add field after the `model` field in schema definition
3. Update `createDefaultAgentsSettings()` to include default value
4. Update only test data that creates completely new agents (not round-trip tests)
5. Add validation tests for the optional field

## Specific Implementation Requirements

### Schema Update

```typescript
// LLM configuration identifier to distinguish between multiple providers for the same model
llmConfigId: z
  .string({ message: "LLM Configuration ID must be a string" })
  .min(1, "LLM Configuration ID is required")
  .optional(), // Will be made required in later task after UI support
```

### Test Strategy

- Update tests that create new agent data from scratch
- **Leave round-trip mapping tests as-is** - they will pass because field is optional
- Add specific tests for optional `llmConfigId` validation
- Test both with and without the field present

## Why This Works

1. **Existing code continues working** - optional fields don't break validation
2. **New agents get the field** - via updated defaults
3. **Tests pass** - missing optional field is valid
4. **Mappers work unchanged** - they can ignore optional fields
5. **Future tasks can make it required** - once UI support exists

## Files to Modify (Minimal Set)

- `packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts` - Add optional field
- `packages/shared/src/services/storage/utils/agents/createDefaultAgentsSettings.ts` - Include in defaults
- `packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts` - Add validation tests

## Later Tasks Will Handle

- Making field required (remove `.optional()`)
- Adding to UI schemas
- Updating mappers to preserve field
- Full integration testing

## Success Criteria (Revised)

- [ ] `persistedAgentSchema` includes optional `llmConfigId` field
- [ ] All existing tests continue to pass
- [ ] New default agents include `llmConfigId`
- [ ] Validation works for both present and missing field
- [ ] `pnpm build:libs` succeeds
- [ ] No breaking changes to any existing APIs

This gradual approach ensures **no failing tests** while making incremental progress toward the full feature.

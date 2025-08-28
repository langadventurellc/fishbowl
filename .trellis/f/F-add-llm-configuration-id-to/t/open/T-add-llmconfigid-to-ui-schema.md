---
id: T-add-llmconfigid-to-ui-schema
title: Add llmConfigId to UI schema and types
status: open
priority: high
parent: F-add-llm-configuration-id-to
prerequisites:
  - T-add-llmconfigid-to-shared
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T18:34:09.695Z
updated: 2025-08-28T18:34:09.695Z
---

# Add llmConfigId to UI Schema and Types

## Context

Update the UI-shared package schemas and TypeScript types to include `llmConfigId` field, enabling form validation and type safety for the LLM configuration feature.

## ⚠️ CRITICAL: Gradual Migration Strategy Required

**This task will fail if we make `llmConfigId` required immediately!** The mappers, stores, and components aren't updated yet (separate tasks), which will cause widespread TypeScript errors and test failures.

## Recommended Gradual Approach

### Phase 1: Make llmConfigId OPTIONAL in UI (This Task)

Update `agentSchema` with:

```typescript
// LLM configuration identifier - OPTIONAL initially for gradual migration
llmConfigId: z
  .string({ message: "LLM Configuration ID must be a string" })
  .min(1, "LLM Configuration is required")
  .optional(), // ← KEY: Optional until mappers and stores are updated
```

### What to Update (Minimal Changes)

1. **UI Schema only** - Add optional field to `agentSchema`
2. **Types as optional** - Add `llmConfigId?: string` to UI types
3. **Normalization** - Handle optional field in `normalizeAgentFields`
4. **Leave mappers/stores alone** - Don't touch any mapping or store code yet

### What NOT to Touch

- ❌ Don't modify any mapper functions (separate task)
- ❌ Don't update store validation logic (separate task)
- ❌ Don't make field required yet
- ❌ Don't touch existing test data

## Technical Approach (Revised)

1. Update `agentSchema` with **optional** `llmConfigId` field
2. Add **optional** field to all UI types (`llmConfigId?: string`)
3. Update `normalizeAgentFields` to handle optional field
4. Add validation tests for the optional field
5. Ensure backward compatibility with existing code

## Specific Implementation Requirements

### UI Schema Update (Optional)

```typescript
export const agentSchema = z.object({
  // ... existing fields ...
  model: z.string().min(1, "Model is required"),

  // LLM configuration identifier - OPTIONAL initially for gradual migration
  llmConfigId: z
    .string({ message: "LLM Configuration ID must be a string" })
    .min(1, "LLM Configuration is required")
    .optional(), // Will be made required in later task after mappers updated

  // ... rest of fields ...
});
```

### Type Updates (All Optional)

Add `llmConfigId?: string` (note the `?`) to:

- `AgentFormData` - `llmConfigId?: string`
- `AgentSettingsViewModel` - `llmConfigId?: string`
- `AgentCard` - `llmConfigId?: string`

### Normalization Logic (Safe)

```typescript
export function normalizeAgentFields(agent: {
  // ... existing fields ...
  llmConfigId?: string; // Optional
}): {
  // ... existing fields ...
  llmConfigId?: string; // Optional return too
} {
  return {
    // ... existing fields ...
    llmConfigId: agent.llmConfigId?.trim() || undefined,
  };
}
```

## Why This Works

1. **Existing code continues working** - optional fields don't break anything
2. **Types are backward compatible** - optional means old code still compiles
3. **Tests pass** - missing optional field is valid
4. **Mappers work unchanged** - they can ignore optional fields
5. **Future tasks can make it required** - once mappers and stores are updated

## Test Strategy

- Add tests for optional `llmConfigId` validation
- Test `normalizeAgentFields` with and without the field
- **Don't update existing test data** - keep it working as-is
- Ensure schema validates both present and missing field

## Files to Modify (Minimal Set)

- `packages/ui-shared/src/schemas/agentSchema.ts` - Add optional field
- `packages/ui-shared/src/types/settings/AgentFormData.ts` - Add optional type
- `packages/ui-shared/src/types/settings/AgentSettingsViewModel.ts` - Add optional type
- `packages/ui-shared/src/types/settings/AgentCard.ts` - Add optional type
- `packages/ui-shared/src/mapping/agents/utils/normalizeAgentFields.ts` - Handle optional field

## Later Tasks Will Handle

- Making field required (remove `.optional()` and `?`)
- Updating mappers to preserve field
- Updating stores to validate and handle field
- Component integration

## Detailed Acceptance Criteria (Revised)

- [ ] `agentSchema` includes **optional** `llmConfigId` field
- [ ] All UI type interfaces include `llmConfigId?: string` (optional)
- [ ] `normalizeAgentFields` handles optional `llmConfigId` safely
- [ ] All existing TypeScript compilation passes without errors
- [ ] Schema validation works for both present and missing field
- [ ] All existing tests continue to pass
- [ ] No breaking changes to any existing APIs

## Dependencies

- Requires: T-add-llmconfigid-to-shared (shared schema must be updated first)

## Success Criteria (Revised)

- [ ] **Zero TypeScript errors** after changes
- [ ] **All existing tests pass** without modification
- [ ] New optional field validates correctly when present
- [ ] Field is safely ignored when missing
- [ ] `pnpm build:libs` succeeds

This gradual approach ensures **no breaking changes** while preparing the UI layer for full integration.

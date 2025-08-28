---
id: T-update-agent-mapping
title: Update agent mapping functions to handle llmConfigId
status: done
priority: medium
parent: F-add-llm-configuration-id-to
prerequisites:
  - T-add-llmconfigid-to-ui-schema
affectedFiles:
  packages/ui-shared/src/mapping/agents/mapSingleAgentUIToPersistence.ts:
    Added llmConfigId field to mapping function to preserve the field during UI
    to persistence transformation
  packages/ui-shared/src/mapping/agents/mapSingleAgentPersistenceToUI.ts:
    Added llmConfigId field to mapping function to preserve the field during
    persistence to UI transformation
  packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts:
    Made llmConfigId field required by removing .optional() from schema
    definition
  packages/ui-shared/src/schemas/agentSchema.ts: Made llmConfigId field required
    by removing .optional() from schema definition
  packages/ui-shared/src/types/settings/AgentCard.ts:
    Updated AgentCard interface
    to make llmConfigId field required (removed ? optional marker)
  packages/shared/src/prompts/system/__tests__/SystemPromptFactory.test.ts: Updated test data to include required llmConfigId field for all mock agents
  packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts:
    Updated multiple test cases to include required llmConfigId field and fixed
    test that expected field to be optional
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsUIToPersistence.test.ts: Added llmConfigId field to all test agent data
  packages/ui-shared/src/mapping/agents/__tests__/roundTripMapping.test.ts:
    Added llmConfigId field to test data and updated round-trip validation to
    check llmConfigId preservation
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsPersistenceToUI.test.ts: Added llmConfigId field to test data and updated expected results
  packages/ui-shared/src/schemas/__tests__/agentSchema.test.ts:
    Updated multiple test cases to include required llmConfigId field for all
    valid test scenarios and converted optional test to expect validation
    failure
  packages/ui-shared/src/stores/__tests__/useAgentsStore.test.ts: Updated test agent data to include required llmConfigId field
log:
  - Successfully updated all agent mapping functions to handle llmConfigId and
    completed the gradual migration by making llmConfigId required in both
    schemas. All mappers now preserve llmConfigId during round-trip operations,
    ensuring data integrity. Updated extensive test coverage to include required
    llmConfigId field throughout the codebase. Both persistence and UI schemas
    now require llmConfigId, UI types have been updated to remove optional
    markers, and all quality checks pass with zero errors.
schema: v1.0
childrenIds: []
created: 2025-08-28T18:34:45.332Z
updated: 2025-08-28T18:34:45.332Z
---

# Update Agent Mapping Functions to Handle llmConfigId

## Context

Update all agent mapping functions to pass through the `llmConfigId` field between UI and persistence layers, ensuring data integrity and round-trip compatibility. **This task also finalizes the gradual migration by making `llmConfigId` required in both schemas.**

## ✅ **Complete the Gradual Migration**

This task completes the 3-phase gradual migration:

1. ✅ **Phase 1:** Added optional `llmConfigId` to shared schema
2. ✅ **Phase 2:** Added optional `llmConfigId` to UI schema
3. 🎯 **Phase 3:** Update mappers + **make both schemas required**

## Technical Approach

1. Update individual mapper functions to include `llmConfigId` in data transformation
2. Update array mapping functions to preserve `llmConfigId` across batch operations
3. **Make `llmConfigId` required in both schemas** (remove `.optional()`)
4. Update test data to include required `llmConfigId` values
5. Ensure round-trip mapping preserves the field without modification

## Specific Implementation Requirements

### 🔄 **Mapper Updates**

**mapSingleAgentUIToPersistence.ts**:

- Add `llmConfigId: uiAgent.llmConfigId` to returned object
- Remove any default value fallbacks (field will now be required)

**mapSingleAgentPersistenceToUI.ts**:

- Add `llmConfigId: persistedAgent.llmConfigId` to returned object
- Direct pass-through from persistence to UI

**mapAgentsUIToPersistence.ts** & **mapAgentsPersistenceToUI.ts**:

- Verify these use the single mappers (they should inherit the fix automatically)

### 🔒 **Make Schemas Required**

**In `packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts`**:

```typescript
// Remove .optional() to make required
llmConfigId: z
  .string({ message: "LLM Configuration ID must be a string" })
  .min(1, "LLM Configuration ID is required"), // ← Remove .optional()
```

**In `packages/ui-shared/src/schemas/agentSchema.ts`**:

```typescript
// Remove .optional() to make required
llmConfigId: z
  .string({ message: "LLM Configuration ID must be a string" })
  .min(1, "LLM Configuration is required"), // ← Remove .optional()
```

**In UI Types** - Change from optional to required:

- `AgentFormData`: `llmConfigId: string` (remove `?`)
- `AgentSettingsViewModel`: `llmConfigId: string` (remove `?`)
- `AgentCard`: `llmConfigId: string` (remove `?`)

### 🧪 **Test Data Updates**

- Update all existing test data to include `llmConfigId` values
- Update round-trip mapping tests to verify `llmConfigId` preservation
- Add test cases that verify required field validation

## Why This Works

1. **Mappers preserve the field** - Round-trip operations won't lose data
2. **Both schemas support it** - Required validation will catch missing values
3. **Full data flow tested** - Any gaps in preservation will be immediately visible
4. **Migration complete** - Field is now fully integrated and required

## Detailed Acceptance Criteria

### Mapper Functionality

- [ ] `mapSingleAgentUIToPersistence` passes through `llmConfigId` unchanged
- [ ] `mapSingleAgentPersistenceToUI` passes through `llmConfigId` unchanged
- [ ] Array mapping functions preserve `llmConfigId` for all agents
- [ ] Round-trip mapping (UI → Persistence → UI) preserves `llmConfigId` exactly

### Schema Requirements

- [ ] `persistedAgentSchema` requires `llmConfigId` (`.optional()` removed)
- [ ] `agentSchema` requires `llmConfigId` (`.optional()` removed)
- [ ] All UI types have `llmConfigId: string` (no `?`)
- [ ] Schema validation fails for missing `llmConfigId`

### Testing

- [ ] All existing tests pass with updated data
- [ ] Round-trip tests verify `llmConfigId` preservation
- [ ] New tests verify required field validation
- [ ] No TypeScript errors

## Files to Modify

### Mappers

- `packages/ui-shared/src/mapping/agents/mapSingleAgentUIToPersistence.ts`
- `packages/ui-shared/src/mapping/agents/mapSingleAgentPersistenceToUI.ts`
- `packages/ui-shared/src/mapping/agents/mapAgentsUIToPersistence.ts`
- `packages/ui-shared/src/mapping/agents/mapAgentsPersistenceToUI.ts`

### Schemas (Make Required)

- `packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts` - Remove `.optional()`
- `packages/ui-shared/src/schemas/agentSchema.ts` - Remove `.optional()`

### UI Types (Make Required)

- `packages/ui-shared/src/types/settings/AgentFormData.ts` - Remove `?`
- `packages/ui-shared/src/types/settings/AgentSettingsViewModel.ts` - Remove `?`
- `packages/ui-shared/src/types/settings/AgentCard.ts` - Remove `?`

### Tests

- All mapper tests - Add `llmConfigId` to test data
- Round-trip tests - Verify preservation
- Schema tests - Test required validation

## Dependencies

- Requires: T-add-llmconfigid-to-ui-schema (optional field must exist first)

## Success Criteria

- [ ] **All mappers preserve `llmConfigId`** during round-trip operations
- [ ] **Both schemas require `llmConfigId`** (migration complete)
- [ ] **All tests pass** with required field
- [ ] **Zero TypeScript errors** after making field required
- [ ] **Round-trip data integrity** verified

## Testing Requirements

- Unit tests for individual mappers with required `llmConfigId` field
- Round-trip mapping test: UI data → Persistence → UI preserves `llmConfigId`
- Test array mapping preserves `llmConfigId` for multiple agents
- Test schema validation fails for missing `llmConfigId`
- Verify existing functionality remains unchanged

This task completes the gradual migration and ensures `llmConfigId` is fully integrated throughout the data layer.

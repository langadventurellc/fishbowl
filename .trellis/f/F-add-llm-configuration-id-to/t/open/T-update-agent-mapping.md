---
id: T-update-agent-mapping
title: Update agent mapping functions to handle llmConfigId
status: open
priority: medium
parent: F-add-llm-configuration-id-to
prerequisites:
  - T-add-llmconfigid-to-ui-schema
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T18:34:45.332Z
updated: 2025-08-28T18:34:45.332Z
---

# Update Agent Mapping Functions to Handle llmConfigId

## Context

Update all agent mapping functions to pass through the `llmConfigId` field between UI and persistence layers, ensuring data integrity and round-trip compatibility.

## Technical Approach

1. Update individual mapper functions to include `llmConfigId` in data transformation
2. Update array mapping functions to preserve `llmConfigId` across batch operations
3. Ensure round-trip mapping preserves the field without modification
4. Keep mapping logic simple with direct pass-through (no composite parsing)

## Specific Implementation Requirements

### Individual Mappers

Update `packages/ui-shared/src/mapping/agents/`:

**mapSingleAgentUIToPersistence.ts**:

- Add `llmConfigId: uiAgent.llmConfigId` to returned object
- Follow existing field mapping patterns
- Include in function's JSDoc if present

**mapSingleAgentPersistenceToUI.ts**:

- Add `llmConfigId: persistedAgent.llmConfigId` to returned object
- Follow existing field mapping patterns
- Include in function's JSDoc if present

### Array Mappers

**mapAgentsUIToPersistence.ts**:

- Verify the function uses `mapSingleAgentUIToPersistence` internally
- If it manually maps fields, add `llmConfigId` pass-through
- Maintain existing error handling

**mapAgentsPersistenceToUI.ts**:

- Verify the function uses `mapSingleAgentPersistenceToUI` internally
- If it manually maps fields, add `llmConfigId` pass-through
- Maintain existing error handling

## Detailed Acceptance Criteria

- [ ] `mapSingleAgentUIToPersistence` passes through `llmConfigId` unchanged
- [ ] `mapSingleAgentPersistenceToUI` passes through `llmConfigId` unchanged
- [ ] Array mapping functions preserve `llmConfigId` for all agents
- [ ] Round-trip mapping (UI → Persistence → UI) preserves `llmConfigId` exactly
- [ ] No composite value parsing/generation in mapping layer
- [ ] Existing mapper functionality remains unchanged
- [ ] All TypeScript types resolve correctly

## Dependencies

- Requires: T-add-llmconfigid-to-ui-schema (types must be available in both layers)

## Security Considerations

- Direct pass-through maintains data integrity
- No additional validation or transformation that could introduce vulnerabilities
- Follows existing secure mapping patterns

## Testing Requirements

- Unit tests for individual mappers with `llmConfigId` field
- Round-trip mapping test: UI data → Persistence → UI should preserve `llmConfigId`
- Test array mapping preserves `llmConfigId` for multiple agents
- Verify existing mapper tests still pass

## Files to Modify

- `packages/ui-shared/src/mapping/agents/mapSingleAgentUIToPersistence.ts`
- `packages/ui-shared/src/mapping/agents/mapSingleAgentPersistenceToUI.ts`
- `packages/ui-shared/src/mapping/agents/mapAgentsUIToPersistence.ts`
- `packages/ui-shared/src/mapping/agents/mapAgentsPersistenceToUI.ts`

## Out of Scope

- Composite value handling (that's in UI components)
- Store integration (separate task)
- Validation logic (handled in schemas)

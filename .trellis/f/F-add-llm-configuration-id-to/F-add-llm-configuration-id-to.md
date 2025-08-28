---
id: F-add-llm-configuration-id-to
title: Add LLM Configuration ID to Agent Settings
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts:
    Added optional llmConfigId field to persistedAgentSchema with proper
    validation (non-empty string when present); Made llmConfigId field required
    by removing .optional() from schema definition
  packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts:
    Added comprehensive tests for optional llmConfigId field covering valid
    values, missing values, empty strings, and invalid types; Updated multiple
    test cases to include required llmConfigId field and fixed test that
    expected field to be optional
  packages/ui-shared/src/schemas/agentSchema.ts:
    Added optional llmConfigId field
    to agentSchema with proper validation (non-empty string when present)
    including whitespace trimming and helpful comments about gradual migration
    strategy; Made llmConfigId field required by removing .optional() from
    schema definition
  packages/ui-shared/src/types/settings/AgentCard.ts: Added optional llmConfigId
    property to AgentCard interface for display purposes; Updated AgentCard
    interface to make llmConfigId field required (removed ? optional marker)
  packages/ui-shared/src/mapping/agents/utils/normalizeAgentFields.ts:
    Updated normalizeAgentFields function to handle optional llmConfigId field
    with proper trimming and updated documentation
  packages/ui-shared/src/schemas/__tests__/agentSchema.test.ts:
    Added comprehensive tests for optional llmConfigId field covering
    validation, type inference, invalid data cases including whitespace-only
    strings, and integration with AgentFormData type; Updated multiple test
    cases to include required llmConfigId field for all valid test scenarios and
    converted optional test to expect validation failure
  packages/ui-shared/src/types/settings/LlmModel.ts: Added configId and
    configLabel fields to LlmModel interface with proper JSDoc documentation
  apps/desktop/src/hooks/useLlmModels.ts: Updated hook to populate configId from
    config.id and configLabel from config.customName || config.provider, while
    keeping provider as canonical identifier
  apps/desktop/src/hooks/__tests__/useLlmModels.test.tsx:
    Added comprehensive unit
    tests for new configId and configLabel functionality, including tests for
    multiple configurations, display labels, canonical provider handling, and
    error scenarios
  packages/ui-shared/src/mapping/agents/mapSingleAgentUIToPersistence.ts:
    Added llmConfigId field to mapping function to preserve the field during UI
    to persistence transformation
  packages/ui-shared/src/mapping/agents/mapSingleAgentPersistenceToUI.ts:
    Added llmConfigId field to mapping function to preserve the field during
    persistence to UI transformation
  packages/shared/src/prompts/system/__tests__/SystemPromptFactory.test.ts: Updated test data to include required llmConfigId field for all mock agents
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsUIToPersistence.test.ts: Added llmConfigId field to all test agent data
  packages/ui-shared/src/mapping/agents/__tests__/roundTripMapping.test.ts:
    Added llmConfigId field to test data and updated round-trip validation to
    check llmConfigId preservation
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsPersistenceToUI.test.ts: Added llmConfigId field to test data and updated expected results
  packages/ui-shared/src/stores/__tests__/useAgentsStore.test.ts: Updated test agent data to include required llmConfigId field
log: []
schema: v1.0
childrenIds:
  - T-fix-model-defaults-and
  - T-update-agent-mapping
  - T-update-agentcard-to-resolve
  - T-update-agentform-to-handle
  - T-update-modelselect-component
  - T-update-useagentsstore-to
  - T-add-llmconfigid-to-shared
  - T-add-llmconfigid-to-ui-schema
  - T-update-llmmodel-interface-and
created: 2025-08-28T18:00:35.321Z
updated: 2025-08-28T18:00:35.321Z
---

# Add LLM Configuration ID to Agent Settings

## Purpose

Enable agents to persist both the LLM model name and the specific LLM configuration (config ID) used, allowing users to distinguish between multiple providers of the same model type (e.g., two different OpenAI configurations with different API keys).

## Problem Statement

Currently, agent configurations only store the model name (e.g., "GPT-4") without the LLM configuration ID. When users have multiple providers configured for the same model type, the system cannot determine which specific provider configuration to use.

## Key Components to Implement

### 1. Data Schema Updates (Shared + UI)

- Add `llmConfigId` to persistence schema: `packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts`
- Add `llmConfigId` to UI schema: `packages/ui-shared/src/schemas/agentSchema.ts`
- Keep `model` as the canonical model identifier string (no composite values)
- Update inferred types across shared and ui-shared packages

### 2. Model Loading Enhancement

- Update `LlmModel` interface to include `configId: string`
- Add `configLabel: string` (display label = `customName || provider`)
- Keep `provider` as the canonical provider id/name (e.g., "openai", "anthropic")
- Modify `useLlmModels` to populate `configId` and `configLabel` from each LLM configuration when expanding models
- Keep `model.id` as the canonical model identifier (e.g., `gpt-4`, `claude-3-5-sonnet`)

### 3. UI Selection Logic

- Use composite Select values in `ModelSelect`: `${llmConfigId}:${modelId}` (unique per config+model)
- Group options by canonical `provider`; show `configLabel` as muted sublabel for each option
- Handle composite value splitting in `AgentForm` into `{ llmConfigId, model }`

### 4. Data Mapping Updates

- Update all agent mappers to handle `llmConfigId`:
  - `mapSingleAgentUIToPersistence`
  - `mapSingleAgentPersistenceToUI`
  - `mapAgentsUIToPersistence`
  - `mapAgentsPersistenceToUI`
- Ensure round-trip mappings preserve `llmConfigId`

### 5. Lookup Pattern Fixes

- Update `AgentCard` and any model lookups to use both `llmConfigId` and `model` id
- Keep graceful fallback to the stored model string if lookup fails
- Optionally display configuration label for clarity

### 6. UI Types and Store Updates

- Add `llmConfigId: string` to the following UI types:
  - `AgentFormData`
  - `AgentSettingsViewModel`
  - `AgentCard` (the display type)
- Extend `normalizeAgentFields` to trim/validate `llmConfigId`
- Update `useAgentsStore` to validate via updated `agentSchema`, and to persist/load `llmConfigId` through mappers

## Detailed Acceptance Criteria

### Data Schema

- [ ] Persistence: `persistedAgentsSettingsSchema.ts` includes `llmConfigId: z.string().min(1)`
- [ ] UI schema: `agentSchema.ts` includes `llmConfigId: z.string().min(1)`
- [ ] `model` remains a plain string (no composite)
- [ ] Types inferred and exported update accordingly in both packages

### Model Loading

- [ ] `LlmModel` includes `configId: string` and `configLabel: string`
- [ ] `useLlmModels` populates `configId` and `configLabel` from each configuration
- [ ] `provider` remains canonical for grouping/filtering
- [ ] `model.id` remains canonical (e.g., `gpt-4`)

### UI Selection

- [ ] `ModelSelect` uses composite values `${llmConfigId}:${modelId}` for option values
- [ ] Options grouped by canonical `provider`; config label distinguishes duplicates
- [ ] `ModelSelect` emits composite value to `AgentForm`; composite is never persisted
- [ ] Clear visual differentiation between configurations in dropdown

### Form Handling

- [ ] `AgentForm` intercepts `onValueChange` from `ModelSelect`
- [ ] Composite splits into `{ llmConfigId, model }` before validation
- [ ] Both fields set via `form.setValue` with validation enabled
- [ ] Local `selectedComposite` state controls the Select
- [ ] Edit mode initializes composite from `{initialData.llmConfigId}:{initialData.model}`

### Data Persistence

- [ ] All agent mapping functions pass through `llmConfigId`
- [ ] No composite parsing/generation in mapping layer
- [ ] Round-trip mapping preserves `llmConfigId`

### Lookup Resolution

- [ ] `AgentCard` resolves models using both fields: `models.find(m => m.configId === agent.llmConfigId && m.id === agent.model)`
- [ ] Fallback to `agent.model` if model not found
- [ ] Other lookups updated to use dual-field matching where applicable
- [ ] Search/filter functionality preserved using the plain `model` string

### Error Handling

- [ ] Missing `llmConfigId` in form shows validation error
- [ ] Deleted/missing LLM configuration shows a non-blocking warning in edit form (optional)
- [ ] Model display falls back to stored model string when lookup fails
- [ ] Clear, user-facing error messages for mismatches

### Build System

- [ ] Build shared packages after schema changes (`pnpm build:libs`)
- [ ] All updated unit/component tests pass after updates
- [ ] New schema validation works correctly

## Clarifications and Decisions

- Composite is a UI concern only; storage and mapping remain simple fields
- Provider remains canonical; introduce `configLabel` to avoid overloading `provider` for display
- Standardize on canonical model ids across defaults/tests
- No cross-store existence checks for `llmConfigId` (handle gracefully at render time)

## Key Files to Modify

- Schemas/types (shared):
  - `packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts`
- Schemas/types (ui-shared):
  - `packages/ui-shared/src/schemas/agentSchema.ts`
  - `packages/ui-shared/src/types/settings/AgentFormData.ts`
  - `packages/ui-shared/src/types/settings/AgentSettingsViewModel.ts`
  - `packages/ui-shared/src/types/settings/AgentCard.ts`
  - `packages/ui-shared/src/types/settings/LlmModel.ts`
- Mappers/normalization (ui-shared):
  - `packages/ui-shared/src/mapping/agents/mapSingleAgentUIToPersistence.ts`
  - `packages/ui-shared/src/mapping/agents/mapSingleAgentPersistenceToUI.ts`
  - `packages/ui-shared/src/mapping/agents/mapAgentsUIToPersistence.ts`
  - `packages/ui-shared/src/mapping/agents/mapAgentsPersistenceToUI.ts`
  - `packages/ui-shared/src/mapping/agents/utils/normalizeAgentFields.ts`
- Store (ui-shared):
  - `packages/ui-shared/src/stores/useAgentsStore.ts` (validation and object construction rely on `agentSchema`/types)
- Desktop app:
  - `apps/desktop/src/hooks/useLlmModels.ts`
  - `apps/desktop/src/components/settings/agents/ModelSelect.tsx`
  - `apps/desktop/src/components/settings/agents/AgentForm.tsx`
  - `apps/desktop/src/components/settings/agents/AgentCard.tsx`

## Proposed Plan

(unchanged other than the clarifications above)

## Testing Requirements (No E2E in this feature)

- Persistence/UI schemas validate `llmConfigId`
- `normalizeAgentFields` trims and preserves `llmConfigId`
- Mappers round-trip `llmConfigId` unchanged
- `useLlmModels` returns models with `configId` and `configLabel`
- `AgentForm` splits composite into fields; `AgentCard` resolves with dual-field lookup

## Security Considerations

- Presence/format validation only in UI store (avoid tight coupling)
- No sensitive config values are exposed; only `llmConfigId` and labels
- Handle missing configs gracefully with warnings (non-blocking)

## Performance Requirements

- Model loading remains efficient; `useLlmModels` expands per config without N+1 calls
- Form validation remains responsive
- Agent list unchanged except lookup by a map could be introduced later if needed

## Dependencies

- Must rebuild shared packages after schema changes (`pnpm build:libs`)

## Success Metrics

- Users can create agents with specific LLM configurations
- Multiple providers for same model are clearly distinguished
- Existing agent display and search functionality preserved
- No performance regression in agent management UI

## Out of Scope / Follow-ups

- End-to-end tests for this flow (to be handled separately)
- Template configurations may require model+config reselection during creation
- Cross-validating that `llmConfigId` exists at save time within UI store

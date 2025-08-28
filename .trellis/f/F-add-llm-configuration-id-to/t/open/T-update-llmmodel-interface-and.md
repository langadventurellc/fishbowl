---
id: T-update-llmmodel-interface-and
title: Update LlmModel interface and useLlmModels hook
status: open
priority: high
parent: F-add-llm-configuration-id-to
prerequisites:
  - T-add-llmconfigid-to-ui-schema
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T18:34:28.171Z
updated: 2025-08-28T18:34:28.171Z
---

# Update LlmModel Interface and useLlmModels Hook

## Context

Extend the `LlmModel` interface to include `configId` and update the `useLlmModels` hook to populate this field from LLM configuration data, enabling the UI to distinguish between multiple providers offering the same model. Avoid overloading `provider` for display.

## Technical Approach

1. Add `configId: string` field to the `LlmModel` interface
2. Add `configLabel: string` field for display (e.g., `customName || provider`)
3. Keep `provider: string` as the canonical provider id/name (e.g., "openai", "anthropic")
4. Update `useLlmModels` to set `configId` from each `LlmConfigMetadata.id`, and `configLabel` from `customName || provider`
5. Keep `model.id` as the canonical model identifier (e.g., `gpt-4o`)

## Specific Implementation Requirements

### LlmModel Interface Update

- Add `configId: string` field to `packages/ui-shared/src/types/settings/LlmModel.ts`
- Add `configLabel: string` field with JSDoc `/** Display label for this configuration (customName || provider) */`
- Keep existing fields; do NOT repurpose `provider` for display

### useLlmModels Hook Enhancement

Update `apps/desktop/src/hooks/useLlmModels.ts`:

- When expanding models from each configuration, set `configId: config.id`
- Set `configLabel: config.customName || config.provider`
- Keep `provider` as the canonical provider id/name for grouping/filtering
- Keep `model.id` as canonical model identifier (no changes to this field)
- Maintain existing error handling and loading patterns

### Model Data Structure

Ensure the hook returns models with:

- `id`: Canonical model identifier (e.g., "gpt-4o", "claude-3-5-sonnet")
- `name`: Human-readable model name (e.g., "GPT-4o")
- `provider`: Canonical provider id/name (e.g., "openai")
- `configLabel`: Display label for the specific configuration
- `configId`: Configuration identifier for lookup
- `contextLength`: Existing context window data

## Detailed Acceptance Criteria

- [ ] `LlmModel` interface includes `configId: string` and `configLabel: string` with documentation
- [ ] `useLlmModels` populates `configId` and `configLabel` (does not overwrite `provider`)
- [ ] `model.id` remains canonical identifier (no composite values)
- [ ] Multiple configurations of same model create separate model entries
- [ ] Hook maintains existing error handling and loading behavior
- [ ] TypeScript compilation passes for all dependent code

## Dependencies

- Requires: T-add-llmconfigid-to-ui-schema (types must be available)

## Security Considerations

- Only configuration IDs exposed, no sensitive config data
- Maintains existing security patterns in hook implementation

## Testing Requirements

- Unit tests for `LlmModel` interface compliance
- Test `useLlmModels` returns models with correct `configId` and `configLabel`
- Verify multiple configurations create distinct model entries
- Test provider grouping remains stable and uses canonical provider values

## Files to Modify

- `packages/ui-shared/src/types/settings/LlmModel.ts` - Add interface fields
- `apps/desktop/src/hooks/useLlmModels.ts` - Update hook logic

## Out of Scope

- UI component updates (separate task)
- Form handling logic (separate task)
- Model selection implementation (separate task)

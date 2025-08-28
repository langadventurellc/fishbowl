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

## Technical Approach

1. Update `agentSchema` in `packages/ui-shared/src/schemas/agentSchema.ts`
2. Add `llmConfigId` to all relevant UI types: `AgentFormData`, `AgentSettingsViewModel`, `AgentCard`
3. Update `normalizeAgentFields` to handle `llmConfigId` trimming and validation
4. Ensure consistent TypeScript types across the UI layer

## Specific Implementation Requirements

### UI Schema Update

- Add `llmConfigId: z.string().min(1, "LLM Configuration is required")` to `agentSchema`
- Place after the `model` field for consistency with persistence schema
- Keep validation message user-friendly

### Type Updates

Add `llmConfigId: string` to the following interfaces:

- `packages/ui-shared/src/types/settings/AgentFormData.ts`
- `packages/ui-shared/src/types/settings/AgentSettingsViewModel.ts`
- `packages/ui-shared/src/types/settings/AgentCard.ts`

### Normalization Logic

- Update `packages/ui-shared/src/mapping/agents/utils/normalizeAgentFields.ts`
- Add `llmConfigId: (data.llmConfigId || '').trim()` to trim whitespace
- Follow existing pattern for string field normalization

## Detailed Acceptance Criteria

- [ ] `agentSchema` includes required `llmConfigId` field with user-friendly validation message
- [ ] `AgentFormData` interface includes `llmConfigId: string`
- [ ] `AgentSettingsViewModel` interface includes `llmConfigId: string`
- [ ] `AgentCard` interface includes `llmConfigId: string`
- [ ] `normalizeAgentFields` trims and preserves `llmConfigId`
- [ ] All TypeScript compilation passes without errors
- [ ] Schema validation works correctly for form data

## Dependencies

- Requires: T-add-llmconfigid-to-shared (shared schema must be updated first)

## Security Considerations

- Client-side validation prevents empty configuration IDs
- Field trimming prevents accidental whitespace issues
- No sensitive data stored in types

## Testing Requirements

- Unit tests for `agentSchema` validation with `llmConfigId`
- Test `normalizeAgentFields` properly handles `llmConfigId` trimming
- Verify TypeScript types compile correctly

## Files to Modify

- `packages/ui-shared/src/schemas/agentSchema.ts` - Add schema field
- `packages/ui-shared/src/types/settings/AgentFormData.ts` - Add type field
- `packages/ui-shared/src/types/settings/AgentSettingsViewModel.ts` - Add type field
- `packages/ui-shared/src/types/settings/AgentCard.ts` - Add type field
- `packages/ui-shared/src/mapping/agents/utils/normalizeAgentFields.ts` - Add normalization

## Out of Scope

- Mapper implementation (separate task)
- Component integration (separate task)
- Store validation logic (separate task)

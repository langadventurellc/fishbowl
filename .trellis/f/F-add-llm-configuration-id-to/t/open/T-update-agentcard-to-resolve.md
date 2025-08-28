---
id: T-update-agentcard-to-resolve
title: Update AgentCard to resolve model display using dual-field lookup
status: open
priority: medium
parent: F-add-llm-configuration-id-to
prerequisites:
  - T-update-llmmodel-interface-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T18:35:44.372Z
updated: 2025-08-28T18:35:44.372Z
---

# Update AgentCard to Resolve Model Display Using Dual-Field Lookup

## Context

Update the `AgentCard` component to resolve model display names using both `llmConfigId` and `model` fields, with graceful fallback to the stored model string when lookup fails. Optionally show the configuration label to disambiguate for users.

## Technical Approach

1. Modify model lookup logic to use both `agent.llmConfigId` and `agent.model` for accurate resolution
2. Implement fallback to `agent.model` string when model cannot be found
3. Maintain existing display patterns and styling
4. Handle edge cases where configuration or model data is missing
5. (Optional) Display `resolvedModel.configLabel` as muted secondary text

## Specific Implementation Requirements

### Dual-Field Model Lookup

Update lookup logic in `apps/desktop/src/components/settings/agents/AgentCard.tsx`:

```typescript
// Find model using both configId and model id
const resolvedModel = models.find(
  (m) => m.configId === agent.llmConfigId && m.id === agent.model,
);

// Fallback to stored model string if not found
const displayModelName = resolvedModel?.name || agent.model;
```

### Error Handling

- Handle missing `llmConfigId` gracefully (fallback to model string)
- Handle deleted/missing LLM configurations (show model string with subtle indication)
- Maintain existing error boundary patterns if present

### Display Logic

- Primary: Use resolved model name when available
- Secondary (optional): Show `resolvedModel?.configLabel` for clarity
- Fallback: Show stored `agent.model` string when lookup fails
- Keep existing styling and layout unchanged

## Detailed Acceptance Criteria

- [ ] Model display uses `models.find(m => m.configId === agent.llmConfigId && m.id === agent.model)`
- [ ] Fallback displays `agent.model` string when lookup fails
- [ ] Missing `llmConfigId` handled gracefully with fallback
- [ ] Component renders without errors when model data unavailable
- [ ] Existing card styling and layout preserved
- [ ] Performance impact minimal (no unnecessary re-renders)
- [ ] Search/filter functionality unaffected (continues using `agent.model`)

## Dependencies

- Requires: T-update-llmmodel-interface-and (`LlmModel` must have `configId`, `configLabel`)

## Security Considerations

- No sensitive configuration data exposed in display
- Graceful degradation prevents information leakage
- Maintains existing component security patterns

## Testing Requirements

- Unit tests for dual-field model lookup success case
- Test fallback behavior when model not found in lookup
- Test handling of missing `llmConfigId` field
- Test component renders correctly with missing model data

## Files to Modify

- `apps/desktop/src/components/settings/agents/AgentCard.tsx`

## Out of Scope

- Search/filter logic changes (should continue using `agent.model`)
- Store integration changes (separate task)
- Complex visual indicators for configuration status

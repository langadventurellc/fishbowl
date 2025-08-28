---
id: T-update-modelselect-component
title: Update ModelSelect component with composite values and configuration labels
status: done
priority: medium
parent: F-add-llm-configuration-id-to
prerequisites:
  - T-update-llmmodel-interface-and
affectedFiles:
  apps/desktop/src/components/settings/agents/ModelSelect.tsx:
    Added buildComposite utility function, updated SelectItem values to use
    composite format, changed sublabel display from model.provider to
    model.configLabel
  apps/desktop/src/components/settings/agents/__tests__/ModelSelect.test.tsx:
    Updated mock models to include configId and configLabel fields, modified
    tests to expect composite values in onChange calls, added tests for
    configuration label display and multi-configuration disambiguation
log:
  - Updated ModelSelect component to use composite values (configId:modelId) and
    display configuration labels for LLM model disambiguation. Implemented
    buildComposite utility function, modified option values to use composite
    format, updated display to show configLabel instead of raw provider name,
    and enhanced unit tests to verify composite functionality and
    multi-configuration support.
schema: v1.0
childrenIds: []
created: 2025-08-28T18:35:04.534Z
updated: 2025-08-28T18:35:04.534Z
---

# Update ModelSelect Component with Composite Values and Configuration Labels

## Context

Enhance the `ModelSelect` component to use composite values (`${llmConfigId}:${modelId}`) for option selection while displaying model names with distinguishing configuration sublabels. Emit the composite value to the parent; keep composite parsing/splitting out of persistence/mapping layers.

## Technical Approach

1. Modify option values to use composite format: `${model.configId}:${model.id}`
2. Display model name with muted sublabel showing configuration distinction (`configLabel`)
3. Keep component controlled; pass through composite `value`/`onChange` to parent (AgentForm will split)
4. Create utility functions for composite value building/parsing
5. Group items by canonical `provider`; show `configLabel` inside each option for disambiguation

## Specific Implementation Requirements

### Composite Utility Functions

Create helper functions in the component file:

```typescript
const buildComposite = (configId: string, modelId: string): string =>
  `${configId}:${modelId}`;

const parseComposite = (
  composite: string,
): { configId: string; modelId: string } => {
  const [configId, modelId] = composite.split(":", 2);
  return { configId: configId || "", modelId: modelId || "" };
};
```

### ModelSelect Component Updates

Update `apps/desktop/src/components/settings/agents/ModelSelect.tsx`:

**Option Value Structure**:

- Use `buildComposite(model.configId, model.id)` as Select option values
- Display text: primary = model name; secondary muted = `model.configLabel`
- Show placeholder as existing behavior

**Grouping**:

- Group options by canonical `model.provider`
- Within each group, render options with `configLabel` subtext to disambiguate

**Value Handling**:

- Component remains controlled via `value` prop
- Emits composite via `onChange` to parent (AgentForm parses/splits)
- Handle edge cases (missing model, invalid composite)

## Detailed Acceptance Criteria

- [ ] Select options use composite values `${configId}:${modelId}`
- [ ] Model display shows name with muted configuration sublabel (`configLabel`)
- [ ] Grouping uses canonical `provider`; duplicate models are visually distinct by `configLabel`
- [ ] Component remains controlled and emits composite to parent for splitting
- [ ] Placeholder behavior unchanged
- [ ] Utility functions handle composite parsing reliably
- [ ] Error handling for invalid composite values
- [ ] Styling consistent with existing form components

## Dependencies

- Requires: T-update-llmmodel-interface-and (`LlmModel` must have `configId` and `configLabel`)

## Security Considerations

- No sensitive configuration data exposed in options
- Validates composite format to prevent injection
- Maintains existing component security patterns

## Testing Requirements

- Unit tests for composite utility functions
- Test component renders distinct configurations of same model with different `configLabel`
- Test controlled value behavior with composite values
- Test placeholder and error state handling

## Files to Modify

- `apps/desktop/src/components/settings/agents/ModelSelect.tsx`

## Out of Scope

- Form integration logic (handled in AgentForm)
- Agent store updates (separate task)
- Model lookup implementation (separate task)

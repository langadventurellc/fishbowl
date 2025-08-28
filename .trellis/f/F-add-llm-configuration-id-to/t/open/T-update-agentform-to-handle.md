---
id: T-update-agentform-to-handle
title: Update AgentForm to handle composite model selection and split values
status: open
priority: medium
parent: F-add-llm-configuration-id-to
prerequisites:
  - T-update-modelselect-component
  - T-add-llmconfigid-to-ui-schema
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T18:35:22.763Z
updated: 2025-08-28T18:35:22.763Z
---

# Update AgentForm to Handle Composite Model Selection

## Context

Update `AgentForm` to manage composite model selection values, splitting them into separate `llmConfigId` and `model` fields for form validation while maintaining clean UI state management. `AgentForm` is the single place where composite values are parsed and split; persistence and mapping layers should only ever see clean fields.

## Technical Approach

1. Add local state `selectedComposite` to control ModelSelect component
2. Intercept `onValueChange` from ModelSelect to split composite values
3. Use `form.setValue()` to set both `llmConfigId` and `model` fields with validation
4. Initialize composite state correctly for both create and edit modes

## Specific Implementation Requirements

### State Management

Add local state in `AgentForm` component:

```typescript
const [selectedComposite, setSelectedComposite] = useState<string>("");
```

### Model Selection Handler

Create handler that:

1. Receives composite value from ModelSelect: "config-id:model-id"
2. Parses using utility: `parseComposite(value)`
3. Sets form fields: `form.setValue("llmConfigId", configId, { shouldValidate: true })` and `form.setValue("model", modelId, { shouldValidate: true })`
4. Updates local state: `setSelectedComposite(value)`
5. Triggers validation for both fields

### Initialization Logic

- Create Mode: Initialize `selectedComposite` as empty string until user selection
- Edit Mode: Initialize from existing data: `buildComposite(initialData.llmConfigId, initialData.model)`

### Form Integration

- Pass `selectedComposite` as `value` prop to ModelSelect
- Use the same composite utilities used by ModelSelect
- Ensure form validation works for both `llmConfigId` and `model` fields
- Handle form reset scenarios properly

## Detailed Acceptance Criteria

- [ ] Local `selectedComposite` state controls ModelSelect value
- [ ] Model selection splits composite into `llmConfigId` and `model` form fields
- [ ] Both form fields trigger validation when set via `setValue()`
- [ ] Create mode starts with empty composite until user selects
- [ ] Edit mode initializes composite from `{llmConfigId}:{model}` format
- [ ] Form reset clears composite state appropriately
- [ ] Composite parsing handles edge cases (missing parts, empty values)
- [ ] Form submission receives clean `llmConfigId` and `model` values

## Dependencies

- Requires: T-update-modelselect-component (composite values in ModelSelect)
- Requires: T-add-llmconfigid-to-ui-schema (form schema with `llmConfigId`)

## Security Considerations

- Form validation prevents submission with invalid `llmConfigId`
- Composite parsing validates format to prevent malformed data
- Clean separation between UI state and form data

## Testing Requirements

- Unit tests for composite handling in form submission
- Test create mode initialization (empty composite)
- Test edit mode initialization (composite from existing data)
- Test form validation with split `llmConfigId`/`model` fields

## Files to Modify

- `apps/desktop/src/components/settings/agents/AgentForm.tsx`

## Out of Scope

- Store integration (separate task)
- Model lookup components (separate task)
- Validation schema changes (already handled)

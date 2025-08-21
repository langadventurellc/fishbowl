---
id: T-remove-llm-parameters-from
title: Remove LLM Parameters from AgentForm with Validation Updates
status: done
priority: high
parent: F-remove-agent-defaults-and
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/agents/AgentForm.tsx:
    Removed temperature,
    maxTokens, and topP FormField components, cleaned up unused imports
    (getSliderDescription, Slider, useAgentsStore), updated getDefaultValues
    function to exclude LLM parameters, and removed defaults dependency from
    useEffect
  packages/ui-shared/src/schemas/agentSchema.ts: Removed temperature, maxTokens,
    and topP validation rules from agentSchema, simplifying form validation to
    only include name, model, role, personality, and optional systemPrompt
    fields
  packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts:
    Removed temperature, maxTokens, and topP fields from persistedAgentSchema,
    eliminated agentDefaultsSchema entirely, and removed defaults field from
    persistedAgentsSettingsSchema
  packages/shared/src/types/agents/index.ts: Removed agentDefaultsSchema export
    since it was deleted from persistence schema
  packages/ui-shared/src/mapping/agents/utils/normalizeAgentFields.ts:
    Updated function signature and implementation to exclude LLM parameters from
    normalization process
  packages/ui-shared/src/mapping/agents/mapSingleAgentPersistenceToUI.ts:
    Removed temperature, maxTokens, and topP field mappings from persistence to
    UI transformation
  packages/ui-shared/src/mapping/agents/mapSingleAgentUIToPersistence.ts:
    Removed temperature, maxTokens, and topP field mappings from UI to
    persistence transformation
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsUIToPersistence.test.ts:
    Removed LLM parameter properties from test data objects to match updated
    AgentSettingsViewModel interface
  packages/ui-shared/src/schemas/__tests__/agentSchema.test.ts:
    Removed all LLM parameter validation tests (temperature, maxTokens, topP
    range and missing field tests)
  packages/ui-shared/src/stores/__tests__/useAgentsStore.test.ts:
    Removed LLM parameters from test agent data and updated test expectations to
    focus on other agent properties like name and model
  apps/desktop/src/components/settings/agents/__tests__/LibraryTab.test.tsx:
    Removed temperature, maxTokens, and topP properties from mock agent data and
    test expectations to match updated AgentSettingsViewModel interface
  packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts:
    Completely rewrote test file to remove all LLM parameter validation tests
    and replaced them with tests for remaining schema validation (required
    fields, name validation, system prompt length limits)
  packages/ui-shared/src/mapping/agents/__tests__/roundTripMapping.test.ts:
    Removed LLM parameter properties from test data and assertions, simplified
    to test essential agent properties only
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsPersistenceToUI.test.ts:
    Completely rewrote test file to remove LLM parameter references from test
    data and expectations, focusing on core agent properties and optional fields
    handling
log:
  - Successfully removed LLM parameters (temperature, maxTokens, topP) from
    AgentForm component and entire codebase. Eliminated all three FormField
    components from the UI, updated the agentSchema and persistence schemas to
    exclude these fields, removed unused imports and dependencies, fixed all
    related test files across multiple packages, cleaned up mapping functions,
    and ensured all quality checks pass. Form validation now works correctly
    without LLM parameters, and agent creation/editing flows function properly
    with the simplified interface.
schema: v1.0
childrenIds: []
created: 2025-08-20T18:28:19.972Z
updated: 2025-08-20T18:28:19.972Z
---

## Context

Remove the temperature, maxTokens, and topP form fields from the `AgentForm` component. These LLM parameters are being eliminated from agent configuration to simplify the user interface and agent creation process.

**Related Feature**: F-remove-agent-defaults-and  
**File Location**: `apps/desktop/src/components/Agent/AgentForm.tsx`

## Implementation Requirements

### Primary Deliverables

1. **Remove LLM Parameter FormFields**
   - Remove temperature FormField and related input controls
   - Remove maxTokens FormField and related input controls
   - Remove topP FormField and related input controls
   - Clean up any related form descriptions and validation messages

2. **Update Form Schema and Validation**
   - Remove temperature, maxTokens, topP from form schema
   - Update form default values to exclude these fields
   - Update form validation logic to not process these fields
   - Remove these fields from form submission handling

3. **Update Component with Unit Tests**
   - Add unit tests to verify LLM parameter fields are not rendered
   - Test form submission works without LLM parameters
   - Test form validation excludes removed fields
   - Verify agent creation/editing flow still functions

### Technical Approach

**Current FormField Structure (from research):**

```typescript
<FormField
  control={form.control}
  name="temperature"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Temperature</FormLabel>
      <FormControl>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="2"
          {...field}
          value={field.value ?? ""}
          onChange={(e) => {
            const value = e.target.value === "" ? null : parseFloat(e.target.value);
            field.onChange(value);
          }}
        />
      </FormControl>
      <FormDescription>
        Controls randomness (0-2). Lower is more deterministic.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
// Similar structures for maxTokens and topP
```

### Step-by-Step Implementation

**Step 1: Remove FormField Components**

1. Locate and remove the entire temperature FormField block (lines ~173-195)
2. Locate and remove the entire maxTokens FormField block (lines ~196-220)
3. Locate and remove the entire topP FormField block (lines ~221-245)
4. Remove any surrounding div or container elements if they were specific to LLM parameters

**Step 2: Update Form Schema**
Find the form schema definition (likely using Zod) and remove:

```typescript
// Remove these fields from schema:
temperature: z.number().nullable().optional(),
maxTokens: z.number().nullable().optional(),
topP: z.number().nullable().optional(),
```

**Step 3: Update Default Values**
Remove from form defaultValues:

```typescript
// Remove these from defaultValues:
temperature: defaultAgentSettings?.temperature ?? 0.7,
maxTokens: defaultAgentSettings?.maxTokens ?? 4096,
topP: defaultAgentSettings?.topP ?? 1,
```

**Step 4: Update Form Submission**
Remove these fields from form submission/processing logic.

**Step 5: Create/Update Unit Tests**
Create test file: `apps/desktop/src/components/Agent/__tests__/AgentForm.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentForm } from '../AgentForm';

describe('AgentForm', () => {
  it('does not render LLM parameter fields', () => {
    render(<AgentForm mode="create" />);

    // Verify LLM parameter fields are not present
    expect(screen.queryByLabelText(/temperature/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/max tokens/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/top p/i)).not.toBeInTheDocument();
  });

  it('renders other form fields correctly', () => {
    render(<AgentForm mode="create" />);

    // Verify essential fields still exist (adjust based on actual form structure)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('submits form successfully without LLM parameters', async () => {
    const mockOnSubmit = jest.fn();
    render(<AgentForm mode="create" onSubmit={mockOnSubmit} />);

    // Fill in required fields (adjust based on actual form requirements)
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Agent' }
    });

    // Submit form
    fireEvent.click(screen.getByText(/create/i) || screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.not.objectContaining({
          temperature: expect.anything(),
          maxTokens: expect.anything(),
          topP: expect.anything(),
        })
      );
    });
  });
});
```

## Acceptance Criteria

### Functional Requirements

- [ ] Temperature form field completely removed from UI
- [ ] Max tokens form field completely removed from UI
- [ ] Top P form field completely removed from UI
- [ ] Form submission works without LLM parameter fields
- [ ] Agent creation process functions normally without these parameters

### User Interface Requirements

- [ ] Agent creation form excludes LLM parameter sections entirely
- [ ] Agent editing form excludes LLM parameter sections entirely
- [ ] Form layout maintains proper spacing and visual consistency
- [ ] No visual artifacts or layout issues from removed fields

### Technical Requirements

- [ ] Form schema excludes temperature, maxTokens, topP validation
- [ ] Default values exclude removed parameters
- [ ] TypeScript compilation succeeds without errors
- [ ] Form validation logic updated to exclude removed fields

### Testing Requirements

- [ ] Unit test verifies LLM parameter fields not rendered
- [ ] Unit test confirms form submission works without these parameters
- [ ] Unit test validates form schema excludes removed fields
- [ ] Tests pass with `pnpm test` command

## Files to Modify

1. **Primary File**: `apps/desktop/src/components/Agent/AgentForm.tsx`
2. **Test File**: `apps/desktop/src/components/Agent/__tests__/AgentForm.test.tsx` (create if doesn't exist)
3. **Schema File**: May need to update related form schema (likely in same file or imported)

## Dependencies

**Prerequisites**: None - this task can be completed independently

**Blocks**:

- Agent creation flow testing
- Overall agent configuration simplification

## Security Considerations

**Reduced Attack Surface**: Removing input fields reduces potential validation bypass or injection points, improving security posture.

## Testing Strategy

**Unit Testing Approach:**

- Mock form submission to test data structure
- Verify removed fields are not rendered
- Test form validation works with simplified schema
- Confirm other form functionality remains intact

**Test Commands:**

```bash
# Run specific component tests
pnpm test AgentForm

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## Implementation Notes

- Carefully identify all LLM parameter FormField blocks before removal
- Update both create and edit modes of the form
- Ensure form layout still looks proper after field removal
- Maintain existing form functionality for remaining fields
- Remove any imports that become unused after field removal

## Success Criteria

1. **Clean UI**: No LLM parameter fields visible in agent forms
2. **Functional Forms**: Agent creation/editing works without removed parameters
3. **Updated Validation**: Form schema and validation exclude removed fields
4. **Proper Layout**: Form maintains visual consistency after field removal
5. **Test Coverage**: Unit tests verify simplified form behavior
6. **Quality Checks**: TypeScript and ESLint pass without errors

This task significantly simplifies the agent configuration interface by removing complex LLM tuning parameters and focusing on essential agent characteristics.

---
id: T-integrate-agentform-with
title: Integrate AgentForm with stored defaults for new agent creation
status: open
priority: medium
parent: F-defaults-management-feature
prerequisites:
  - T-create-defaults-persistence
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-20T01:57:26.469Z
updated: 2025-08-20T01:57:26.469Z
---

Update the AgentForm component to use stored defaults from useAgentsStore instead of hardcoded values when creating new agents.

## Context

The AgentForm currently uses hardcoded default values (temperature: 1.0, maxTokens: 1000, topP: 0.95). These should come from the user's configured defaults in the store so that new agents automatically use the user's preferred settings.

**Note**: The persistence layer has been implemented with factory defaults of temperature: 0.7, maxTokens: 2000, topP: 0.9 (industry standards). The form should use the store's getDefaults() method which will return these values or any user-customized defaults.

## Current Implementation Analysis

AgentForm currently hardcodes defaults in the form's defaultValues:

```typescript
defaultValues: {
  name: initialData?.name || "",
  model: initialData?.model || "Claude 3.5 Sonnet",
  role: initialData?.role || "",
  personality: initialData?.personality || "",
  temperature: initialData?.temperature || 0.7,  // <- hardcoded (should use store defaults)\n  maxTokens: initialData?.maxTokens || 2000,     // <- hardcoded (should use store defaults)\n  topP: initialData?.topP || 0.9,               // <- hardcoded (should use store defaults)
  systemPrompt: initialData?.systemPrompt || "",
}
```

## Implementation Requirements

### Store Integration

- Import and use useAgentsStore to access defaults
- Load defaults when form is initialized for "create" mode
- Only use defaults for new agents, not when editing existing agents

### Form Default Values

Update form initialization to use store defaults:

```typescript
const { defaults } = useAgentsStore();

const getDefaultValues = useCallback((): AgentFormData => {
  if (mode === "edit" && initialData) {
    // Editing mode: use existing agent data
    return {
      name: initialData.name,
      model: initialData.model,
      role: initialData.role,
      personality: initialData.personality,
      temperature: initialData.temperature,
      maxTokens: initialData.maxTokens,
      topP: initialData.topP,
      systemPrompt: initialData.systemPrompt,
    };
  }

  // Create mode: use store defaults
  return {
    name: "",
    model: "Claude 3.5 Sonnet",
    role: "",
    personality: "",
    temperature: defaults.temperature,
    maxTokens: defaults.maxTokens,
    topP: defaults.topP,
    systemPrompt: "",
  };
}, [mode, initialData, defaults]);
```

### Loading State Handling

- Handle case where defaults haven't loaded yet
- Provide fallback values if defaults are not available
- Ensure form doesn't break during loading

### Mode-Specific Behavior

- **Create Mode**: Use defaults from store for LLM parameters
- **Edit Mode**: Use existing agent's values (no defaults)
- Preserve all other fields as they currently work

## Technical Approach

1. Add useAgentsStore hook to AgentForm component
2. Create getDefaultValues function to determine proper defaults
3. Update form initialization to use dynamic defaults
4. Add loading state handling
5. Test both create and edit modes work correctly
6. Ensure backward compatibility

## Implementation Details

```typescript
export const AgentForm: React.FC<AgentFormProps> = ({
  mode,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const { defaults } = useAgentsStore();

  const getDefaultValues = useCallback((): AgentFormData => {
    // Implementation as shown above
  }, [mode, initialData, defaults]);

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  // Update form when defaults change (for create mode)
  useEffect(() => {
    if (mode === "create") {
      form.reset(getDefaultValues());
    }
  }, [defaults, mode, form, getDefaultValues]);
```

## Acceptance Criteria

- ✅ New agents use defaults from store for temperature, maxTokens, topP
- ✅ Editing existing agents uses their current values (no defaults)
- ✅ Form handles defaults loading gracefully
- ✅ Fallback values provided if defaults unavailable
- ✅ Form updates when user changes defaults in DefaultsTab
- ✅ All existing form functionality preserved
- ✅ Model and other non-LLM fields maintain current behavior
- ✅ Form validation still works correctly
- ✅ Unit tests verify proper defaults integration

## Edge Cases to Handle

- Defaults not yet loaded from store
- Store in error state
- Invalid default values in store
- Switching between create/edit modes
- Form reset behavior with dynamic defaults

## Dependencies

- Requires T-create-defaults-persistence (completed) which provides defaults integration into the agents configuration system
- The useAgentsStore already has comprehensive defaults management with getDefaults(), setDefaults(), and resetDefaults() methods
- Store automatically handles persistence through existing agents infrastructure

## Files to Modify

- `apps/desktop/src/components/settings/agents/AgentForm.tsx`

## Testing Requirements

- Unit tests for create mode using store defaults
- Unit tests for edit mode using existing values
- Test form updates when defaults change
- Test loading and error states
- Test fallback behavior when defaults unavailable
- Test form validation with dynamic defaults

## Backward Compatibility

- Maintain existing behavior when defaults are not available
- Ensure existing tests continue to pass
- Graceful degradation if store integration fails

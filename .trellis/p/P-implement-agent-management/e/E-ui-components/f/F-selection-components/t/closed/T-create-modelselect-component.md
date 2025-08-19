---
id: T-create-modelselect-component
title: Create ModelSelect Component
status: done
priority: high
parent: F-selection-components
prerequisites:
  - T-create-roleselect-component
affectedFiles:
  apps/desktop/src/hooks/useLlmModels.ts:
    Created new hook to fetch and transform
    LLM configurations into model options with provider information
  apps/desktop/src/components/settings/agents/ModelSelect.tsx:
    Created new ModelSelect component following RoleSelect pattern with provider
    grouping and shadcn/ui Select integration
  apps/desktop/src/hooks/__tests__/useLlmModels.test.tsx:
    Added comprehensive unit
    tests for useLlmModels hook covering all states and functionality
  apps/desktop/src/components/settings/agents/__tests__/ModelSelect.test.tsx:
    Added comprehensive unit tests for ModelSelect component covering loading,
    error, empty, and success states
log:
  - Successfully implemented ModelSelect component that integrates with the LLM
    configuration system. The component displays available models from
    configured LLM providers (OpenAI, Anthropic) in a user-friendly grouped
    dropdown format showing "Model Name (Provider)". Component follows the
    established selection component pattern with loading, error, and empty
    states, includes comprehensive accessibility features, and passes all
    quality checks and tests.
schema: v1.0
childrenIds: []
created: 2025-08-19T16:11:43.852Z
updated: 2025-08-19T16:11:43.852Z
---

## Context

Create a reusable ModelSelect dropdown component that integrates with the LLM configuration system to display available models from configured providers. This is the most complex selection component as it requires investigating how LLM configurations are accessed and mapping providers to their available models.

## Technical Approach

**File Location**: `apps/desktop/src/components/settings/agents/ModelSelect.tsx`

**Dependencies**:

- LLM configuration service/hook (to be investigated during implementation)
- shadcn/ui Select component
- Follow patterns from RoleSelect and PersonalitySelect components

**Component Interface**:

```typescript
interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

## Implementation Requirements

### Investigation Phase

1. **Research LLM Config Access**: Investigate how LLM configurations are accessed in the system
   - Look for existing hooks like `useLlmConfig` mentioned in project specs
   - Examine existing services or stores for LLM configuration management
   - Understand how API keys and provider configs are managed
2. **Provider Mapping**: Determine how to map providers to their available models
   - OpenAI: GPT-4, GPT-3.5 Turbo, etc.
   - Anthropic: Claude 3.5 Sonnet, Claude 3 Haiku, etc.
3. **Model Display Format**: Implement "GPT-4 (OpenAI)" display format

### Core Functionality

1. **Data Loading**: Query LLM configurations from discovered service/hook
2. **Provider Processing**: Map configured providers to their available models
3. **Loading State**: Show spinner while configurations are being fetched
4. **Error Handling**: Display user-friendly error message if configs fail to load
5. **Empty State**: Handle case when no LLM configurations exist with "No LLM configurations" message
6. **Dynamic Updates**: Update model list when LLM configurations change
7. **Selection Display**: Show model name with provider suffix (e.g., "GPT-4 (OpenAI)")
8. **Legacy Support**: Support showing current model even if provider no longer configured (for editing)

### UI Implementation

1. **Use shadcn/ui Select**: Follow existing Select component patterns from RoleSelect
2. **Consistent Styling**: Match design system patterns from other selection components
3. **Accessibility**: Full keyboard navigation and screen reader support
4. **Responsive Design**: Work properly at all screen sizes

### State Management

1. **Subscribe to Config Source**: Use discovered LLM config hook/service
2. **No Data Persistence**: Component only handles selection, not configuration persistence
3. **Controlled Component**: Value controlled by parent component

## Detailed Acceptance Criteria

### Investigation Requirements

- ✅ Successfully identify how LLM configurations are accessed in the codebase
- ✅ Understand the data structure of LLM configurations
- ✅ Determine available models for each provider type
- ✅ Establish provider-to-model mapping structure

### Functional Requirements

- ✅ Component loads LLM configurations from discovered service on mount
- ✅ Displays loading spinner while configurations are being fetched
- ✅ Shows "No LLM configurations" message when no configs exist
- ✅ Maps providers to their available models correctly
- ✅ Displays models in "Model Name (Provider)" format
- ✅ Calls onChange with model identifier when selection changes
- ✅ Supports controlled value prop for current selection
- ✅ Handles disabled state properly
- ✅ Shows placeholder text when no model selected
- ✅ Updates dynamically when LLM configurations change

### Technical Requirements

- ✅ Written in TypeScript with proper interfaces
- ✅ Uses shadcn/ui Select component for rendering
- ✅ Follows React functional component patterns consistent with other select components
- ✅ Includes proper error boundaries if needed
- ✅ Implements proper cleanup for subscriptions

### Accessibility Requirements

- ✅ Proper ARIA labels and descriptions
- ✅ Keyboard navigation support (arrow keys, Enter, Escape)
- ✅ Screen reader announcements for state changes
- ✅ Focus management within dropdown

### Testing Requirements

- ✅ Unit tests for component rendering
- ✅ Test loading state display
- ✅ Test error state handling
- ✅ Test successful model selection
- ✅ Test empty state ("No LLM configurations")
- ✅ Test provider-to-model mapping
- ✅ Test disabled state behavior
- ✅ Test keyboard navigation
- ✅ Mock LLM config service for predictable testing

## Security Considerations

- Validate selected model ID exists in available models
- Don't expose sensitive API configuration details (keys, endpoints)
- Sanitize any user-provided placeholder text
- Don't expose internal configuration data structures in props

## Performance Requirements

- Component should render instantly (< 50ms)
- Dropdown should open without delay (< 100ms)
- Should not cause unnecessary re-renders of parent components
- Configuration queries should not block UI rendering

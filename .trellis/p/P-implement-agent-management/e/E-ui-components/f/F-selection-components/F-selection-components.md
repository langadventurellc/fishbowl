---
id: F-selection-components
title: Selection Components
status: done
priority: medium
parent: E-ui-components
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/agents/PersonalitySelect.tsx:
    Created PersonalitySelect dropdown component with loading, error, empty, and
    success states using shadcn/ui Select and usePersonalitiesStore integration;
    Added aria-label for accessibility consistency, conditional retry button
    display, and consistent error handling patterns
  packages/ui-shared/src/types/settings/PersonalitySelectProps.ts:
    Added TypeScript interface for PersonalitySelect component props including
    value, onChange, disabled, and placeholder; Updated to extend
    BaseSelectProps interface
  packages/ui-shared/src/types/settings/index.ts:
    Exported PersonalitySelectProps
    type for use across the application; Added export for RoleSelectProps
    interface; Added exports for new shared types
  apps/desktop/src/components/settings/agents/__tests__/PersonalitySelect.test.tsx:
    Added comprehensive test suite with 23 tests covering all component states,
    user interactions, accessibility features, and edge cases; Updated test to
    include isRetryable property in error mock to align with consistent error
    handling patterns
  packages/ui-shared/src/types/settings/RoleSelectProps.ts:
    Created interface for
    RoleSelect component props with value, onChange, disabled, and placeholder
    properties; Updated to extend BaseSelectProps interface
  apps/desktop/src/components/settings/agents/RoleSelect.tsx: Created reusable
    RoleSelect dropdown component that integrates with useRolesStore, handles
    all states (loading, error, empty, success), uses shadcn/ui Select
    components, includes ARIA labels and accessibility features, shows role
    names with truncated descriptions
  apps/desktop/src/components/settings/agents/index.ts: Added export for
    RoleSelect component; Added ModelSelect and PersonalitySelect to barrel
    exports
  apps/desktop/src/components/settings/agents/__tests__/RoleSelect.test.tsx:
    Created comprehensive unit tests covering all states, functionality,
    accessibility, edge cases, and component behavior with 100% test coverage
  apps/desktop/src/hooks/useLlmModels.ts:
    Created new hook to fetch and transform
    LLM configurations into model options with provider information
  apps/desktop/src/components/settings/agents/ModelSelect.tsx:
    Created new ModelSelect component following RoleSelect pattern with provider
    grouping and shadcn/ui Select integration; Updated to import types from
    shared package instead of local definition
  apps/desktop/src/hooks/__tests__/useLlmModels.test.tsx:
    Added comprehensive unit
    tests for useLlmModels hook covering all states and functionality
  apps/desktop/src/components/settings/agents/__tests__/ModelSelect.test.tsx:
    Added comprehensive unit tests for ModelSelect component covering loading,
    error, empty, and success states
  packages/ui-shared/src/types/settings/BaseSelectProps.ts: Created shared base
    interface for all selection components with consistent prop structure
  packages/ui-shared/src/types/settings/SelectWithLoadingProps.ts:
    Created extended interface for selection components that handle loading
    states
  packages/ui-shared/src/types/settings/SelectOption.ts: Created generic option structure for consistency across selection components
  packages/ui-shared/src/types/settings/ModelSelectProps.ts: Updated to extend BaseSelectProps interface
  apps/desktop/src/components/settings/agents/__tests__/SelectionComponents.integration.test.tsx:
    Created comprehensive integration test suite verifying consistent behavior
    patterns across all selection components
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-add-shared-types-and
  - T-create-modelselect-component
  - T-create-personalityselect
  - T-create-roleselect-component
created: 2025-08-19T15:59:45.759Z
updated: 2025-08-19T15:59:45.759Z
---

## Purpose and Functionality

Create reusable selection dropdown components (ModelSelect, RoleSelect, PersonalitySelect) that encapsulate data fetching and provide consistent UI patterns for the agent management system. These components will be the foundation for simplifying the agent form.

## Key Components to Implement

### ModelSelect Component

- Query LLM configurations from the system using appropriate hooks/services
- Map providers (OpenAI, Anthropic) to their available models
- Display model name with provider suffix (e.g., "GPT-4 (OpenAI)")
- Handle empty state when no LLM configurations exist
- Use shadcn/ui Select component for consistent styling

### RoleSelect Component

- Load roles from useRolesStore
- Display role name with optional truncated description preview
- Handle loading state with spinner
- Handle error state gracefully
- Consistent props interface with other select components

### PersonalitySelect Component

- Load personalities from usePersonalitiesStore
- Display personality name in dropdown
- Handle loading state with spinner
- Handle error state gracefully
- Consistent props interface matching other selects

## Detailed Acceptance Criteria

### All Selection Components Must:

- ✅ Follow the same props interface: `{ value: string, onChange: (value: string) => void, disabled?: boolean, placeholder?: string }`
- ✅ Use shadcn/ui Select component for rendering
- ✅ Handle loading states with appropriate visual feedback
- ✅ Handle error states with user-friendly messages
- ✅ Support keyboard navigation and accessibility
- ✅ Emit simple onChange events with selected values
- ✅ Be fully typed with TypeScript interfaces

### ModelSelect Specific:

- ✅ Show "No LLM configurations" message when no configs exist
- ✅ Update dynamically when LLM configurations change
- ✅ Support showing current model even if provider no longer configured (for editing)
- ✅ Use proper model mapping structure for providers

### RoleSelect/PersonalitySelect Specific:

- ✅ Show loading spinner while fetching data from store
- ✅ Display count of available items
- ✅ Handle empty state with appropriate message
- ✅ Support placeholder text when no selection

## Technical Requirements

### File Structure

```
apps/desktop/src/components/settings/
├── agents/
│   ├── ModelSelect.tsx
│   ├── RoleSelect.tsx
│   └── PersonalitySelect.tsx
```

### Component Interfaces

```typescript
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

### Dependencies

- shadcn/ui Select component
- useRolesStore from @fishbowl-ai/ui-shared
- usePersonalitiesStore from @fishbowl-ai/ui-shared
- LLM configuration service/hook (to be determined during implementation)

## Implementation Guidance

1. **Start with RoleSelect and PersonalitySelect** as they follow similar patterns to existing components
2. **ModelSelect will require** investigating how LLM configurations are accessed in the system
3. **Use existing patterns** from RolesList and PersonalitiesList components for loading/error handling
4. **Keep components focused** - they should only handle selection, not data persistence
5. **Test each component independently** before integration with forms
6. **Follow naming conventions** from existing codebase (PascalCase for components, camelCase for props)

## Testing Requirements

- Unit tests for each selection component
- Test loading states, error states, and successful selection
- Test keyboard navigation and accessibility features
- Test empty state handling
- Mock store data for predictable testing

## Security Considerations

- Validate selected values against available options
- Sanitize any user-provided text in placeholders
- Don't expose sensitive API configuration details in ModelSelect

## Performance Requirements

- Selection dropdowns should open instantly (< 100ms)
- Data fetching should not block UI rendering
- Use React.memo if re-renders become an issue (but avoid premature optimization)

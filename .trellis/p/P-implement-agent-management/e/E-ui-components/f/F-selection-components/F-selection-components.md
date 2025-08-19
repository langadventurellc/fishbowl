---
id: F-selection-components
title: Selection Components
status: open
priority: medium
parent: E-ui-components
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
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

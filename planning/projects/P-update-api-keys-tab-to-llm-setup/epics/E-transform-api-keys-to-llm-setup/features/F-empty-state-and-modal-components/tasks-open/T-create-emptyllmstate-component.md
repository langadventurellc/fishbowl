---
kind: task
id: T-create-emptyllmstate-component
title: Create EmptyLlmState component with provider dropdown
status: open
priority: high
prerequisites:
  - F-code-migration-and-setup
created: "2025-08-04T12:14:25.840871"
updated: "2025-08-04T12:14:25.840871"
schema_version: "1.1"
parent: F-empty-state-and-modal-components
---

## Context

Build the empty state component that displays when no LLM providers are configured. This component should follow the existing empty state pattern from EmptyLibraryState.tsx.

## Technical Approach

1. Create `apps/desktop/src/components/settings/llm-setup/EmptyLlmState.tsx`
2. Import and use shadcn/ui Select component for the provider dropdown
3. Use Button component for the setup action
4. Center layout using flex similar to EmptyLibraryState pattern

## Implementation Details

### Component Structure:

```tsx
interface EmptyLlmStateProps {
  onSetupProvider: (provider: "openai" | "anthropic") => void;
}
```

### Key Features:

- Centered layout with descriptive messaging: "No LLM providers configured"
- Provider dropdown using shadcn/ui Select with options: "OpenAI" and "Anthropic"
- Button text updates based on selected provider: "Set up OpenAI" or "Set up Anthropic"
- Icon in circular background (similar to UserPlus in EmptyLibraryState)
- Responsive padding and max-width for text content

### Reference Implementation:

- Study `apps/desktop/src/components/settings/agents/EmptyLibraryState.tsx` for pattern
- Use Select component from shadcn/ui (already in codebase)
- Maintain consistent styling with existing empty states

## Acceptance Criteria

- [ ] Component renders with centered layout matching existing empty states
- [ ] Dropdown shows "OpenAI" and "Anthropic" options
- [ ] Button text dynamically updates based on selected provider
- [ ] Button click calls onSetupProvider with selected provider value
- [ ] Component uses appropriate icon (consider Settings or Key icon)
- [ ] Unit tests cover dropdown selection and button click behavior
- [ ] TypeScript types properly defined for props
- [ ] Accessibility: proper ARIA labels for dropdown and button
- [ ] Component follows existing code style and conventions

## Testing Requirements

Create unit tests that verify:

- Component renders all elements correctly
- Dropdown selection updates button text
- Button click passes correct provider to callback
- Default provider selection behavior
- Accessibility attributes are present

## Dependencies

This task depends on F-code-migration-and-setup being completed first to ensure the proper directory structure exists.

### Log

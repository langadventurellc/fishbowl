---
kind: task
id: T-create-emptyllmstate-component
parent: F-empty-state-and-modal-components
status: done
title: Create EmptyLlmState component with provider dropdown
priority: high
prerequisites:
  - F-code-migration-and-setup
created: "2025-08-04T12:14:25.840871"
updated: "2025-08-04T12:19:18.130155"
schema_version: "1.1"
worktree: null
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
- [ ] TypeScript types properly defined for props
- [ ] Accessibility: proper ARIA labels for dropdown and button
- [ ] Component follows existing code style and conventions

## Testing Requirements

No tests!

## Dependencies

This task depends on F-code-migration-and-setup being completed first to ensure the proper directory structure exists.

### Log

**2025-08-04T17:25:41.453976Z** - Implemented EmptyLlmState component with all required features including provider dropdown (OpenAI/Anthropic), dynamic button text, centered layout with Key icon, and proper accessibility support. Component follows existing empty state patterns from EmptyLibraryState.tsx and integrates with shadcn/ui Select and Button components. All quality checks passed (linting, formatting, type checking).

- filesChanged: ["apps/desktop/src/components/settings/llm-setup/EmptyLlmState.tsx", "apps/desktop/src/components/settings/llm-setup/index.ts"]

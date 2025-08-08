---
kind: feature
id: F-react-components-and-ui-layout
title: React Components and UI Layout
status: in-progress
priority: normal
prerequisites: []
created: "2025-08-07T16:36:06.947847"
updated: "2025-08-07T16:36:06.947847"
schema_version: "1.1"
parent: E-ui-and-frontend-integration
---

# React Components and UI Layout

## Purpose

Create the core React components for displaying and managing LLM configurations in the desktop application's settings interface. This feature establishes the visual structure and component hierarchy for the LLM configuration management UI.

## Key Components to Implement

### 1. LlmSetupSection Component

- Main container component for the LLM configuration section
- Manages the list of configured providers
- Handles display of empty state when no configurations exist
- Integrates add button for new configurations
- Coordinates between list view and modal operations

### 2. LlmProviderCard Component

- Individual card component for displaying a single LLM configuration
- Shows provider icon, custom name, and provider type
- Includes edit and delete action buttons
- Displays configuration status and last updated time
- Masks sensitive information (API keys)

### 3. LlmConfigModal Component

- Modal dialog for adding/editing LLM configurations
- Form layout with all configuration fields
- Provider selection dropdown
- API key input with secure masking
- Custom name field with character counter
- Base URL field (shown conditionally for custom providers)
- Auth header checkbox option

### 4. EmptyLlmState Component

- Displays when no LLM configurations exist
- Provides clear call-to-action to add first configuration
- Includes helpful description text
- Maintains consistent design with other empty states in the app

## Detailed Acceptance Criteria

### Component Structure

- ✓ All components follow existing Fishbowl design patterns
- ✓ Use shadcn/ui components for consistency (Card, Button, Input, Dialog, etc.)
- ✓ Components are properly typed with TypeScript
- ✓ Props interfaces defined for all components
- ✓ Components are modular and reusable

### Visual Design

- ✓ Provider cards display in a grid or list layout
- ✓ Responsive design that works on different screen sizes
- ✓ Consistent spacing and typography with existing app
- ✓ Provider icons displayed correctly (OpenAI, Anthropic)
- ✓ Dark mode compatibility

### Accessibility

- ✓ Proper ARIA labels on all interactive elements
- ✓ Keyboard navigation support
- ✓ Focus management in modal dialogs
- ✓ Screen reader compatible

## Technical Requirements

### File Structure

```
apps/desktop/src/components/settings/llm-setup/
├── LlmSetupSection.tsx
├── LlmProviderCard.tsx
├── LlmConfigModal.tsx
├── EmptyLlmState.tsx
└── index.ts (barrel export)
```

### Component Dependencies

- Use existing shadcn/ui components from the project
- Import types from `@fishbowl-ai/shared` for LLM configuration
- Use existing icon components or add provider-specific icons
- Follow existing modal patterns from the codebase

### Props and State

- Components receive data through props (no direct IPC calls)
- Local state for UI-specific concerns (modal open/close, form dirty state)
- Callbacks passed as props for user actions

## Implementation Guidance

### Component Patterns

- Follow existing component patterns in `apps/desktop/src/components/settings/`
- Use composition for complex components
- Keep components focused on presentation
- Extract reusable UI logic to custom hooks

### Styling Approach

- Use Tailwind CSS classes for styling
- Follow existing color scheme and spacing conventions
- Ensure components work with light and dark themes
- Use CSS modules only if needed for complex animations

### Testing Requirements

- Components should be testable in isolation
- Mock props and callbacks for testing
- Test user interactions (clicks, form inputs)
- Verify accessibility requirements

## Security Considerations

- Never display raw API keys in the UI
- Use password input type for API key fields
- Mask API keys when displaying (show only last 4 characters)
- No sensitive data in component state that could be exposed

## Performance Requirements

- Components should render efficiently
- Use React.memo where appropriate for optimization
- Lazy load modal content if needed
- Minimize re-renders with proper state management

## Dependencies

- This feature has no dependencies on other features in this epic
- Relies on the completed business logic and service layer from previous epics
- Types and interfaces from `@fishbowl-ai/shared` package

### Log

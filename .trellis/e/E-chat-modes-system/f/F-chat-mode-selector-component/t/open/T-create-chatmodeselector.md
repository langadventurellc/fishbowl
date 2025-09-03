---
id: T-create-chatmodeselector
title: Create ChatModeSelector component with shadcn/ui integration
status: open
priority: high
parent: F-chat-mode-selector-component
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T22:26:55.314Z
updated: 2025-09-03T22:26:55.314Z
---

# Create ChatModeSelector Component

## Context

Create a new React component for selecting between Manual and Round Robin chat modes using the established shadcn/ui Select component patterns found in the codebase.

## Implementation Requirements

### Component Structure

- **Location**: `apps/desktop/src/components/chat/ChatModeSelector.tsx`
- **Dependencies**: Use existing shadcn/ui Select components (`Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`)
- **Pattern**: Follow the established patterns seen in `ProviderSelector.tsx`, `ModelSelect.tsx`, and other Select implementations

### Component Interface

```typescript
interface ChatModeSelectorProps {
  value: "manual" | "round-robin" | null;
  onValueChange: (mode: "manual" | "round-robin") => void;
  disabled?: boolean;
  className?: string;
}
```

### Technical Implementation

- **Fixed Width**: Use `w-40` (160px) for consistent layout
- **Mode Options**:
  - Manual: "Manual" with subtitle "Full control over agent participation"
  - Round Robin: "Round Robin" with subtitle "Agents take turns automatically"
- **Accessibility**: Include proper ARIA labels, keyboard navigation support
- **Default Value**: Handle null value by defaulting to "manual"
- **Error Prop**: Add error prop for displaying validation/update errors inline

### Styling Requirements

- **Consistency**: Match existing Select component styling in the codebase
- **Mode Labels**: Two-line layout with main label and descriptive subtitle
- **Theme Support**: Support both light and dark themes
- **Hover States**: Consistent with other interactive elements

### Unit Testing Requirements

- **Component Rendering**: Test component renders correctly with all props
- **User Interactions**: Test dropdown opens, options selectable, onChange callback
- **Accessibility**: Test keyboard navigation (Tab, Enter, Arrow keys)
- **Props Handling**: Test disabled state, custom className, null value handling
- **Error States**: Test error prop display and styling

## Acceptance Criteria

- [ ] Component created at `apps/desktop/src/components/chat/ChatModeSelector.tsx`
- [ ] Uses shadcn/ui Select components for consistency
- [ ] Supports both "manual" and "round-robin" modes with descriptive labels
- [ ] Handles null/undefined values gracefully (defaults to "manual")
- [ ] Includes comprehensive TypeScript types and JSDoc documentation
- [ ] Implements proper accessibility attributes (ARIA labels, keyboard support)
- [ ] Follows existing codebase styling patterns and supports themes
- [ ] Includes comprehensive unit tests with >90% coverage
- [ ] Error handling prop for displaying inline error messages
- [ ] Component is self-contained and reusable

## Dependencies

- Existing shadcn/ui Select components
- Established TypeScript patterns from similar Select components
- Theme and styling utilities (`cn` function, theme variables)

## Out of Scope

- Integration with AgentLabelsContainerDisplay (separate task)
- Store integration and chat mode logic (handled by parent components)
- E2E testing (will be covered in integration tasks)

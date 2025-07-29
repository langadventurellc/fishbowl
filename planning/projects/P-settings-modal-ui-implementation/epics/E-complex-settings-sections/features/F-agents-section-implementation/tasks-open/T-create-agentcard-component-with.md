---
kind: task
id: T-create-agentcard-component-with
title: Create AgentCard component with interactive elements
status: open
priority: normal
prerequisites:
  - T-create-agentssection-main
created: "2025-07-29T16:16:27.556966"
updated: "2025-07-29T16:16:27.556966"
schema_version: "1.1"
parent: F-agents-section-implementation
---

# Create AgentCard Component with Interactive Elements

## Context

Create a reusable AgentCard component that displays agent information with interactive edit/delete buttons. This component belongs in the **desktop project** (`apps/desktop/src/`), while prop interfaces belong in the **shared package**.

**Important**: This is UI/UX development only - buttons should be styled and interactive but non-functional as specified. Focus on demonstrating polished UI interactions.

## Implementation Requirements

### 1. Component Structure

Create `apps/desktop/src/components/settings/agents/AgentCard.tsx`:

- Reusable card component for displaying agent information
- Clean, consistent layout with proper visual hierarchy
- Interactive elements with hover states
- Responsive design for various screen sizes

### 2. Shared Types (extend in packages/shared/src/types/)

```typescript
interface AgentCardProps {
  agent: AgentCard;
  onEdit?: (agentId: string) => void;
  onDelete?: (agentId: string) => void;
  className?: string;
}
```

### 3. Visual Design

- Use shadcn/ui Card component as base
- Agent icon (Lucide React) positioned top-left
- Agent name as prominent heading
- Model and role as secondary information
- Edit/delete buttons right-aligned in header or footer
- Consistent spacing and typography

### 4. Interactive Elements

- Hover state with subtle elevation change
- Edit button with pencil icon (styled but non-functional)
- Delete button with trash icon (styled but non-functional)
- Button hover states with appropriate color changes
- Focus states for keyboard navigation

### 5. Accessibility Features

- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly content structure
- Semantic HTML structure

## Acceptance Criteria

- [ ] AgentCard displays all agent information clearly
- [ ] Edit and delete buttons are properly styled and positioned
- [ ] Card has smooth hover state transitions
- [ ] Component is fully responsive across screen sizes
- [ ] All interactive elements have proper focus states
- [ ] ARIA labels present for accessibility
- [ ] Component accepts proper TypeScript props
- [ ] Consistent visual design with shadcn/ui patterns
- [ ] Unit tests cover rendering and prop handling

## Technical Approach

1. Create AgentCard component in desktop project
2. Define proper TypeScript interfaces in shared package
3. Use shadcn/ui Card, Button components
4. Implement Lucide React icons for agent icons and buttons
5. Add Tailwind classes for layout and hover states
6. Include proper accessibility attributes
7. Write unit tests for component rendering and props
8. Ensure component works well in grid and list layouts

## Visual Specifications

- Card padding: consistent with shadcn/ui Card standards
- Icon size: 24x24px for agent icon, 16x16px for buttons
- Typography: agent name (font-medium), model/role (text-muted-foreground)
- Hover elevation: subtle shadow increase
- Button spacing: proper gap between edit/delete buttons
- Color scheme: consistent with application theme

## Testing Requirements

- Unit tests for component rendering with various props
- Hover state behavior verification
- Accessibility attribute testing
- Responsive layout testing
- Integration testing within parent components

## Dependencies

- Uses shadcn/ui Card and Button components
- Requires Lucide React for icons
- Integrates with AgentCard interface from shared types

### Log

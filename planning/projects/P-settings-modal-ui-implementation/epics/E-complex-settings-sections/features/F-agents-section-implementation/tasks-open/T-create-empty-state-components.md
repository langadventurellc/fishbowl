---
kind: task
id: T-create-empty-state-components
title: Create empty state components for Library and Templates tabs
status: open
priority: normal
prerequisites:
  - T-implement-library-tab-with
  - T-implement-templates-tab-with-pre
created: "2025-07-29T16:17:52.501532"
updated: "2025-07-29T16:17:52.501532"
schema_version: "1.1"
parent: F-agents-section-implementation
---

# Create Empty State Components for Library and Templates Tabs

## Context

Create reusable empty state components to display when no content is available in Library and Templates tabs. These components belong in the **desktop project** (`apps/desktop/src/`), while prop interfaces belong in the **shared package**.

**Important**: This is UI/UX development only - focus on friendly, helpful empty states that guide users effectively and demonstrate good UX practices.

## Implementation Requirements

### 1. Component Creation

Create two empty state components:

- `apps/desktop/src/components/settings/agents/EmptyLibraryState.tsx`
- `apps/desktop/src/components/settings/agents/EmptyTemplatesState.tsx`

### 2. Shared Types (extend in packages/shared/src/types/)

```typescript
interface EmptyStateProps {
  onAction?: () => void;
  className?: string;
}
```

### 3. Library Empty State

- Friendly icon (Users or UserPlus from Lucide React)
- Heading: "No agents configured"
- Description: "Create your first agent to get started with personalized AI assistants"
- Primary action button: "Create New Agent" (styled but non-functional)
- Secondary text: Tips or helpful guidance

### 4. Templates Empty State

- Friendly icon (Template or Sparkles from Lucide React)
- Heading: "No templates available"
- Description: "Templates help you quickly set up agents with pre-configured settings"
- Primary action button: "Browse Templates" (styled but non-functional)
- Secondary text: "Templates will appear here when available"

### 5. Visual Design

- Centered layout with proper spacing
- Large, friendly icon (48x48px or larger)
- Clear typography hierarchy
- Subtle background or border styling
- Consistent with shadcn/ui design patterns
- Responsive design for various screen sizes

## Acceptance Criteria

- [ ] Library empty state displays friendly message and action button
- [ ] Templates empty state shows helpful guidance for users
- [ ] Both components use appropriate Lucide React icons
- [ ] Typography hierarchy is clear and readable
- [ ] Action buttons are properly styled as primary actions
- [ ] Components are centered and well-spaced
- [ ] Design is consistent with overall application styling
- [ ] Components are responsive across screen sizes
- [ ] Unit tests cover rendering and prop handling

## Technical Approach

1. Create two separate empty state components
2. Use Lucide React icons for visual interest
3. Apply consistent typography using Tailwind classes
4. Center content using flexbox or grid layout
5. Style action buttons using shadcn/ui Button component
6. Add proper spacing and visual hierarchy
7. Include unit tests for both components
8. Ensure accessibility with proper semantic structure

## Visual Specifications

- Icon size: 48x48px minimum, subtle color (text-muted-foreground)
- Heading: text-xl font-semibold, center-aligned
- Description: text-sm text-muted-foreground, center-aligned, max-width for readability
- Button: primary variant, appropriate padding
- Overall spacing: generous padding (p-8 or p-12)
- Container: subtle background or border for definition

## Content Guidelines

**Library Empty State:**

- Heading: Clear, direct ("No agents configured")
- Description: Encouraging, explains benefit
- Button: Action-oriented ("Create New Agent")
- Tone: Friendly and helpful

**Templates Empty State:**

- Heading: Informative ("No templates available")
- Description: Educational about templates
- Button: Discovery-focused ("Browse Templates")
- Tone: Informative and patient

## Integration Points

- Library tab shows empty state when no agents or no search results
- Templates tab shows empty state when no templates available
- Components should integrate smoothly with parent tab components
- Proper conditional rendering in parent components

## Testing Requirements

- Unit tests for component rendering with default props
- Testing with custom className and onAction props
- Visual consistency testing with design system
- Accessibility testing for screen readers
- Integration testing within parent tab components

## Dependencies

- Uses Lucide React for icons
- Uses shadcn/ui Button component
- Integrates with Library and Templates tab components
- Follows shadcn/ui design patterns for consistency

### Log

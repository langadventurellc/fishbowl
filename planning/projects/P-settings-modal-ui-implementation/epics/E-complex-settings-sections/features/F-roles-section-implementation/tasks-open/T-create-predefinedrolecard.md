---
kind: task
id: T-create-predefinedrolecard
title: Create PredefinedRoleCard component with responsive grid layout
status: open
priority: normal
prerequisites:
  - T-create-role-interfaces-and
  - T-create-predefined-roles-data-and
created: "2025-07-29T11:00:38.596657"
updated: "2025-07-29T11:00:38.596657"
schema_version: "1.1"
parent: F-roles-section-implementation
---

# Create PredefinedRoleCard Component with Responsive Grid Layout

## Context

Implement the individual predefined role card component that displays role information in a visually appealing card format. Cards will be used in a 2-column responsive grid layout and include hover states with "View Details" indication.

## Technical Approach

### 1. Create PredefinedRoleCard Component

**File: `apps/desktop/src/components/settings/PredefinedRoleCard.tsx`**

Implement card component using shadcn/ui Card primitives:

```tsx
interface PredefinedRoleCardProps {
  role: PredefinedRole;
  className?: string;
}

export const PredefinedRoleCard = ({
  role,
  className,
}: PredefinedRoleCardProps) => {
  return (
    <Card className={cn("role-card", className)}>
      <CardHeader>
        <div className="role-icon">{role.icon}</div>
        <CardTitle>{role.name}</CardTitle>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      {/* Hover state with "View Details" indicator */}
    </Card>
  );
};
```

### 2. Implement Card Styling

**Styling approach:**

- Use shadcn/ui Card components for consistent styling
- Implement hover states with subtle elevation changes
- Add non-editable visual indicators (gray out or icon indication)
- Ensure consistent card sizing with proper aspect ratios
- Add smooth transitions for hover interactions

### 3. Create Responsive Grid Container

**File: `apps/desktop/src/components/settings/PredefinedRolesGrid.tsx`**

- Implement CSS Grid for responsive 2-column layout
- Handle responsive breakpoint at 640px (sm:) for mobile
- Use 16px gaps between cards as specified
- Ensure equal-height cards with flex layout

### 4. Add Hover Interactions

**Hover behavior requirements:**

- Show "View Details" text or icon on hover
- Subtle elevation change (box-shadow increase)
- Smooth transitions (200ms duration)
- Visual feedback that maintains accessibility

### 5. Create Storybook Stories

**File: `apps/desktop/src/components/settings/__stories__/PredefinedRoleCard.stories.tsx`**

- Individual card variations (different roles)
- Grid layout story with multiple cards
- Hover state demonstrations
- Responsive behavior testing

## Detailed Acceptance Criteria

### Visual Design

- [ ] Cards display role icon prominently at the top
- [ ] Role name uses CardTitle styling with proper hierarchy
- [ ] Description text uses CardDescription styling with muted color
- [ ] Cards have consistent dimensions and visual balance
- [ ] Non-editable indicator clearly shows cards are read-only

### Responsive Grid Layout

- [ ] 2-column grid on desktop screens (≥640px width)
- [ ] 1-column layout on mobile screens (<640px width)
- [ ] 16px gaps between cards maintained at all screen sizes
- [ ] Cards expand to fill available space equally
- [ ] Grid maintains proper alignment and spacing

### Hover Interactions

- [ ] "View Details" indication appears on card hover
- [ ] Elevation change provides subtle depth feedback
- [ ] Transitions are smooth and professional (200ms duration)
- [ ] Hover states work on both mouse and keyboard focus
- [ ] No accessibility issues with hover-only information

### Component Architecture

- [ ] Props interface follows TypeScript best practices
- [ ] Component is memoized for performance optimization
- [ ] Proper className composition with cn() utility
- [ ] Follows existing component patterns from codebase

### Accessibility

- [ ] Cards are keyboard navigable with proper focus indicators
- [ ] Screen readers can announce role information clearly
- [ ] Hover information is also available via keyboard focus
- [ ] ARIA labels provide context for non-editable state
- [ ] Color contrast meets WCAG guidelines

### Testing Requirements

- [ ] Unit tests for component rendering with different role data
- [ ] Tests for responsive behavior at different screen sizes
- [ ] Hover interaction tests using React Testing Library
- [ ] Accessibility tests with axe-core integration
- [ ] Visual regression tests for design consistency

## Implementation Notes

- Use shadcn/ui Card, CardHeader, CardTitle, CardDescription components
- Follow existing card patterns from PersonalityCard or similar components
- Ensure icons render consistently across different operating systems
- Consider using CSS custom properties for consistent theming

## Dependencies

- Requires: T-create-role-interfaces-and (PredefinedRole interface)
- Requires: T-create-predefined-roles-data-and (predefined roles data)

## Security Considerations

- Escape role names and descriptions to prevent XSS
- Ensure emoji icons don't cause rendering issues
- Validate props to prevent runtime errors

### Log

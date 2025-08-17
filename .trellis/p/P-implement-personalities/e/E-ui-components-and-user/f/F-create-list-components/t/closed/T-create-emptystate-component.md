---
id: T-create-emptystate-component
title: Create EmptyState component for personalities list
status: done
priority: medium
parent: F-create-list-components
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/personalities/EmptyState.tsx:
    Created new EmptyState component following app patterns with Users icon,
    clear messaging, and create button
  apps/desktop/src/components/settings/personalities/index.ts: Added EmptyState export to personalities module
  apps/desktop/src/components/settings/personalities/__tests__/EmptyState.test.tsx:
    Created comprehensive unit tests covering rendering, interactions,
    accessibility, and responsive behavior
log:
  - Successfully implemented EmptyState component for personalities list with
    comprehensive testing and quality checks. The component follows established
    app patterns and provides a clean, accessible empty state experience.
    Features centered layout with Users icon, clear messaging about
    personalities purpose, and prominent create button. All tests pass and
    component is properly exported from personalities module.
schema: v1.0
childrenIds: []
created: 2025-08-17T15:04:03.473Z
updated: 2025-08-17T15:04:03.473Z
---

# Create EmptyState Component for Personalities List

## Context

Create the EmptyState component that displays when no personalities exist. This should match the patterns used in the Roles section and provide clear guidance to users.

## Implementation Requirements

### Component Location

- File: `apps/desktop/src/components/settings/personalities/EmptyState.tsx`
- Export from personalities index.ts

### Component Structure

```tsx
interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState = ({ onCreateClick }: EmptyStateProps) => {
  // Implementation here
};
```

### Visual Requirements

- Clear message: "No personalities yet"
- Helpful subtext explaining personalities purpose
- Large, prominent create button
- Uses muted colors for text
- Centers content appropriately
- Matches other empty states in app
- Uses lucide-react icons for consistency

### Styling Guidelines

- Follow existing app empty state patterns
- Use Tailwind classes for consistent spacing
- Responsive design that works on mobile and desktop
- Button should use primary styling to draw attention

### Acceptance Criteria

- [ ] Component renders centered empty state message
- [ ] Create button triggers onCreateClick callback
- [ ] Styling matches other empty states in the app
- [ ] Text explains purpose of personalities clearly
- [ ] Icon adds visual appeal (use appropriate lucide-react icon)
- [ ] Responsive layout works on all screen sizes

## Testing Requirements

- Unit tests for component rendering
- Test onCreateClick callback is triggered
- Test responsive layout renders correctly
- Test accessibility (screen reader support)

## Dependencies

- shadcn/ui components (Button, etc.)
- lucide-react icons
- Tailwind CSS for styling

## Reference Implementation

Look at existing empty states in the app and follow similar patterns for consistency.

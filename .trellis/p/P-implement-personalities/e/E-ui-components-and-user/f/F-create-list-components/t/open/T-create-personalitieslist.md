---
id: T-create-personalitieslist
title: Create PersonalitiesList container component
status: open
priority: medium
parent: F-create-list-components
prerequisites:
  - T-create-emptystate-component
  - T-create-personalitycard
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T15:04:42.050Z
updated: 2025-08-17T15:04:42.050Z
---

# Create PersonalitiesList Container Component

## Context

Create the PersonalitiesList component that serves as the main container for displaying all personalities in a responsive grid layout. It handles empty state rendering and passes callbacks to individual cards.

## Implementation Requirements

### Component Location

- File: `apps/desktop/src/components/settings/personalities/PersonalitiesList.tsx`
- Export from personalities index.ts

### Component Interface

```tsx
interface PersonalitiesListProps {
  personalities: PersonalityViewModel[];
  onEdit: (personality: PersonalityViewModel) => void;
  onDelete: (personality: PersonalityViewModel) => void;
  onCreateClick: () => void;
  isLoading?: boolean;
}

export const PersonalitiesList = ({
  personalities,
  onEdit,
  onDelete,
  onCreateClick,
  isLoading = false,
}: PersonalitiesListProps) => {
  // Implementation here
};
```

### Component Logic

```tsx
if (isLoading) {
  return <LoadingState />; // Optional loading indicator
}

if (personalities.length === 0) {
  return <EmptyState onCreateClick={onCreateClick} />;
}

return (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {personalities.map((personality) => (
      <PersonalityCard
        key={personality.id}
        personality={personality}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </div>
);
```

### Layout Requirements

- **Responsive Grid**:
  - 1 column on mobile (default)
  - 2 columns on tablet (md breakpoint)
  - 3 columns on desktop (lg breakpoint)
- **Spacing**: gap-4 between cards for consistent spacing
- **Empty State**: Shows EmptyState component when no personalities
- **Loading State**: Optional loading indicator (simple implementation)

### Props Handling

- **personalities**: Array of PersonalityViewModel objects to display
- **onEdit**: Callback passed to each PersonalityCard for edit actions
- **onDelete**: Callback passed to each PersonalityCard for delete actions
- **onCreateClick**: Callback passed to EmptyState for create action
- **isLoading**: Optional prop to show loading state

### Acceptance Criteria

- [ ] Renders grid of PersonalityCard components
- [ ] Shows EmptyState when personalities array is empty
- [ ] Passes edit/delete handlers to cards correctly
- [ ] Uses responsive grid (1/2/3 columns)
- [ ] Proper spacing between cards (gap-4)
- [ ] Handles loading state appropriately
- [ ] Each card receives unique key prop
- [ ] All callbacks flow through properly
- [ ] Layout adjusts correctly on different screen sizes

## Testing Requirements

- Unit tests for rendering personalities list
- Test empty state rendering when no personalities
- Test responsive grid layout classes
- Test that callbacks are passed correctly to children
- Test loading state display (if implemented)
- Test key prop uniqueness
- Test grid responsiveness with different numbers of items

## Dependencies

- PersonalityCard component (prerequisite)
- EmptyState component (prerequisite)
- PersonalityViewModel type from @fishbowl-ai/ui-shared
- Tailwind CSS for responsive grid classes

## Reference Implementation

Look at RolesList component for similar container patterns and follow the same responsive grid approach.

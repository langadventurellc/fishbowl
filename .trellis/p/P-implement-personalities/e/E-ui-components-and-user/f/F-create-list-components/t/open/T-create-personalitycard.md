---
id: T-create-personalitycard
title: Create PersonalityCard component for list display
status: open
priority: medium
parent: F-create-list-components
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T15:04:23.161Z
updated: 2025-08-17T15:04:23.161Z
---

# Create PersonalityCard Component for List Display

## Context

Create the PersonalityCard component that displays individual personality information in the list view. This should match the RoleCard visual design and provide edit/delete actions.

## Implementation Requirements

### Component Location

- File: `apps/desktop/src/components/settings/personalities/PersonalityCard.tsx`
- Export from personalities index.ts
- Update existing PersonalityCard.tsx to match new requirements

### Component Interface

```tsx
interface PersonalityCardProps {
  personality: PersonalityViewModel; // from ui-shared types
  onEdit: (personality: PersonalityViewModel) => void;
  onDelete: (personality: PersonalityViewModel) => void;
}

export const PersonalityCard = ({
  personality,
  onEdit,
  onDelete,
}: PersonalityCardProps) => {
  // Implementation here
};
```

### Component Structure

Using shadcn/ui Card components:

```tsx
<Card>
  <CardHeader>
    <CardTitle>{personality.name}</CardTitle>
    <CardDescription>
      {behaviorCount} behaviors • {customInstructionsPreview}
    </CardDescription>
  </CardHeader>
  <CardContent>{/* Big Five traits summary */}</CardContent>
  <CardFooter>
    <Button variant="outline" size="sm" onClick={handleEdit}>
      <Pencil className="h-4 w-4" />
      Edit
    </Button>
    <Button variant="outline" size="sm" onClick={handleDelete}>
      <Trash className="h-4 w-4" />
      Delete
    </Button>
  </CardFooter>
</Card>
```

### Display Requirements

- **Name**: Prominent personality name in CardTitle
- **Behavior Count**: Show count of defined behaviors
- **Custom Instructions**: Preview (truncated to ~50 chars with ellipsis)
- **Big Five Traits**: Show trait averages or key traits summary
- **Action Buttons**: Edit (Pencil icon) and Delete (Trash icon)

### Visual Requirements

- Cards match Role cards in size and style
- Consistent icon usage (lucide-react icons)
- Proper text truncation with ellipsis
- Action buttons aligned consistently
- Hover states on action buttons
- Card uses consistent padding and shadows

### Behavior Calculation

- Count total number of behavior traits defined in personality.behaviors
- Show as "{count} behaviors" in description

### Big Five Display

Show either:

- Option A: Average of all five traits as "Avg: {value}%"
- Option B: Top 2 highest traits with values
- Option C: Simple trait indicators (High/Medium/Low for key traits)

### Acceptance Criteria

- [ ] Displays personality name prominently
- [ ] Shows behavior count correctly
- [ ] Custom instructions preview truncates appropriately
- [ ] Big Five traits summary is informative
- [ ] Edit button triggers onEdit with personality data
- [ ] Delete button triggers onDelete with personality data
- [ ] Card styling matches Role cards
- [ ] Hover states work on action buttons
- [ ] Text truncation works with ellipsis
- [ ] Icons render correctly from lucide-react

## Testing Requirements

- Unit tests for component rendering with personality data
- Test edit/delete button callbacks
- Test text truncation for long custom instructions
- Test behavior count calculation
- Test Big Five traits display
- Test hover states and accessibility

## Dependencies

- PersonalityViewModel type from @fishbowl-ai/ui-shared
- shadcn/ui Card components
- lucide-react icons (Pencil, Trash)
- Existing personality data structure

## Reference Implementation

Examine RoleCard component for visual consistency and follow similar patterns for styling and layout.

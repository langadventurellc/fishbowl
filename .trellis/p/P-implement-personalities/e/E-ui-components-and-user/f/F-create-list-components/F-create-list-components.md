---
id: F-create-list-components
title: Create List Components
status: done
priority: medium
parent: E-ui-components-and-user
prerequisites:
  - F-remove-tab-navigation-and
affectedFiles:
  apps/desktop/src/components/settings/personalities/EmptyState.tsx:
    Created new EmptyState component following app patterns with Users icon,
    clear messaging, and create button
  apps/desktop/src/components/settings/personalities/index.ts:
    Added EmptyState export to personalities module; Added exports for
    PersonalitiesList and PersonalityCard components to complete the barrel
    exports
  apps/desktop/src/components/settings/personalities/__tests__/EmptyState.test.tsx:
    Created comprehensive unit tests covering rendering, interactions,
    accessibility, and responsive behavior
  packages/ui-shared/src/types/settings/PersonalityCardProps.ts:
    Updated interface to use PersonalityViewModel and onDelete instead of
    onClone callback
  packages/ui-shared/src/types/settings/SavedPersonalitiesTabProps.ts:
    Updated interface to use PersonalityViewModel and onDelete instead of
    onClone callback
  apps/desktop/src/components/settings/personalities/PersonalityCard.tsx:
    Completely restructured component with CardDescription for behavior count
    and custom instructions preview, CardContent for Big Five traits, and
    CardFooter for Edit/Delete buttons
  apps/desktop/src/components/settings/personalities/SavedPersonalitiesTab.tsx: Updated to use new interface with onDelete instead of onClone
  apps/desktop/src/components/settings/personalities/__tests__/PersonalityCard.test.tsx:
    Updated all tests to match new component structure and added tests for
    behavior count calculation, custom instructions truncation, and empty state
    handling
  apps/desktop/src/components/settings/personalities/PersonalitiesList.tsx:
    Created new PersonalitiesList container component with responsive grid
    layout, empty state handling, loading state support, and proper
    accessibility features
  apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx:
    Updated to import PersonalitiesList component, added mock personality data
    with realistic test cases, adapted existing handlers (handleEditPersonality,
    handleDeletePersonality) for list integration, and integrated
    PersonalitiesList component alongside existing content with proper layout
    and spacing
  apps/desktop/src/components/settings/personalities/__tests__/PersonalitiesSection.test.tsx:
    Added comprehensive test suite for PersonalitiesList integration including
    tests for mock data rendering, personality card display, edit/delete button
    functionality, Big Five traits display, and dual content area layout. Fixed
    store mocking to properly handle Zustand selectors and ensured all 23 tests
    pass
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-emptystate-component
  - T-create-personalitieslist
  - T-create-personalitycard
  - T-update-personalitiessection
created: 2025-08-17T14:17:05.414Z
updated: 2025-08-17T14:17:05.414Z
---

# Create PersonalitiesList and PersonalityCard Components

## Purpose and Goals

Create the new list view components that display all personalities in a unified interface. This includes the PersonalitiesList container, individual PersonalityCard components, and an EmptyState component for when no personalities exist.

## Key Components to Implement

### PersonalitiesList Component

- Grid/list container for personality cards
- Handles empty state rendering
- Accepts personalities array, onEdit, and onDelete callbacks
- Responsive layout with proper spacing

### PersonalityCard Component

- Displays individual personality information
- Shows name, Big Five traits summary, behavior count
- Includes Edit and Delete action buttons
- Uses Card component from shadcn/ui
- Matches RoleCard visual design

### EmptyState Component

- Helpful message when no personalities exist
- Prominent "Create your first personality" call-to-action
- Icon and descriptive text
- Follows app's empty state patterns

## Detailed Acceptance Criteria

### PersonalitiesList Requirements

- [ ] Renders grid of PersonalityCard components
- [ ] Shows EmptyState when personalities array is empty
- [ ] Passes edit/delete handlers to cards
- [ ] Uses responsive grid (1 column mobile, 2 columns tablet, 3 columns desktop)
- [ ] Proper spacing between cards (gap-4)
- [ ] Handles loading state appropriately

### PersonalityCard Requirements

- [ ] Displays personality name prominently
- [ ] Shows Big Five trait averages or key traits
- [ ] Displays behavior trait count
- [ ] Custom instructions preview (truncated)
- [ ] Edit button with Pencil icon
- [ ] Delete button with Trash icon
- [ ] Hover states on action buttons
- [ ] Card uses consistent padding and shadows

### EmptyState Requirements

- [ ] Clear message: "No personalities yet"
- [ ] Helpful subtext explaining personalities purpose
- [ ] Large, prominent create button
- [ ] Uses muted colors for text
- [ ] Centers content appropriately
- [ ] Matches other empty states in app

### Visual Requirements

- [ ] Cards match Role cards in size and style
- [ ] Consistent icon usage (lucide-react icons)
- [ ] Proper text truncation with ellipsis
- [ ] Action buttons aligned consistently
- [ ] Responsive breakpoints work correctly

## Implementation Guidance

### PersonalitiesList Structure

```tsx
export const PersonalitiesList = ({
  personalities,
  onEdit,
  onDelete,
  onCreateClick,
}) => {
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
};
```

### PersonalityCard Structure

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

## Testing Requirements

- List renders correct number of cards
- Empty state shows when no personalities
- Edit/Delete buttons trigger callbacks
- Cards display all personality data
- Responsive layout adjusts properly
- Text truncation works correctly

## Dependencies

- **F-remove-tab-navigation-and**: Requires restructured PersonalitiesSection to integrate into

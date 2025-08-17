---
id: T-update-personalitiessection
title: Update PersonalitiesSection to integrate list components
status: open
priority: medium
parent: F-create-list-components
prerequisites:
  - T-create-personalitieslist
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T15:05:03.288Z
updated: 2025-08-17T15:05:03.288Z
---

# Update PersonalitiesSection to Integrate List Components

## Context

Update the existing PersonalitiesSection component to use the new PersonalitiesList component, preparing for the eventual removal of tab navigation and integration with the personality store.

## Implementation Requirements

### Component Location

- File: `apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx`
- Update existing component

### Integration Steps

1. **Import New Components**

   ```tsx
   import { PersonalitiesList } from "./PersonalitiesList";
   ```

2. **Add PersonalitiesList Integration**
   - Add PersonalitiesList to the component alongside existing tab structure
   - Create placeholder handlers for onEdit, onDelete, onCreateClick
   - Use mock data or empty array for initial testing

3. **Mock Data Setup** (for testing)

   ```tsx
   const mockPersonalities: PersonalityViewModel[] = [
     // Add 2-3 sample personalities for testing display
   ];
   ```

4. **Placeholder Handlers**

   ```tsx
   const handleEdit = (personality: PersonalityViewModel) => {
     console.log("Edit personality:", personality.name);
     // TODO: Will connect to store in future task
   };

   const handleDelete = (personality: PersonalityViewModel) => {
     console.log("Delete personality:", personality.name);
     // TODO: Will connect to store in future task
   };

   const handleCreateClick = () => {
     console.log("Create new personality");
     // TODO: Will connect to form in future task
   };
   ```

### Layout Integration

- **Conditional Rendering**: Show PersonalitiesList alongside existing tabs for now
- **Styling**: Ensure list integrates well with existing section layout
- **Spacing**: Maintain consistent spacing with other settings sections

### Visual Testing

Add the PersonalitiesList below or above the existing tab content:

```tsx
<div className="space-y-6">
  {/* New List Component for testing */}
  <div>
    <h3 className="text-lg font-medium mb-4">Personalities List (Preview)</h3>
    <PersonalitiesList
      personalities={mockPersonalities}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreateClick={handleCreateClick}
    />
  </div>

  {/* Existing tab content remains for now */}
  {/* ... existing code ... */}
</div>
```

### Mock Data Requirements

Create 2-3 realistic personality objects:

- Include all required PersonalityViewModel fields
- Vary the data to test different display scenarios
- Include personalities with different trait values and behavior counts
- Test long custom instructions for truncation

### Acceptance Criteria

- [ ] PersonalitiesList component renders in PersonalitiesSection
- [ ] Mock personality data displays correctly in cards
- [ ] Edit/Delete button clicks log to console
- [ ] Create button click logs to console
- [ ] List integrates visually with existing section
- [ ] Empty state shows when using empty array
- [ ] No TypeScript or linting errors
- [ ] Component maintains existing functionality
- [ ] Mock data represents realistic personality scenarios

## Testing Requirements

- Unit tests for PersonalitiesSection with new list integration
- Test mock data rendering
- Test placeholder handler calls
- Test empty state rendering
- Test that existing functionality remains intact
- Visual regression tests to ensure styling consistency

## Dependencies

- PersonalitiesList component (prerequisite)
- PersonalityViewModel type from @fishbowl-ai/ui-shared
- Existing PersonalitiesSection component structure

## Notes

- This task is a safe integration step that doesn't break existing functionality
- The tab removal and store connection will happen in future tasks
- Focus on visual integration and basic functionality testing
- Mock data helps validate the list components work correctly

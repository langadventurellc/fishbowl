---
id: T-restructure-layout-with
title: Restructure Layout with Header and Create Button
status: done
priority: medium
parent: F-remove-tab-navigation-and
prerequisites:
  - T-add-store-integration-and
affectedFiles:
  apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx:
    Restructured component layout with new header design, create button, modal
    handlers, and content area structure matching RolesSection pattern
  apps/desktop/src/components/settings/personalities/__tests__/PersonalitiesSection.test.tsx:
    Created comprehensive test suite covering header layout, button
    functionality, component structure, accessibility, and layout implementation
    verification
log:
  - >-
    Successfully restructured PersonalitiesSection layout with header and create
    button functionality. 


    Key accomplishments:

    - Updated header to use h2 with proper typography (text-3xl font-bold
    tracking-tight)

    - Added flex layout with justify-between for header positioning

    - Implemented "Create Personality" button with Plus icon and proper styling

    - Added modal handler functions for future features
    (handleCreatePersonality, handleEditPersonality, handleDeletePersonality)

    - Structured content area with min-height and empty state support

    - Added className prop support for component flexibility

    - Maintained loading and error state handling with updated header layout

    - Comprehensive test coverage verifying all layout requirements


    The component now matches the RolesSection pattern and is ready for the next
    feature (personality list implementation).
schema: v1.0
childrenIds: []
created: 2025-08-17T14:29:08.039Z
updated: 2025-08-17T14:29:08.039Z
---

# Restructure Layout with Header and Create Button

## Context

With store integration complete, this task restructures the layout to match the RolesSection pattern. This includes updating the header typography, adding the "Create New Personality" button, and preparing the content area for the list component (to be added in the next feature).

**File Location**: `apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx`

**Reference Pattern**: Mirror the layout structure from `apps/desktop/src/components/settings/roles/RolesSection.tsx` lines 280-320

## Specific Implementation Requirements

### Update Header Section

Change header to match RolesSection typography and spacing:

```tsx
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-3xl font-bold tracking-tight">Personalities</h2>
    <p className="text-muted-foreground">
      Manage agent personalities and their characteristics.
    </p>
  </div>
  <Button onClick={handleCreatePersonality} className="gap-2">
    <Plus className="h-4 w-4" />
    Create Personality
  </Button>
</div>
```

### Add Required Imports

Add imports for UI components and icons:

```tsx
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCallback } from "react";
```

### Add Modal Handler Functions

Add placeholder handler functions that will be used by future features:

```tsx
// Modal opening handlers - will connect to modals in future features
const handleCreatePersonality = useCallback(() => {
  logger.info("Create personality button clicked");
  setFormMode("create");
  setSelectedPersonality(undefined);
  setDeleteDialogOpen(false);
  setFormModalOpen(true);
}, []);

const handleEditPersonality = useCallback(
  (personality: PersonalityViewModel) => {
    logger.info("Edit personality requested", {
      personalityId: personality.id,
      personalityName: personality.name,
    });
    setFormMode("edit");
    setSelectedPersonality(personality);
    setDeleteDialogOpen(false);
    setFormModalOpen(true);
  },
  [],
);

const handleDeletePersonality = useCallback(
  (personality: PersonalityViewModel) => {
    logger.info("Delete personality requested", {
      personalityId: personality.id,
      personalityName: personality.name,
    });
    setSelectedPersonality(personality);
    setFormModalOpen(false);
    setDeleteDialogOpen(true);
  },
  [],
);
```

### Content Area Structure

Add content area that will hold the list component in the next feature:

```tsx
<div className="space-y-6">
  {/* Header section with create button */}
  <div className="flex items-center justify-between">
    {/* Header content */}
  </div>

  {/* Content area - will hold PersonalitiesList in next feature */}
  <div className="min-h-[400px]">
    {personalities.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-center">
          No personalities yet
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
          Create your first personality to define unique agent behaviors and
          characteristics
        </p>
        <Button onClick={handleCreatePersonality} className="gap-2">
          <Plus className="h-4 w-4" />
          Create First Personality
        </Button>
      </div>
    ) : (
      <div className="text-center py-8 text-muted-foreground">
        Personality list will be implemented in next feature
      </div>
    )}
  </div>
</div>
```

### Add Container Props

Add className prop support like RolesSection:

```tsx
interface PersonalitiesSectionProps {
  className?: string;
}

const PersonalitiesSection: React.FC<PersonalitiesSectionProps> = ({
  className,
}) => {
  // Component implementation

  return <div className={cn("space-y-6 p-6", className)}>{/* Content */}</div>;
};
```

## Detailed Acceptance Criteria

### Header Layout

- [ ] Header uses flex layout with space-between for title and button
- [ ] Title uses h2 with "text-3xl font-bold tracking-tight" classes
- [ ] Description uses "text-muted-foreground" class
- [ ] Create button positioned on the right side of header
- [ ] Button includes Plus icon and "Create Personality" text

### Create Button Functionality

- [ ] Create button calls handleCreatePersonality when clicked
- [ ] Button uses proper styling (gap-2 class)
- [ ] Plus icon displays correctly (h-4 w-4 size)
- [ ] Button handler logs click event
- [ ] Handler sets correct modal state variables

### Empty State

- [ ] Empty state displays when personalities array is empty
- [ ] Shows centered layout with icon, title, description, and button
- [ ] Uses muted background circle with Plus icon
- [ ] "Create First Personality" button triggers same handler
- [ ] Text content matches personalities context

### Content Area Structure

- [ ] Content area has min-height for consistent layout
- [ ] Container uses space-y-6 for vertical spacing
- [ ] Container includes p-6 padding
- [ ] Placeholder text shows when personalities exist (temporary)

### Props and Styling

- [ ] Component accepts className prop
- [ ] Uses cn() utility for conditional classes
- [ ] Proper TypeScript interface for props
- [ ] All imports properly organized

## Implementation Guidance

1. **Start with imports**: Add Button, Plus icon, and useCallback imports
2. **Update header structure**: Change from h1 to h2 and add flex layout
3. **Add create button**: Position button in header with proper styling
4. **Add handler functions**: Create placeholder handlers for future modal integration
5. **Structure content area**: Add empty state and placeholder for list
6. **Add props interface**: Make component flexible with className prop
7. **Test visually**: Ensure layout matches RolesSection appearance

## Testing Requirements

### Visual Testing

- Header layout matches RolesSection appearance
- Create button displays and positions correctly
- Empty state renders with proper spacing and content
- Button hovers and clicks work properly
- Icons display at correct sizes

### Functional Testing

- Create button click triggers handler
- Handler logs correctly to console
- Modal state variables update correctly
- Empty state vs placeholder content displays correctly

### Unit Test Requirements

- Test component renders with header and button
- Test create button click calls handler
- Test empty state displays when no personalities
- Test placeholder displays when personalities exist
- Mock personalities array for different states

## Security Considerations

- Button handlers only log non-sensitive information
- No user input validation needed at this stage
- Ensure proper event handling without XSS risks

## Dependencies

- **T-add-store-integration-and**: Requires store connection and state variables
- **Button component**: Must exist in ui component library
- **Plus icon**: Must exist in lucide-react library

## Estimated Time

1.5-2 hours including layout implementation and testing

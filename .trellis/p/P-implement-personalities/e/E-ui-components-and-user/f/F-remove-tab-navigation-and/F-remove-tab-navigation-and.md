---
id: F-remove-tab-navigation-and
title: Remove Tab Navigation and Restructure
status: done
priority: medium
parent: E-ui-components-and-user
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx:
    Removed tab component imports and usage, eliminated handler functions,
    simplified JSX structure to clean foundation with placeholder content area;
    Added complete store integration with usePersonalitiesStore hook, modal
    state management variables, loading state handling, and comprehensive error
    state display with retry functionality following RolesSection pattern;
    Restructured component layout with new header design, create button, modal
    handlers, and content area structure matching RolesSection pattern
  apps/desktop/src/components/settings/personalities/__tests__/PersonalitiesSection.test.tsx:
    Created comprehensive test suite covering header layout, button
    functionality, component structure, accessibility, and layout implementation
    verification
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-add-store-integration-and
  - T-remove-tab-components-and
  - T-restructure-layout-with
created: 2025-08-17T14:15:36.190Z
updated: 2025-08-17T14:15:36.190Z
---

# Remove Tab Navigation and Restructure PersonalitiesSection

## Purpose and Goals

Remove the existing tab-based navigation from PersonalitiesSection and restructure it to match the Roles section's single-screen layout pattern. This establishes the foundation for the unified personalities management interface.

## Key Components to Implement

### Structural Changes

- Remove `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` components from PersonalitiesSection
- Remove imports for `SavedPersonalitiesTab` and `CreatePersonalityForm` components
- Restructure component to single-screen layout matching RolesSection structure
- Add container divs with proper spacing and layout classes

### New Component Structure

```tsx
PersonalitiesSection
├── Header Section (title, description, create button)
├── Content Area (will hold list in next feature)
└── Modal/Dialog containers (for forms)
```

### State Management Setup

- Add local state for `formModalOpen`, `deleteDialogOpen`, `formMode`
- Add state for `selectedPersonality` to track editing target
- Connect to `usePersonalitiesStore` hook for data access
- Remove any remaining tab-related state

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] All tab navigation components completely removed
- [ ] Single-screen layout structure established
- [ ] Header section with title and description present
- [ ] "Create New Personality" button positioned like Roles section
- [ ] Component connects to personalities store
- [ ] Proper loading and error states from store
- [ ] Empty state placeholder ready for next feature

### Visual Requirements

- [ ] Layout matches Roles section spacing (p-6 container)
- [ ] Header uses same typography (h2 for title, text-muted-foreground for description)
- [ ] Create button uses same styling (primary variant, plus icon)
- [ ] Responsive grid layout prepared for list
- [ ] Consistent use of Card components where appropriate

### Code Quality

- [ ] TypeScript types properly defined
- [ ] No unused imports remaining
- [ ] Component follows existing patterns
- [ ] Proper error boundary handling

## Implementation Guidance

Follow the RolesSection pattern:

1. Use similar container structure with `space-y-6`
2. Place create button in header section with Plus icon
3. Use `cn()` utility for conditional classes
4. Prepare modal state management for form/delete dialogs
5. Connect to store but don't implement full CRUD yet

## Testing Requirements

- Component renders without tabs
- Create button is visible and clickable
- Store connection established
- Loading states display correctly
- Layout matches Roles section visually

## Dependencies

None - this is the foundational refactoring feature

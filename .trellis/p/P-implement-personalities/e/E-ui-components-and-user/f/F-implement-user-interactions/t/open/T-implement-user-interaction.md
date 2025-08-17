---
id: T-implement-user-interaction
title: Implement user interaction handlers and modal state management
status: open
priority: high
parent: F-implement-user-interactions
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T18:48:06.074Z
updated: 2025-08-17T18:48:06.074Z
---

# Implement User Interaction Handlers Following Roles Pattern

## Context

Create the core interaction logic that handles create, edit, and delete operations for personalities. This must exactly follow the established patterns from the roles section to ensure consistency across the application.

## Implementation Requirements

### State Management

Add state variables following the exact pattern from RolesSection:

```tsx
const [selectedPersonality, setSelectedPersonality] = useState<
  PersonalityViewModel | undefined
>(undefined);
const [formModalOpen, setFormModalOpen] = useState(false);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [formMode, setFormMode] = useState<"create" | "edit">("create");
```

### Handler Functions

Implement these core handlers following the exact patterns from RolesSection:

1. **handleCreatePersonality** - Opens form modal in create mode
2. **handleEditPersonality** - Opens form modal with selected personality data
3. **handleDeletePersonality** - Opens delete confirmation dialog
4. **handleSavePersonality** - Processes form submission for create/edit
5. **handleConfirmDelete** - Executes personality deletion

### Handler Implementation Patterns

**Create Handler (match RolesSection exactly):**

```tsx
const handleCreatePersonality = useCallback(() => {
  logger.info("Opening create personality modal");
  setFormMode("create");
  setSelectedPersonality(undefined);
  setDeleteDialogOpen(false); // Ensure only one modal open
  setFormModalOpen(true);
}, []);
```

**Edit Handler (match RolesSection exactly):**

```tsx
const handleEditPersonality = useCallback(
  (personality: PersonalityViewModel) => {
    logger.info("Opening edit personality modal", {
      personalityId: personality.id,
      personalityName: personality.name,
    });
    setFormMode("edit");
    setSelectedPersonality(personality);
    setDeleteDialogOpen(false); // Ensure only one modal open
    setFormModalOpen(true);
  },
  [],
);
```

**Delete Handler (match RolesSection exactly):**

```tsx
const handleDeletePersonality = useCallback(
  (personality: PersonalityViewModel) => {
    logger.info("Opening delete confirmation dialog", {
      personalityId: personality.id,
      personalityName: personality.name,
    });
    setSelectedPersonality(personality);
    setFormModalOpen(false); // Ensure only one modal open
    setDeleteDialogOpen(true);
  },
  [],
);
```

### Store Integration

- Connect to personalities store actions (createPersonality, updatePersonality, deletePersonality)
- Use store loading/error states appropriately
- Follow exact error handling patterns from RolesSection
- Use same logging patterns and performance measurement

### Component Integration

**Modal Integration (match RolesSection exactly):**

```tsx
{
  /* Personality creation/editing modal */
}
<PersonalityFormModal
  isOpen={formModalOpen}
  onOpenChange={setFormModalOpen}
  mode={formMode}
  personality={selectedPersonality}
  onSave={handleSavePersonality}
  isLoading={isSaving}
/>;

{
  /* Personality deletion confirmation dialog */
}
<DeletePersonalityDialog
  isOpen={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  personality={selectedPersonality || null}
  onConfirm={handleConfirmDelete}
  isLoading={isSaving}
/>;
```

## Technical Approach

1. **Copy State Management Pattern** from RolesSection
2. **Copy Handler Implementations** from RolesSection with personality-specific adaptations
3. **Use Same Store Integration Pattern** as RolesSection
4. **Follow Exact Logging Patterns** including performance measurement
5. **Handle Loading States** exactly like RolesSection

## Acceptance Criteria

### State Management

- [ ] State variables match RolesSection pattern exactly
- [ ] Modal state properly tracks open/closed
- [ ] Form mode correctly switches between create/edit
- [ ] Selected personality properly set for edit/delete operations
- [ ] State resets appropriately after operations

### Handler Functions

- [ ] All handlers follow exact RolesSection patterns
- [ ] Logging includes same level of detail as roles
- [ ] Error handling matches roles implementation
- [ ] Performance measurement included where appropriate
- [ ] Modal mutual exclusion logic implemented

### Store Integration

- [ ] Store actions called correctly (createPersonality, updatePersonality, deletePersonality)
- [ ] Loading states used from store (isSaving, isLoading)
- [ ] Error handling follows roles patterns
- [ ] Success/error feedback implemented

### Component Integration

- [ ] PersonalityFormModal receives correct props following roles pattern
- [ ] DeletePersonalityDialog receives correct props following roles pattern
- [ ] Prop names match established patterns (isOpen, isLoading, etc.)

## Testing Requirements

- Test all handler functions trigger correct state changes
- Test modal state transitions work properly
- Test form mode switches correctly
- Test store integration for create/update/delete
- Test success and error scenarios
- Test logging output matches roles patterns

## Dependencies

- personalities store with createPersonality, updatePersonality, deletePersonality actions
- PersonalityViewModel and PersonalityFormData types
- PersonalityFormModal component (already exists and follows correct pattern)
- DeletePersonalityDialog component (needs to be updated to follow correct pattern)
- Logger utility from @fishbowl-ai/shared

## Files to Modify

- Update: `apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx`
- Add unit tests for handler functions
- Integration tests for complete user flows

## Prerequisites

- DeletePersonalityDialog must be updated to use correct props (T-create-deletepersonalitydialog)

## Priority

**HIGH** - Core functionality needed for user interactions

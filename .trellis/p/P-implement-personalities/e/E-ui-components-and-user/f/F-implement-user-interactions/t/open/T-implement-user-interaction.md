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

# Implement User Interaction Handlers

## Context

Create the core interaction logic that handles create, edit, and delete operations for personalities. This includes state management for modals, form submission handling, and integration with the personalities store following the handler patterns specified in the feature requirements.

## Implementation Requirements

### State Management

Add state variables to track:

- Form modal open/closed state
- Delete dialog open/closed state
- Form mode (create vs edit)
- Selected personality for edit/delete
- Loading states for async operations

### Handler Functions

Implement these core handlers following the feature specification patterns:

1. **handleCreatePersonality** - Opens form modal in create mode
2. **handleEditPersonality** - Opens form modal with selected personality data
3. **handleDeletePersonality** - Opens delete confirmation dialog
4. **handleSavePersonality** - Processes form submission for create/edit
5. **handleConfirmDelete** - Executes personality deletion

### Integration Points

- Connect to personalities store actions (createPersonality, updatePersonality, deletePersonality)
- Use store loading/error states appropriately
- Handle success/error feedback with toast notifications
- Manage modal state transitions properly

## Technical Approach

1. Add state management to PersonalitiesSection:

   ```tsx
   const [formModalOpen, setFormModalOpen] = useState(false);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [formMode, setFormMode] = useState<"create" | "edit">("create");
   const [selectedPersonality, setSelectedPersonality] =
     useState<PersonalityViewModel>();
   ```

2. Implement handlers following feature specification:

   ```tsx
   const handleCreatePersonality = () => {
     setFormMode("create");
     setSelectedPersonality(undefined);
     setFormModalOpen(true);
   };

   const handleEditPersonality = (personality: PersonalityViewModel) => {
     setFormMode("edit");
     setSelectedPersonality(personality);
     setFormModalOpen(true);
   };

   const handleSavePersonality = async (data: PersonalityFormData) => {
     try {
       if (formMode === "create") {
         await createPersonality(data);
       } else {
         await updatePersonality(selectedPersonality.id, data);
       }
       setFormModalOpen(false);
       toast.success(
         `Personality ${formMode === "create" ? "created" : "updated"}`,
       );
     } catch (error) {
       toast.error(error.message);
     }
   };
   ```

3. Handle loading states from store
4. Implement proper error handling and success feedback

## Acceptance Criteria

### State Management

- [ ] Form modal state properly tracks open/closed
- [ ] Delete dialog state properly tracks open/closed
- [ ] Form mode correctly switches between create/edit
- [ ] Selected personality properly set for edit/delete operations
- [ ] State resets appropriately after operations

### Create Flow

- [ ] Create button opens form modal in create mode
- [ ] Form renders empty for new personality
- [ ] Save creates new personality via store action
- [ ] Success closes modal and shows success toast
- [ ] Error keeps modal open and shows error toast

### Edit Flow

- [ ] Edit button opens form modal in edit mode
- [ ] Form pre-populates with selected personality data
- [ ] Save updates existing personality via store action
- [ ] Success closes modal and shows success toast
- [ ] Error keeps modal open and shows error toast

### Delete Flow

- [ ] Delete button opens confirmation dialog
- [ ] Dialog shows correct personality name
- [ ] Confirm executes deletion via store action
- [ ] Success closes dialog and shows success toast
- [ ] Error shows error toast but may close dialog

### Error Handling

- [ ] All store errors properly caught and displayed
- [ ] Toast notifications show appropriate messages
- [ ] Loading states prevent duplicate operations
- [ ] Network errors handled gracefully

## Testing Requirements

- Test all handler functions trigger correct state changes
- Test modal state transitions work properly
- Test form mode switches correctly
- Test store integration for create/update/delete
- Test success and error scenarios
- Test toast notifications appear correctly
- Test loading state management

## Dependencies

- personalities store with createPersonality, updatePersonality, deletePersonality actions
- PersonalityViewModel and PersonalityFormData types
- Toast notification system
- React state management (useState)

## Files to Modify

- Update: `apps/desktop/src/renderer/components/personalities/PersonalitiesSection.tsx`
- Add unit tests for handler functions
- Integration tests for complete user flows

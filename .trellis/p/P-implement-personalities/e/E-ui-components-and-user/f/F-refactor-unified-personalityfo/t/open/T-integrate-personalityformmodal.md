---
id: T-integrate-personalityformmodal
title: Integrate PersonalityFormModal into PersonalitiesSection
status: open
priority: medium
parent: F-refactor-unified-personalityfo
prerequisites:
  - T-create-personalityformmodal
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T15:59:03.839Z
updated: 2025-08-17T15:59:03.839Z
---

# Integrate PersonalityFormModal into PersonalitiesSection

## Context

Update PersonalitiesSection to use the new PersonalityFormModal instead of placeholder handlers, connecting the form to store operations and completing the unified personality management workflow.

## Acceptance Criteria

### Import and Setup

- [ ] Import `PersonalityFormModal` component
- [ ] Import `PersonalityFormModalProps` types
- [ ] Remove any old CreatePersonalityForm imports
- [ ] Update component imports to use new PersonalityForm names

### Store Integration

- [ ] Connect `createPersonality` store action to form save
- [ ] Connect `updatePersonality` store action to form save
- [ ] Pass store loading states to modal component
- [ ] Handle store errors appropriately in form operations

### Modal State Management

- [ ] Use existing modal state variables (`formModalOpen`, `formMode`, `selectedPersonality`)
- [ ] Connect create button handler to open modal in create mode
- [ ] Connect edit handlers to open modal in edit mode
- [ ] Connect cancel handlers to close modal

### Form Operation Handlers

- [ ] Implement `handleFormSave` callback for PersonalityFormModal
- [ ] Route create vs edit operations to appropriate store actions
- [ ] Handle successful save operations (close modal, clear selection)
- [ ] Handle save errors with appropriate user feedback
- [ ] Implement `handleFormCancel` to close modal

### Modal Integration

- [ ] Add PersonalityFormModal component to JSX
- [ ] Pass `isOpen={formModalOpen}` prop
- [ ] Pass `onOpenChange={setFormModalOpen}` prop
- [ ] Pass `mode={formMode}` prop
- [ ] Pass `personality={selectedPersonality}` for edit mode
- [ ] Pass `onSave={handleFormSave}` callback
- [ ] Pass `isLoading={isSaving}` from store

### Error Handling

- [ ] Display form submission errors to user
- [ ] Handle network errors gracefully
- [ ] Provide retry mechanisms for failed operations
- [ ] Clear errors on successful operations
- [ ] Use logger for error reporting

### User Experience

- [ ] Show loading states during save operations
- [ ] Disable form interactions while saving
- [ ] Provide success feedback on save completion
- [ ] Clear form selection state after successful operations
- [ ] Maintain focus management during modal operations

### Testing Requirements

- [ ] Test create personality flow end-to-end
- [ ] Test edit personality flow end-to-end
- [ ] Test modal open/close behavior
- [ ] Test error handling scenarios
- [ ] Test loading state management
- [ ] Verify store integration works correctly

## Implementation Details

### Save Handler Implementation

```typescript
const handleFormSave = useCallback(
  async (data: PersonalityFormData) => {
    try {
      if (formMode === "create") {
        await createPersonality(data);
      } else if (selectedPersonality) {
        await updatePersonality(selectedPersonality.id, data);
      }
      // Modal will close automatically on success
      setSelectedPersonality(undefined);
    } catch (error) {
      // Error handling - modal stays open for retry
      logger.error("Failed to save personality", error as Error);
    }
  },
  [formMode, selectedPersonality, createPersonality, updatePersonality],
);
```

### Modal Props Configuration

```typescript
<PersonalityFormModal
  isOpen={formModalOpen}
  onOpenChange={setFormModalOpen}
  mode={formMode}
  personality={selectedPersonality}
  onSave={handleFormSave}
  isLoading={isSaving}
/>
```

## Files to Modify

- `apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx`

## Success Criteria

- [ ] Create button opens modal in create mode
- [ ] Edit actions open modal in edit mode with pre-populated data
- [ ] Form submissions create/update personalities in store
- [ ] Modal closes on successful save
- [ ] Unsaved changes protection works correctly
- [ ] Error states display appropriately
- [ ] Loading states prevent duplicate operations

## Reference Implementation

Follow the pattern established in RolesSection for modal integration and store connectivity.

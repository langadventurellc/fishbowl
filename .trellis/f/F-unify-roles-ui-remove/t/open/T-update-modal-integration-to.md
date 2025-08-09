---
id: T-update-modal-integration-to
title: Update modal integration to maintain structure but disable functionality
status: open
priority: medium
parent: F-unify-roles-ui-remove
prerequisites:
  - T-implement-unified-roles-list
  - T-refactor-rolessection
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T04:00:17.056Z
updated: 2025-08-09T04:00:17.056Z
---

# Update Modal Integration to Maintain Structure but Disable Functionality

## Context

This task ensures that RoleFormModal and RoleDeleteDialog remain integrated with the unified roles interface but have their functionality properly disabled. The modals should still appear when buttons are clicked (for UI consistency testing) but should not perform any actual CRUD operations.

## Reference Files

- `/apps/desktop/src/components/settings/roles/RoleFormModal.tsx` - Form modal component
- `/apps/desktop/src/components/settings/roles/RoleDeleteDialog.tsx` - Delete confirmation dialog
- `/apps/desktop/src/components/settings/roles/RolesSection.tsx` - Parent component with modal state

## Current Modal Behavior

Currently the modals:

- Handle real CRUD operations via useCustomRoles hook
- Manage form state and validation
- Show loading states during API calls
- Display success/error feedback

## Target Modal Behavior

The modals should:

- Open and close normally when triggered
- Display the correct role data (for Edit modal)
- Show proper form fields and validation
- **NOT** perform any actual save/delete operations
- Show placeholder/disabled states for action buttons
- Provide user feedback that functionality is coming soon

## Implementation Requirements

### 1. Update RoleFormModal Integration

**File**: `/apps/desktop/src/components/settings/roles/RolesSection.tsx`

**Modal state management**:

```typescript
const handleCreateRole = useCallback(() => {
  setFormMode("create");
  setSelectedRole(undefined);
  setDeleteDialogOpen(false); // Ensure only one modal open
  setFormModalOpen(true);
}, []);

const handleEditRole = useCallback((role: CustomRoleViewModel) => {
  setFormMode("edit");
  setSelectedRole(role);
  setDeleteDialogOpen(false); // Ensure only one modal open
  setFormModalOpen(true);
}, []);

const handleSaveRole = useCallback(async (data: RoleFormData) => {
  // Disabled functionality - show placeholder behavior
  console.log("Save role clicked (not implemented):", data);

  // Simulate success behavior
  setTimeout(() => {
    setFormModalOpen(false);
    setSelectedRole(undefined);
    // TODO: Show toast notification that feature is coming soon
  }, 500);
}, []);
```

### 2. Update RoleDeleteDialog Integration

```typescript
const handleDeleteRole = useCallback((role: CustomRoleViewModel) => {
  setSelectedRole(role);
  setFormModalOpen(false); // Ensure only one modal open
  setDeleteDialogOpen(true);
}, []);

const handleConfirmDelete = useCallback(async (role: CustomRoleViewModel) => {
  // Disabled functionality - show placeholder behavior
  console.log("Delete role clicked (not implemented):", role);

  // Simulate success behavior
  setTimeout(() => {
    setDeleteDialogOpen(false);
    setSelectedRole(undefined);
    // TODO: Show toast notification that feature is coming soon
  }, 500);
}, []);
```

### 3. Modal Prop Configuration

**RoleFormModal props**:

```typescript
<RoleFormModal
  isOpen={formModalOpen}
  onOpenChange={setFormModalOpen}
  mode={formMode}
  role={selectedRole}
  onSave={handleSaveRole}
  isLoading={false} // Always false for disabled functionality
/>
```

**RoleDeleteDialog props**:

```typescript
<RoleDeleteDialog
  isOpen={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  role={selectedRole || null}
  onConfirm={handleConfirmDelete}
  isLoading={false} // Always false for disabled functionality
/>
```

### 4. Add User Feedback for Disabled Features

**Optional Enhancement**: Add subtle UI indicators that features are coming soon

**In RoleFormModal**:

- Add small text in modal footer: "Full role editing coming soon"
- Consider disabled state styling for save button

**In RoleDeleteDialog**:

- Add small text in dialog: "Role management features coming soon"
- Consider disabled state styling for delete button

### 5. Preserve Modal Validation and Form State

**Keep working**:

- Form field validation (name, description requirements)
- Form state management
- Modal open/close animations
- Proper focus management
- Keyboard navigation (Escape to close, etc.)

**Disable**:

- Actual API calls
- Loading states
- Success/error notifications from real operations
- Data persistence

## Acceptance Criteria

- [ ] Create button opens RoleFormModal in create mode
- [ ] Edit buttons open RoleFormModal with selected role data pre-filled
- [ ] Delete buttons open RoleDeleteDialog with selected role information
- [ ] Form validation still works in RoleFormModal
- [ ] Save button in modal appears to work but doesn't actually save
- [ ] Delete confirmation button appears to work but doesn't actually delete
- [ ] Modal close behavior works correctly (X button, Escape key, backdrop click)
- [ ] Only one modal opens at a time (proper state management)
- [ ] No console errors when opening/closing modals
- [ ] Modal animations and styling remain unchanged
- [ ] Selected role data properly passed to modals

## Testing Requirements

- **Unit Tests**: Update existing modal integration tests
  - Test modal opening/closing behavior
  - Verify correct role data passed to modals
  - Check that save/delete operations are properly disabled
  - Validate form state management
- **Integration Tests**:
  - Test Create button → RoleFormModal flow
  - Test Edit button → RoleFormModal with data flow
  - Test Delete button → RoleDeleteDialog flow
  - Test modal state exclusivity (only one open at a time)

## Dependencies

- **Prerequisites**:
  - T-implement-unified-roles-list (for Edit/Delete button handlers)
  - T-refactor-rolessection (for modal state management)
- **Components used**:
  - RoleFormModal (existing)
  - RoleDeleteDialog (existing)
  - Modal state hooks

## Security Considerations

- No actual data operations prevent accidental data changes
- Modal validation still prevents malformed data entry
- Console logging safe for development (should be removed in production)

## Implementation Notes

- **User Experience**: Modals should feel functional even though disabled
- **Future-proofing**: Easy to enable real functionality by replacing handlers
- **Debugging**: Console logs help verify button clicks during development
- **State management**: Preserve existing modal state patterns
- **Animation**: Keep all existing modal transitions and effects

## Future Implementation Preparation

This disabled modal integration prepares for:

- Real CRUD operations in future features
- Form validation and error handling
- Loading states and progress indicators
- Success/failure notifications
- Data persistence and synchronization

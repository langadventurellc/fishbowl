---
id: F-role-editing-functionality
title: Role Editing Functionality
status: in-progress
priority: medium
parent: E-settings-ui-components-and
prerequisites:
  - F-role-creation-form
affectedFiles:
  apps/desktop/src/components/settings/roles/__tests__/CreateRoleForm.edit.test.tsx:
    Created comprehensive test suite for edit mode verification with 18 test
    cases covering modal behavior, form validation, character counters, isDirty
    tracking, and edge cases
log: []
schema: v1.0
childrenIds:
  - T-implement-and-test-change
  - T-verify-edit-mode-modal
  - T-verify-update-operation-and
created: 2025-08-12T16:43:50.629Z
updated: 2025-08-12T16:43:50.629Z
---

# Role Editing Functionality Feature

## Purpose and Functionality

Enable users to modify existing roles by implementing edit functionality that pre-populates form fields with current values, validates changes, handles name uniqueness for updates, and persists modifications through the store. This feature reuses the role form modal in edit mode with appropriate modifications.

## Key Components to Implement

### Edit Mode for RoleFormModal

- Detect edit vs create mode via props
- Pre-populate form fields with existing role data
- Change submit button text to "Save Changes"
- Update modal title to "Edit Role"

### Edit State Management

- Load selected role data into form
- Track original values for comparison
- Detect actual changes vs unchanged fields
- Handle dirty state for unsaved changes warning

### Update Operation Integration

- Call store.updateRole instead of createRole
- Pass role ID with updated data
- Handle optimistic updates in UI
- Manage error states specific to updates

## Detailed Acceptance Criteria

### Edit Trigger Requirements

- [ ] Edit button on role list items opens modal in edit mode
- [ ] Selected role data loads correctly into all fields
- [ ] Original values preserved for comparison
- [ ] Modal title shows "Edit Role" instead of "Create Role"
- [ ] Submit button shows "Save Changes" instead of "Create"

### Form Behavior in Edit Mode

- [ ] All fields pre-populate with current role values
- [ ] Character counters show current length accurately
- [ ] Validation runs on pre-populated data
- [ ] Name uniqueness excludes current role from check
- [ ] Form starts in valid state if existing data is valid

### Change Detection

- [ ] Form tracks whether any fields have changed
- [ ] Submit button disabled if no changes made
- [ ] Unsaved changes warning if user tries to close with modifications
- [ ] Original values restored on cancel
- [ ] Clear indication when fields differ from saved values

### Update Operation

- [ ] Updates save to store successfully
- [ ] Only changed fields sent to update operation
- [ ] Timestamps update appropriately (updatedAt)
- [ ] List refreshes to show updated values
- [ ] Modal closes on successful update

## Technical Requirements

### Modal Mode Detection

- Pass `mode` prop to determine create vs edit
- Pass `role` prop with existing data for editing
- Conditionally render titles and button text
- Handle different validation rules if needed

### Form State for Editing

```typescript
interface EditFormState {
  originalData: RoleFormData;
  currentData: RoleFormData;
  hasChanges: boolean;
  errors: ValidationErrors;
}
```

### Validation Adjustments

- Modify name uniqueness to exclude current role ID
- Validate against original vs current for changes
- Allow keeping same name during edit
- Maintain all other validation rules

## Dependencies

- Requires F-role-creation-form to be complete
- Requires F-roles-store-integration for update operations
- Uses same form components as creation

## Testing Requirements

- Verify edit modal opens with correct data
- Test that unchanged forms cannot be submitted
- Confirm name uniqueness works correctly for edits
- Validate optimistic updates work properly
- Test cancel restores original state
- Verify error handling for failed updates

## Implementation Guidance

### Edit Mode Detection Pattern

```tsx
<RoleFormModal
  isOpen={formModalOpen}
  mode={selectedRole ? "edit" : "create"}
  role={selectedRole}
  onSave={handleSaveRole}
  onCancel={handleCancel}
/>
```

### Update Handler Example

```typescript
const handleSaveRole = async (data: RoleFormData) => {
  if (mode === "edit" && selectedRole) {
    await store.updateRole(selectedRole.id, data);
  } else {
    await store.createRole(data);
  }
};
```

### Change Detection Logic

```typescript
const hasChanges = useMemo(() => {
  if (!originalData) return true; // New role
  return (
    originalData.name !== currentData.name ||
    originalData.description !== currentData.description ||
    originalData.systemPrompt !== currentData.systemPrompt
  );
}, [originalData, currentData]);
```

## Security Considerations

- Validate role ownership if implementing user-specific roles
- Ensure role ID cannot be modified during edit
- Prevent concurrent edit conflicts
- Sanitize all modified data

## Performance Requirements

- Edit modal opens within 100ms with populated data
- Change detection runs instantly (<16ms)
- Updates persist within 500ms
- No UI freezing during save operations

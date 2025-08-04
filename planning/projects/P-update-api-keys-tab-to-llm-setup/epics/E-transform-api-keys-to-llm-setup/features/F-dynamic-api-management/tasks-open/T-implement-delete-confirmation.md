---
kind: task
id: T-implement-delete-confirmation
title: Implement delete confirmation dialog
status: open
priority: normal
prerequisites:
  - T-implement-local-state-management
created: "2025-08-04T13:37:42.606171"
updated: "2025-08-04T13:37:42.606171"
schema_version: "1.1"
parent: F-dynamic-api-management
---

## Context

When users click the delete button on an API configuration card, a confirmation dialog should appear to prevent accidental deletions. The implementation should use the existing AlertDialog component from shadcn/ui.

## Implementation Requirements

- Add delete confirmation state to track which configuration is being deleted
- Show AlertDialog when delete is triggered
- Display clear confirmation message
- Handle Yes/No actions appropriately
- Ensure proper focus management after dialog closes

## Technical Approach

1. In LlmSetupSection component, add confirmation state:

   ```typescript
   const [deleteConfirmation, setDeleteConfirmation] = useState<{
     isOpen: boolean;
     configId: string | null;
   }>({ isOpen: false, configId: null });
   ```

2. Implement dialog trigger:
   - handleDeleteClick: Set confirmation state with config ID
   - Open AlertDialog

3. Implement confirmation handlers:
   - handleConfirmDelete: Remove configuration and close dialog
   - handleCancelDelete: Close dialog without action

4. Use existing AlertDialog components from the codebase:
   - Import from `../ui/alert-dialog`
   - Follow patterns from RoleDeleteDialog example

## Dialog Content

- Title: "Delete API Configuration?"
- Description: "This will remove the API configuration. This action cannot be undone."
- Actions: "No" (cancel) and "Yes" (confirm)

## Acceptance Criteria

- ✓ Delete button triggers confirmation dialog
- ✓ Dialog displays appropriate warning message
- ✓ "No" button closes dialog without changes
- ✓ "Yes" button removes configuration and closes dialog
- ✓ Focus returns to appropriate element after close
- ✓ Dialog properly trapped for accessibility
- ✓ Multiple delete operations handled correctly

## Dependencies

- Requires T-implement-local-state-management for delete functionality

## File Location

- Update: `apps/desktop/src/components/settings/LlmSetupSection.tsx`
- Uses: `apps/desktop/src/components/ui/alert-dialog.tsx`

## Reference Implementation

- See: `apps/desktop/src/components/settings/roles/RoleDeleteDialog.tsx` for similar pattern

### Log

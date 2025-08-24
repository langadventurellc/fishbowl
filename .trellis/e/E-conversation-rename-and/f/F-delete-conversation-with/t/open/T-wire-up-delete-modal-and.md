---
id: T-wire-up-delete-modal-and
title: Wire up delete modal and handle active conversation deletion
status: open
priority: low
parent: F-delete-conversation-with
prerequisites:
  - T-create-usedeleteconversation
  - T-create-deleteconversationmodal
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T19:52:25.799Z
updated: 2025-08-24T19:52:25.799Z
---

# Wire up delete modal and handle active conversation deletion

## Context

Integrate the delete confirmation modal with the context menu and handle the special case where the deleted conversation is currently active. This completes the delete workflow from menu click to UI update.

## Implementation Requirements

### Files to modify:

- `apps/desktop/src/components/sidebar/ConversationContextMenu.tsx`
- Any file managing active conversation state (store or context)

### Implementation steps:

1. Import DeleteConversationModal component
2. Import and use useDeleteConversation hook
3. Add state for controlling modal visibility
4. Connect "Delete conversation" menu item to open modal
5. Pass conversation data to modal
6. Handle delete operation with proper error handling
7. Remove deleted conversation from sidebar list
8. Handle special case: if deleted conversation is active
   - Switch to another conversation if available
   - Show empty state if no conversations remain

### Code structure:

```typescript
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const { deleteConversation, isDeleting, error, reset } =
  useDeleteConversation();

const handleDelete = async (id: string) => {
  try {
    await deleteConversation(id);
    setIsDeleteModalOpen(false);

    // If this was the active conversation
    if (activeConversationId === id) {
      // Switch to first available conversation or show empty state
    }

    // Remove from conversation list (trigger refresh)
  } catch (err) {
    // Error is handled by the hook and modal
  }
};
```

### Active conversation handling:

- Check if deleted conversation is currently active
- If yes, select next available conversation (prefer adjacent)
- If no conversations remain, show appropriate empty state
- Ensure smooth UI transition without errors

## Acceptance Criteria

- ✅ Clicking "Delete conversation" opens confirmation modal
- ✅ Modal receives correct conversation data
- ✅ Delete operation calls useDeleteConversation hook
- ✅ Successful deletion removes conversation from sidebar
- ✅ Error handling works correctly
- ✅ Loading states propagate to modal
- ✅ Deleted active conversation triggers proper transition
- ✅ Empty state shown when last conversation deleted
- ✅ No UI errors when deleting active conversation
- ✅ Component tests verify integration

## Dependencies

- Tasks T-create-usedeleteconversation and T-create-deleteconversationmodal
- Existing conversation list state management
- Active conversation state management

## Testing Requirements

Write tests that verify:

- Menu item click opens delete modal
- Modal receives correct conversation data
- Successful deletion updates sidebar
- Active conversation deletion handled gracefully
- Transition to next conversation works
- Empty state appears when appropriate
- Error handling and display
- Loading states during operation

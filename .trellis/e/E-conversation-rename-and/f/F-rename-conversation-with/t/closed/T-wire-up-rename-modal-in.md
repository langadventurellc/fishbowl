---
id: T-wire-up-rename-modal-in
title: Wire up rename modal in ConversationContextMenu
status: done
priority: low
parent: F-rename-conversation-with
prerequisites:
  - T-create-useupdateconversation
  - T-create-renameconversationmodal
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T19:50:38.458Z
updated: 2025-08-24T19:50:38.458Z
---

# Wire up rename modal in ConversationContextMenu

## Context

Integrate the rename modal with the context menu, connecting all the pieces to enable the complete rename workflow from menu click to database update.

## Implementation Requirements

### Files to modify:

- `apps/desktop/src/components/sidebar/ConversationContextMenu.tsx`
- `apps/desktop/src/components/sidebar/ConversationItemDisplay.tsx` (if needed)

### Implementation steps:

1. Import RenameConversationModal component
2. Import and use useUpdateConversation hook
3. Add state for controlling modal visibility
4. Connect "Rename conversation" menu item to open modal
5. Pass conversation data to modal
6. Handle rename operation with proper error handling
7. Ensure sidebar updates after successful rename

### Code structure:

```typescript
const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
const { updateConversation, isUpdating, error, reset } =
  useUpdateConversation();

const handleRename = async (id: string, newTitle: string) => {
  try {
    await updateConversation(id, newTitle);
    setIsRenameModalOpen(false);
    // Trigger sidebar refresh if needed
  } catch (err) {
    // Error is handled by the hook and modal
  }
};
```

## Acceptance Criteria

- ✅ Clicking "Rename conversation" opens the modal
- ✅ Modal receives current conversation data
- ✅ Rename operation calls useUpdateConversation hook
- ✅ Successful rename closes modal and updates sidebar
- ✅ Error handling works correctly
- ✅ Loading states propagate to modal
- ✅ Sidebar immediately reflects renamed conversation
- ✅ Component tests verify integration

## Dependencies

- Tasks T-create-useupdateconversation and T-create-renameconversationmodal
- Existing conversation list state management

## Testing Requirements

Write tests that verify:

- Menu item click opens rename modal
- Modal receives correct conversation data
- Successful rename updates UI
- Error handling and display
- Loading states during operation
- Sidebar list updates after rename

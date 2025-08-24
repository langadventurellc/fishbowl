---
id: T-create-deleteconversationmodal
title: Create DeleteConversationModal component
status: open
priority: medium
parent: F-delete-conversation-with
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T19:52:03.520Z
updated: 2025-08-24T19:52:03.520Z
---

# Create DeleteConversationModal component

## Context

Create a confirmation dialog component for deleting conversations. The modal should clearly warn users about the permanent nature of deletion and provide a clear confirmation workflow.

## Implementation Requirements

### File to create:

- `apps/desktop/src/components/modals/DeleteConversationModal.tsx`

### Component structure:

```typescript
interface DeleteConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  onDelete: (id: string) => Promise<void>;
}
```

### Key features to implement:

1. Modal overlay with backdrop (use existing modal patterns/library)
2. Modal header with warning icon and "Delete Conversation" title
3. Clear warning message including conversation title:
   - "Are you sure you want to delete '{title}'?"
   - "This action cannot be undone."
4. Delete button (danger/destructive styling - red)
5. Cancel button (default styling)
6. Loading state during delete operation
7. Error message display area
8. Keyboard support (Escape to cancel)
9. Focus management for accessibility

### UI Requirements:

- Modal centered on screen
- Warning/danger styling theme
- Delete button prominently styled as destructive (red/danger color)
- Clear visual hierarchy emphasizing the warning
- Loading spinner/state during delete
- Error messages styled appropriately
- Proper spacing and padding

## Acceptance Criteria

- ✅ Modal displays conversation title in warning message
- ✅ Warning clearly states action is permanent
- ✅ Delete button has danger/destructive styling
- ✅ Escape key closes modal without deleting
- ✅ Loading state shown during delete operation
- ✅ Error messages display clearly
- ✅ Modal closes on successful deletion
- ✅ Modal stays open on error for retry
- ✅ Cancel button closes without deleting
- ✅ No accidental deletions (explicit confirmation required)
- ✅ Component tests verify all interactions

## Dependencies

- Existing modal component/library (shadcn Dialog or similar)
- Conversation type from shared package
- Existing button components with danger variant

## Testing Requirements

Write component tests that verify:

- Modal renders with correct conversation title
- Warning message displays properly
- Delete button has danger styling
- Keyboard shortcuts (Escape)
- Loading state during delete
- Error message display
- Modal closes on success
- Modal stays open on error
- Cancel behavior
- No deletion without explicit confirmation

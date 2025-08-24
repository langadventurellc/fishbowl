---
id: T-create-renameconversationmodal
title: Create RenameConversationModal component
status: open
priority: medium
parent: F-rename-conversation-with
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T19:50:21.433Z
updated: 2025-08-24T19:50:21.433Z
---

# Create RenameConversationModal component

## Context

Create a modal dialog component for renaming conversations. The modal should follow existing modal patterns in the codebase and provide a user-friendly interface for editing conversation titles.

## Implementation Requirements

### File to create:

- `apps/desktop/src/components/modals/RenameConversationModal.tsx`

### Component structure:

```typescript
interface RenameConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  onRename: (id: string, newTitle: string) => Promise<void>;
}
```

### Key features to implement:

1. Modal overlay with backdrop (use existing modal patterns/library)
2. Modal header with "Rename Conversation" title
3. Text input field pre-populated with current conversation title
4. Save and Cancel buttons
5. Loading state during save operation
6. Error message display area
7. Keyboard support:
   - Enter key triggers save
   - Escape key triggers cancel
8. Auto-focus and select text on open

### UI Requirements:

- Modal centered on screen
- Consistent styling with existing modals
- Text input has proper label and placeholder
- Save button disabled when title unchanged or empty
- Loading spinner/state during save operation
- Error messages styled appropriately

## Acceptance Criteria

- ✅ Modal opens with current title pre-populated
- ✅ Text is auto-selected for easy replacement
- ✅ Save button disabled for empty/unchanged titles
- ✅ Enter key triggers save action
- ✅ Escape key closes modal
- ✅ Loading state shown during save
- ✅ Error messages display clearly
- ✅ Modal closes on successful save
- ✅ Modal stays open on error for retry
- ✅ Cancel button closes without saving
- ✅ Component tests verify all interactions

## Dependencies

- Existing modal component/library (shadcn Dialog or similar)
- Conversation type from shared package
- Existing button and input components

## Testing Requirements

Write component tests that verify:

- Modal renders with correct initial state
- Text input updates correctly
- Save button enablement logic
- Keyboard shortcuts (Enter/Escape)
- Loading state during save
- Error message display
- Modal closes on success
- Modal stays open on error
- Cancel behavior

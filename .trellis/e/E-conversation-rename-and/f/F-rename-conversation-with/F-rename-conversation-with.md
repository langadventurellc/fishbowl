---
id: F-rename-conversation-with
title: Rename Conversation with Modal Dialog
status: open
priority: medium
parent: E-conversation-rename-and
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T19:44:59.011Z
updated: 2025-08-24T19:44:59.011Z
---

# Rename Conversation with Modal Dialog

## Purpose and Functionality

Implement the ability for users to rename conversations through a modal dialog interface, providing a clean and consistent user experience for modifying conversation titles in the sidebar.

## Key Components to Implement

### 1. IPC Handler Layer

- Implement UPDATE handler in `apps/desktop/src/electron/conversationsHandlers.ts`
- Connect to existing `ConversationsRepository.update()` method
- Add error handling and logging following CREATE/LIST patterns
- Validate conversation ID and title input

### 2. Frontend Hook - useUpdateConversation

- Create `apps/desktop/src/hooks/conversations/useUpdateConversation.ts`
- Follow the pattern established by `useCreateConversation` hook
- Include loading state management (`isUpdating`)
- Implement error state handling
- Provide reset function for clearing errors
- Use electronAPI.conversations.update for IPC communication

### 3. Rename Modal Component

- Create modal dialog component for rename operation
- Include text input field pre-populated with current title
- Add Save and Cancel buttons
- Implement keyboard support (Enter to save, Escape to cancel)
- Show loading state during update operation
- Display error messages if update fails

### 4. UI Integration

- Wire up "Rename conversation" menu item in ConversationContextMenu
- Pass conversation data to modal when triggered
- Update ConversationItemDisplay to refresh after successful rename
- Ensure sidebar list updates immediately after rename

### 5. Type Definitions

- Extend ConversationsAPI interface with update method (already marked optional)
- Add IPC request/response types for UPDATE operation
- Ensure preload script exposes update method

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ User clicks "Rename conversation" in context menu → modal dialog opens
- ✅ Modal shows current conversation title in editable text field
- ✅ User can modify title and click Save to update
- ✅ User can click Cancel or press Escape to abort operation
- ✅ Pressing Enter in text field triggers save action
- ✅ Empty titles are rejected with validation error
- ✅ Title updates persist to SQLite database via IPC
- ✅ Sidebar immediately reflects new title after successful update
- ✅ Loading indicator shows during update operation
- ✅ Error messages display if update fails

### Input Validation

- ✅ Title cannot be empty string
- ✅ Title must be trimmed of leading/trailing whitespace
- ✅ Maximum title length enforced (if defined in schema)
- ✅ Special characters are properly handled

### Error Handling

- ✅ Show user-friendly message for validation errors
- ✅ Handle case where conversation no longer exists
- ✅ Display generic error message for unexpected database errors
- ✅ Modal remains open on error, allowing user to retry

### UI/UX Requirements

- ✅ Modal overlays the application with backdrop
- ✅ Focus automatically set to text input when modal opens
- ✅ Text is pre-selected for easy replacement
- ✅ Modal is centered on screen
- ✅ Consistent styling with existing modal patterns

## Technical Requirements

### Dependencies

- Existing `ConversationsRepository.update()` method
- `CONVERSATION_CHANNELS.UPDATE` channel constant
- `UpdateConversationInput` type from shared package
- Existing modal/dialog component patterns in codebase

### Implementation Patterns

- Follow dependency injection pattern with useServices hook
- Use Zustand store for state management if needed
- Implement proper cleanup in useEffect hooks
- Follow existing error serialization patterns

## Testing Requirements

- Unit test for useUpdateConversation hook
- Test loading states and error handling
- Test validation logic for empty/invalid titles
- Test keyboard navigation (Enter/Escape)
- Verify IPC handler properly calls repository method
- Test error propagation from repository to UI

## Security Considerations

- Validate conversation ID format before database operation
- Sanitize title input to prevent injection attacks
- Ensure proper error messages don't expose system details

## Performance Requirements

- Update operation completes instantly (local SQLite)
- No UI blocking during update operation
- Modal opens/closes without lag

---
id: T-connect-chatcontainerdisplay
title: Connect ChatContainerDisplay to useMessages hook with loading and error states
status: open
priority: high
parent: F-chat-display-integration
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-30T05:45:40.417Z
updated: 2025-08-30T05:45:40.417Z
---

# Connect ChatContainerDisplay to useMessages Hook

## Context

The ChatContainerDisplay component currently uses hardcoded empty arrays for messages. This task integrates it with the existing useMessages hook to display real-time message data from conversations.

## Specific Implementation Requirements

### Location

- **File**: `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`
- **Component**: Update MainContentPanelDisplay to use useMessages hook
- **Hook**: Import and use existing `useMessages` from `@/hooks/messages`

### Technical Approach

1. **Replace hardcoded messages state**:

   ```typescript
   // Remove: const [messages] = useState([]);
   // Add: const { messages, isLoading, error, refetch } = useMessages(selectedConversationId || '');
   ```

2. **Add loading state handling**:
   - Show loading skeleton/spinner while `isLoading` is true
   - Use existing empty state when `messages.length === 0` and not loading

3. **Add error state handling**:
   - Display error message when `error` is not null
   - Provide retry functionality using `refetch` function

4. **Pass real messages to ChatContainerDisplay**:
   - Replace `messages={messages}` with actual hook data
   - Ensure proper conversationId handling (use empty string for null/undefined)

### Detailed Acceptance Criteria

**Message Display:**

- ✅ Messages load automatically when selectedConversationId changes
- ✅ Messages display in chronological order (useMessages handles sorting)
- ✅ User messages appear right-aligned, agent messages left-aligned
- ✅ System messages display with distinct styling
- ✅ Message timestamps appear correctly

**Loading States:**

- ✅ Loading indicator shows while messages are fetching
- ✅ Loading state clears when messages load successfully
- ✅ Empty conversation shows appropriate empty state (not loading indicator)

**Error Handling:**

- ✅ Error message displays clearly when message loading fails
- ✅ Retry button allows manual refetch of messages
- ✅ Error state doesn't break the overall UI layout
- ✅ Successful retry clears error state

**Integration Quality:**

- ✅ No console errors during message loading
- ✅ Component re-renders efficiently (no unnecessary re-fetching)
- ✅ Hook cleanup prevents memory leaks on unmount

### Testing Requirements

- Add unit tests for loading state display
- Add unit tests for error state handling and retry functionality
- Add unit tests for successful message integration
- Verify proper hook integration without breaking existing functionality

### Dependencies

- Requires useMessages hook (already implemented in `apps/desktop/src/hooks/messages/useMessages.ts`)
- Depends on selectedConversationId being passed correctly to MainContentPanelDisplay

### Out of Scope

- Auto-scrolling (handled by separate task)
- Message context controls (handled by separate feature)
- Performance optimizations for large message lists
- Real-time message updates beyond what useMessages provides

### Security Considerations

- Ensure selectedConversationId is validated before passing to useMessages
- Verify no XSS vulnerabilities in message content rendering (MessageItem handles this)
- No sensitive conversation data exposed in error messages

---
id: T-implement-message-management
title: Implement message management actions with memory policy
status: open
priority: high
parent: F-conversation-domain-store
prerequisites:
  - T-implement-core-conversation
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T04:38:28.537Z
updated: 2025-09-01T04:38:28.537Z
---

## Context

Implement message management actions in the conversation store with active conversation focus and client-side message capping. This includes loading messages, creating messages, and the `sendUserMessage` orchestration action.

## Implementation Requirements

**Extend**: `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

**Actions to Implement**:

1. **loadMessages(conversationId: string)** - Load messages for active conversation
   - Clear existing `activeMessages`
   - Apply `maximumMessages` limit with client-side trimming
   - Handle loading states and error conversion
   - Only update if request token still valid

2. **sendUserMessage(content?: string)** - Core orchestration action
   - Create user message using `conversationService.createMessage()`
   - Add created message to `activeMessages`
   - Trigger orchestration via `conversationService.sendToAgents()`
   - Handle continuation rules (empty content allowed)
   - Manage sending loading state
   - Apply message limits after adding new message

3. **deleteMessage(id: string)** - Remove message from conversation
   - Call service to delete message
   - Remove from `activeMessages` array
   - Handle loading states and errors

**Memory Management Policy**:

```typescript
// Apply message limit with client-side trimming
const applyMessageLimit = (messages: _Message[], limit: number): _Message[] => {
  if (messages.length <= limit) return messages;
  // Keep most recent messages, maintain chronological order
  return messages.slice(-limit);
};
```

**Technical Approach**:

- Follow same error handling pattern as conversation actions
- Use request token validation for race condition safety
- Apply message limits after state updates
- Coordinate with chat store for `sendingMessage` state
- Import and use conversation/message types from shared package

**sendUserMessage Implementation Pattern**:

```typescript
sendUserMessage: async (content?: string) => {
  if (!conversationService || !get().activeConversationId) return;

  const requestToken = generateRequestToken();
  set((state) => ({
    ...state,
    activeRequestToken: requestToken,
    loading: { ...state.loading, sending: true },
    error: { ...state.error, sending: undefined },
  }));

  try {
    // Create message
    const message = await conversationService.createMessage({
      conversation_id: get().activeConversationId!,
      role: "user",
      content: content || "",
    });

    // Add to messages and apply limit
    const currentState = get();
    if (currentState.activeRequestToken === requestToken) {
      const updatedMessages = applyMessageLimit(
        [...currentState.activeMessages, message],
        currentState.maximumMessages,
      );
      set((state) => ({ ...state, activeMessages: updatedMessages }));

      // Trigger orchestration
      await conversationService.sendToAgents(
        currentState.activeConversationId!,
        message.id,
      );
    }

    set((state) => ({
      ...state,
      loading: { ...state.loading, sending: false },
    }));
  } catch (error) {
    // Handle error...
  }
};
```

## Acceptance Criteria

- [ ] Message loading clears existing messages and applies limits
- [ ] `sendUserMessage` creates message and triggers orchestration atomically
- [ ] Client-side message trimming maintains chronological order
- [ ] Message limits configurable via `maximumMessages` state
- [ ] Race condition handling prevents stale message updates
- [ ] Loading states properly managed during operations
- [ ] Error states follow existing ErrorState patterns
- [ ] Integration with chat store sending states
- [ ] Empty content allowed for continuation messages

## Testing Requirements

- [ ] Unit tests for message loading with limits applied
- [ ] Test `sendUserMessage` orchestration flow with mocks
- [ ] Verify client-side message trimming works correctly
- [ ] Test race condition handling with stale request tokens
- [ ] Verify error handling for message operations

## Dependencies

- Requires core conversation store implementation
- Requires `ConversationService` message operations
- Requires coordination with `useChatStore`

## Out of Scope

- Agent management actions (separate task)
- Optimistic message updates (not in v1)
- Message editing or advanced operations

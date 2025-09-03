---
id: T-implement-setchatmode-action
title: Implement setChatMode action for conversation updates
status: done
priority: high
parent: F-state-management-integration
prerequisites:
  - T-add-getactivechatmode
affectedFiles:
  packages/ui-shared/src/stores/conversation/ConversationStoreActions.ts:
    Added setChatMode method signature with comprehensive JSDoc documentation
    for updating conversation chat modes
  packages/ui-shared/src/stores/conversation/useConversationStore.ts:
    Implemented setChatMode action with service integration, state updates,
    Round Robin enforcement, and error handling. Added
    enforceRoundRobinInvariant helper method with optimized logic. Added
    UpdateConversationInput import.
  packages/ui-shared/src/stores/conversation/__tests__/setChatMode.test.ts:
    Created comprehensive unit test suite with 12 test cases covering successful
    updates, Round Robin invariant enforcement, error handling, edge cases, and
    state management scenarios
log:
  - Implemented setChatMode action for conversation updates with complete
    workflow including service integration, immediate Round Robin enforcement,
    error handling, and comprehensive test coverage. Added method to
    ConversationStoreActions interface and implemented store action with
    enforceRoundRobinInvariant helper method. All 12 unit tests passing and
    quality checks successful.
schema: v1.0
childrenIds: []
created: 2025-09-03T21:13:07.468Z
updated: 2025-09-03T21:13:07.468Z
---

# Implement setChatMode Action for Conversation Updates

## Context

Add a new action to the conversation store that allows updating the chat mode of the active conversation. This action will handle the complete workflow of updating the conversation via the service layer and enforcing mode rules.

## Detailed Requirements

### Implementation Details

Add `setChatMode()` action to the conversation store that:

- Updates conversation chat_mode via service layer using `UpdateConversationInput`
- Provides immediate enforcement of Round Robin single-enabled invariant
- Includes optimistic updates for responsive UI
- Handles errors gracefully with proper error state management
- Validates mode values before processing

### Technical Approach

```typescript
// Add to useConversationStore
setChatMode: async (chatMode: "manual" | "round-robin") => {
  const { activeConversationId } = get();
  if (!activeConversationId || !conversationService) return;

  try {
    // Update via service layer using UpdateConversationInput
    const updatedConversation = await conversationService.updateConversation(
      activeConversationId,
      { chat_mode: chatMode },
    );

    // Update local state
    set((state) => ({
      ...state,
      conversations: state.conversations.map((c) =>
        c.id === activeConversationId ? updatedConversation : c,
      ),
    }));

    // Immediately enforce mode rules
    if (chatMode === "round-robin") {
      await get().enforceRoundRobinInvariant();
    }
  } catch (error) {
    // Handle errors with proper error state
    set((state) => ({
      ...state,
      error: {
        ...state.error,
        agents: {
          message: `Failed to change chat mode: ${error.message}`,
          operation: "chat_mode_update",
          isRetryable: true,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      },
    }));
  }
},
```

### Files to Modify

- `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

## Acceptance Criteria

- [ ] **setChatMode Action**: Function added with correct parameter validation
- [ ] **Service Integration**: Uses conversationService.updateConversation() with UpdateConversationInput
- [ ] **State Updates**: Updates conversations array with returned conversation object
- [ ] **Immediate Enforcement**: Round Robin mode triggers enforceRoundRobinInvariant() immediately
- [ ] **Mode Validation**: Only allows 'manual' | 'round-robin' values
- [ ] **Error Handling**: Failed updates set appropriate error state
- [ ] **Optimistic Updates**: UI reflects changes immediately while API processes
- [ ] **Unit Tests**: Tests for success, failure, and mode enforcement scenarios
- [ ] **Integration Tests**: End-to-end workflow testing with service layer

## Testing Requirements

Write comprehensive tests covering:

- Successful chat mode updates for both modes
- Service layer integration and error handling
- State updates and conversation array modifications
- Round Robin invariant enforcement trigger
- Invalid mode value handling
- Error state management and recovery

## Dependencies

- Requires F-service-layer-integration completion (updateConversation service method)
- Requires getActiveChatMode() function (T-add-getactivechatmode)
- Needs enforceRoundRobinInvariant() helper method (implemented in this task)

## Out of Scope

- Do not implement UI components for mode selection
- Do not handle agent toggle logic (separate task)
- Do not implement conversation progression logic

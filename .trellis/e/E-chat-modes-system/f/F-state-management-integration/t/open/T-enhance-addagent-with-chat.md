---
id: T-enhance-addagent-with-chat
title: Enhance addAgent with chat mode integration
status: open
priority: medium
parent: F-state-management-integration
prerequisites:
  - T-add-getactivechatmode
  - T-add-chat-mode-delegation-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T21:14:47.529Z
updated: 2025-09-03T21:14:47.529Z
---

# Enhance addAgent with Chat Mode Integration

## Context

Update the existing `addAgent` method to respect chat mode rules when new agents are added to conversations. This enhancement will ensure that newly added agents follow the appropriate enabled/disabled state based on the active chat mode.

## Detailed Requirements

### Implementation Details

Modify the existing `addAgent` method to:

- Get the active chat mode after agent is successfully added
- Create appropriate chat mode handler using factory function
- Call handler.handleAgentAdded() to get intent for new agent state
- Process handler intent to apply chat mode rules to the new agent
- Maintain existing error handling and loading state patterns

### Technical Approach

```typescript
// Modify existing addAgent in useConversationStore
addAgent: async (conversationId: string, agentId: string) => {
  if (!conversationService || !get().activeConversationId) {
    return;
  }

  // Generate request token for race condition protection
  const requestToken = generateRequestToken();

  try {
    set((state) => ({
      ...state,
      activeRequestToken: requestToken,
      loading: { ...state.loading, agents: true },
      error: { ...state.error, agents: undefined },
    }));

    // Add agent via service
    const conversationAgent = await conversationService.addAgent(
      conversationId,
      agentId,
    );

    // Check if request is still current before updating
    const currentState = get();
    if (currentState.activeRequestToken === requestToken) {
      // Update store with new agent
      set((state) => ({
        ...state,
        activeConversationAgents: [
          ...state.activeConversationAgents,
          conversationAgent,
        ],
        loading: { ...state.loading, agents: false },
      }));

      // Apply chat mode rules to new agent
      const activeChatMode = get().getActiveChatMode();
      const { activeConversationAgents } = get();
      const chatModeHandler = createChatModeHandler(activeChatMode || "manual");

      const intent = chatModeHandler.handleAgentAdded(
        activeConversationAgents,
        conversationAgent.id,
      );

      // Process intent for chat mode compliance
      await get().processAgentIntent(intent);
    }
  } catch (error) {
    // ... existing error handling
  }
},
```

### Files to Modify

- `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

## Acceptance Criteria

- [ ] **Handler Integration**: Uses createChatModeHandler() with active chat mode after agent added
- [ ] **Intent Processing**: Calls handler.handleAgentAdded() and processes returned intent
- [ ] **State Updates**: New agent added to store before chat mode processing
- [ ] **Round Robin Compliance**: New agents respect single-enabled invariant in Round Robin mode
- [ ] **Manual Mode**: Manual mode maintains existing behavior (agents enabled by default)
- [ ] **Race Condition Safety**: Uses existing request token pattern
- [ ] **Error Handling**: Chat mode processing errors handled gracefully
- [ ] **Backward Compatibility**: Maintains existing addAgent behavior for manual mode
- [ ] **Unit Tests**: Tests for both manual and round-robin mode integration
- [ ] **Integration Tests**: Complete workflows with agent addition

## Testing Requirements

Write comprehensive tests covering:

- Manual mode: new agents enabled by default (no change)
- Round Robin mode: first agent enabled, subsequent agents disabled
- Round Robin mode: new agent addition when existing agent enabled
- Handler intent processing and state updates
- Error handling for failed intent processing
- Race condition handling with request tokens
- Integration with processAgentIntent() helper method

## Dependencies

- Requires F-chat-mode-strategy-pattern completion (handleAgentAdded method in handlers)
- Requires getActiveChatMode() function (T-add-getactivechatmode)
- Requires processAgentIntent() helper method (T-add-chat-mode-delegation-to)

## Implementation Guidance

### Processing Order

1. First: Add agent via service and update store state
2. Second: Get current chat mode and create handler
3. Third: Call handleAgentAdded() with updated agent list (including new agent)
4. Fourth: Process returned intent to apply mode rules

### Handler Behavior

The chat mode handlers implement the following logic:

- **Manual Mode**: No changes to agent enabled state
- **Round Robin Mode**:
  - First agent: enabled
  - Subsequent agents: disabled (maintains single-enabled invariant)

### Error Isolation

If chat mode processing fails:

- Agent should still be successfully added to conversation
- Error state should indicate chat mode processing failure
- User can manually adjust agent states if needed

## Out of Scope

- Do not modify existing agent addition service layer methods
- Do not change agent enabled default values in database/service
- Do not implement UI feedback for mode processing
- Do not handle agent removal mode processing (separate consideration)

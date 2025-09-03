---
id: T-add-chat-mode-delegation-to
title: Add chat mode delegation to toggleAgentEnabled
status: open
priority: high
parent: F-state-management-integration
prerequisites:
  - T-add-getactivechatmode
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T21:13:29.963Z
updated: 2025-09-03T21:13:29.963Z
---

# Add Chat Mode Delegation to toggleAgentEnabled

## Context

Enhance the existing `toggleAgentEnabled` method to delegate agent toggle operations to the appropriate chat mode handler. This integration will ensure that all agent state changes respect the current chat mode rules by using the strategy pattern.

## Detailed Requirements

### Implementation Details

Modify the existing `toggleAgentEnabled` method to:

- Get the active chat mode using `getActiveChatMode()`
- Create appropriate chat mode handler using factory function
- Delegate toggle decision to the handler, receiving intent object
- Process handler intent into actual state updates using service layer
- Maintain existing error handling and loading state patterns

### Technical Approach

```typescript
// Modify existing toggleAgentEnabled in useConversationStore
toggleAgentEnabled: async (conversationAgentId: string) => {
  const activeChatMode = get().getActiveChatMode();
  const { activeConversationAgents } = get();
  const chatModeHandler = createChatModeHandler(activeChatMode || "manual");

  // Get intent from handler
  const intent = chatModeHandler.handleAgentToggle(
    activeConversationAgents,
    conversationAgentId,
  );

  // Process intent into actual updates
  await get().processAgentIntent(intent);
},
```

### Files to Modify

- `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

## Acceptance Criteria

- [ ] **Handler Integration**: Uses createChatModeHandler() with active chat mode
- [ ] **Intent Processing**: Calls handler.handleAgentToggle() and processes returned intent
- [ ] **Fallback Handling**: Defaults to 'manual' mode when no active conversation
- [ ] **State Consistency**: All agent state changes go through intent processing
- [ ] **Error Recovery**: Failed intent processing handled gracefully
- [ ] **Race Condition Safety**: Uses existing request token pattern for consistency
- [ ] **Backward Compatibility**: Maintains existing toggleAgentEnabled behavior for manual mode
- [ ] **Unit Tests**: Tests for both manual and round-robin mode delegation
- [ ] **Integration Tests**: Complete workflows with different chat modes

## Testing Requirements

Write comprehensive tests covering:

- Manual mode delegation (no-op behavior)
- Round Robin mode delegation with single-enabled enforcement
- Handler intent processing and state updates
- Error handling for failed intent processing
- Edge cases (no active conversation, invalid agent ID)
- Integration with processAgentIntent helper method

## Dependencies

- Requires F-chat-mode-strategy-pattern completion (ChatModeHandler interfaces and implementations)
- Requires getActiveChatMode() function (T-add-getactivechatmode)
- Requires processAgentIntent() helper method (implemented in this task)

## Implementation Guidance

### Helper Method: processAgentIntent

Also implement the `processAgentIntent` helper method:

```typescript
// Helper method to process handler intents with in-place updates
processAgentIntent: async (intent: ChatModeIntent) => {
  if (!conversationService) return;

  try {
    // Process all disables first, then enables
    const updatedAgents: ConversationAgent[] = [];

    for (const agentId of intent.toDisable) {
      const updatedAgent = await conversationService.updateConversationAgent(
        agentId,
        { enabled: false },
      );
      updatedAgents.push(updatedAgent);
    }

    for (const agentId of intent.toEnable) {
      const updatedAgent = await conversationService.updateConversationAgent(
        agentId,
        { enabled: true },
      );
      updatedAgents.push(updatedAgent);
    }

    // Update store state in-place using returned agent payloads
    set((state) => ({
      ...state,
      activeConversationAgents: state.activeConversationAgents.map(
        (agent) => {
          const updated = updatedAgents.find((ua) => ua.id === agent.id);
          return updated || agent;
        },
      ),
    }));
  } catch (error) {
    // Handle errors with proper error state
    set((state) => ({
      ...state,
      error: {
        ...state.error,
        agents: {
          message: `Failed to apply chat mode changes: ${error.message}`,
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

## Out of Scope

- Do not modify chat mode handler implementations
- Do not implement conversation progression logic
- Do not change existing agent loading or service layer methods

---
id: T-implement-conversation-1
title: Implement conversation progression handling
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
created: 2025-09-03T21:13:54.061Z
updated: 2025-09-03T21:13:54.061Z
---

# Implement Conversation Progression Handling

## Context

Add automatic agent rotation functionality that triggers after agent responses in Round Robin mode. This feature will integrate with the existing agent update event system to provide seamless conversation progression without manual intervention.

## Detailed Requirements

### Implementation Details

Add `handleConversationProgression()` method to the conversation store that:

- Checks active chat mode and only processes Round Robin mode
- Uses existing chat mode handlers to determine next agent
- Processes handler intent to rotate agents automatically
- Integrates with existing agent update events using `status === "complete"`
- Handles edge cases (single agent, no enabled agents, empty conversation)

### Technical Approach

```typescript
// Add to useConversationStore
handleConversationProgression: async () => {
  const activeChatMode = get().getActiveChatMode();
  if (activeChatMode !== "round-robin") return; // No-op for manual mode

  const { activeConversationAgents } = get();
  const chatModeHandler = createChatModeHandler(activeChatMode);
  const intent = chatModeHandler.handleConversationProgression(
    activeConversationAgents,
  );

  await get().processAgentIntent(intent);
},
```

### Event Integration

Update the existing `subscribeToAgentUpdates` method:

```typescript
// Enhanced event handling for progression
const handleAgentUpdate = (event: AgentUpdateEvent) => {
  // ... existing event handling

  // Trigger progression after agent responses using status === "complete"
  if (event.status === "complete") {
    get().handleConversationProgression();
  }

  if (callback) callback(event);
};
```

### Files to Modify

- `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

## Acceptance Criteria

- [ ] **handleConversationProgression Method**: New method added to store
- [ ] **Mode Check**: Only processes Round Robin mode, no-op for manual mode
- [ ] **Handler Integration**: Uses createChatModeHandler() and handleConversationProgression()
- [ ] **Intent Processing**: Processes returned intent using processAgentIntent()
- [ ] **Event Integration**: Hooks into existing subscribeToAgentUpdates using `event.status === "complete"`
- [ ] **Automatic Rotation**: Round Robin mode rotates agents after responses
- [ ] **Edge Case Handling**: Single agent, no enabled agents, empty conversation scenarios
- [ ] **Manual Mode Bypass**: Manual mode skips progression (returns early)
- [ ] **Race Condition Safety**: Uses existing request token pattern for consistency
- [ ] **Unit Tests**: Tests for progression logic and event integration
- [ ] **Integration Tests**: Complete workflows with agent response triggering

## Testing Requirements

Write comprehensive tests covering:

- Round Robin mode progression after agent responses
- Manual mode bypass (no-op behavior)
- Event integration with `status === "complete"`
- Edge cases: single agent, no enabled agents
- Handler intent processing and state updates
- Integration with existing event subscription system
- Race condition handling with request tokens

## Dependencies

- Requires F-chat-mode-strategy-pattern completion (handleConversationProgression method in handlers)
- Requires getActiveChatMode() function (T-add-getactivechatmode)
- Requires processAgentIntent() helper method (T-add-chat-mode-delegation-to)
- Uses existing subscribeToAgentUpdates event system

## Implementation Guidance

### Event Integration Pattern

The existing `subscribeToAgentUpdates` method already handles agent update events. Enhance it to trigger progression:

1. Locate the existing `handleAgentUpdate` function within `subscribeToAgentUpdates`
2. Add progression trigger after existing event processing
3. Use `event.status === "complete"` to detect agent response completion
4. Call `handleConversationProgression()` for automatic rotation

### Edge Case Handling

The chat mode handlers already implement edge case logic:

- Single agent scenarios: no rotation needed
- No enabled agents: no-op behavior
- Empty conversation: no agents to process

The store method should rely on handler logic rather than implementing edge cases.

## Out of Scope

- Do not modify existing event subscription logic structure
- Do not implement new event types or handlers
- Do not change agent update event format or processing
- Do not add UI indicators for progression (separate feature)

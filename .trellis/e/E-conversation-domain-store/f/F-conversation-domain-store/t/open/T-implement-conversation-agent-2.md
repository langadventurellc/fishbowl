---
id: T-implement-conversation-agent-2
title: Implement conversation agent management actions
status: open
priority: medium
parent: F-conversation-domain-store
prerequisites:
  - T-implement-message-management
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T04:38:46.406Z
updated: 2025-09-01T04:38:46.406Z
---

## Context

Implement conversation agent management actions in the conversation store, handling agent assignment, removal, and enabling/disabling within conversations.

## Implementation Requirements

**Extend**: `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

**Actions to Implement**:

1. **loadConversationAgents(conversationId: string)** - Load agents for active conversation
   - Clear existing `activeConversationAgents`
   - Load via `conversationService.listConversationAgents()`
   - Handle loading states and error conversion
   - Validate request token for race conditions

2. **addAgent(conversationId: string, agentId: string)** - Add agent to conversation
   - Call `conversationService.addAgent()`
   - Add returned ConversationAgent to `activeConversationAgents`
   - Handle duplicate agent scenarios
   - Manage loading states during operation

3. **removeAgent(conversationId: string, agentId: string)** - Remove agent from conversation
   - Call `conversationService.removeAgent()`
   - Remove agent from `activeConversationAgents` array
   - Handle agent not found scenarios
   - Manage loading states during operation

4. **toggleAgentEnabled(conversationAgentId: string)** - Enable/disable conversation agent
   - Find agent in `activeConversationAgents` by ID
   - Toggle `enabled` property via `conversationService.updateConversationAgent()`
   - Update agent in local state with returned data
   - Handle loading states for toggle operation

**Technical Approach**:

- Follow same patterns as message actions for consistency
- Use array manipulation methods for state updates
- Implement proper error handling with ErrorState conversion
- Add specific loading states for agent operations
- Validate active conversation exists before operations

**Agent State Management Pattern**:

```typescript
addAgent: async (conversationId: string, agentId: string) => {
  if (!conversationService || !get().activeConversationId) return;

  const requestToken = generateRequestToken();
  set((state) => ({
    ...state,
    activeRequestToken: requestToken,
    loading: { ...state.loading, agents: true },
    error: { ...state.error, agents: undefined },
  }));

  try {
    const conversationAgent = await conversationService.addAgent(
      conversationId,
      agentId,
    );

    const currentState = get();
    if (currentState.activeRequestToken === requestToken) {
      set((state) => ({
        ...state,
        activeConversationAgents: [
          ...state.activeConversationAgents,
          conversationAgent,
        ],
        loading: { ...state.loading, agents: false },
      }));
    }
  } catch (error) {
    // Handle error with ErrorState pattern
  }
};
```

## Acceptance Criteria

- [ ] Agent loading clears existing agents and loads fresh data
- [ ] `addAgent` successfully adds agent and updates local state
- [ ] `removeAgent` removes agent from both service and local state
- [ ] `toggleAgentEnabled` updates agent enabled status atomically
- [ ] Duplicate agent handling prevents multiple assignments
- [ ] Race condition handling prevents stale agent updates
- [ ] Loading states properly managed during agent operations
- [ ] Error states follow established ErrorState patterns
- [ ] Operations validate active conversation exists

## Testing Requirements

- [ ] Unit tests for agent loading and state management
- [ ] Test `addAgent` with success and duplicate scenarios
- [ ] Test `removeAgent` with success and not-found scenarios
- [ ] Verify `toggleAgentEnabled` updates correct agent
- [ ] Test race condition handling with request tokens
- [ ] Verify error handling for all agent operations

## Dependencies

- Requires message management implementation
- Requires `ConversationService` agent operations
- Requires `_ConversationAgent` types from shared package

## Out of Scope

- Agent creation/deletion (handled elsewhere)
- Complex agent configuration beyond enable/disable
- Bulk agent operations

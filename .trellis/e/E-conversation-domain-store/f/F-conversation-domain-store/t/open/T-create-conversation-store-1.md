---
id: T-create-conversation-store-1
title: Create conversation store selectors and utilities
status: open
priority: medium
parent: F-conversation-domain-store
prerequisites:
  - T-implement-conversation-agent-2
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T04:39:05.574Z
updated: 2025-09-01T04:39:05.574Z
---

## Context

Create minimal, centralized selectors for the conversation store following the specification's guidance to keep selectors simple and avoid over-engineering. Focus on essential transforms that components need.

## Implementation Requirements

**File to create**: `packages/ui-shared/src/stores/conversation/selectors.ts`

**Selectors to Implement**:

1. **Basic State Selectors** - Simple property accessors:
   - `selectActiveConversationId`
   - `selectConversations`
   - `selectActiveMessages`
   - `selectActiveConversationAgents`
   - `selectLoadingStates`
   - `selectErrorStates`

2. **Computed Selectors** - Essential transforms only:
   - `selectActiveConversation` - Find active conversation from list
   - `selectHasActiveConversation` - Boolean check
   - `selectMessageCount` - Count of active messages
   - `selectEnabledAgents` - Filter enabled conversation agents
   - `selectIsLoading` - Check if any operation is loading

3. **MessageViewModel Selector** (if needed):
   - `selectMessagesWithAgentData` - Transform messages for UI display
   - Coordinate with existing agent/role stores for agent information
   - Keep transformation logic centralized to avoid duplication

**Technical Approach**:

- Use simple selector functions, not complex selector libraries
- Follow existing codebase selector patterns
- Keep logic minimal - basic filters and transforms only
- Export individual selectors for targeted usage
- Use TypeScript for proper typing of selector returns

**Selector Implementation Pattern**:

```typescript
export const selectActiveConversationId = (
  state: ConversationStore,
): string | null => state.activeConversationId;

export const selectActiveConversation = (
  state: ConversationStore,
): _Conversation | undefined =>
  state.conversations.find((conv) => conv.id === state.activeConversationId);

export const selectEnabledAgents = (
  state: ConversationStore,
): _ConversationAgent[] =>
  state.activeConversationAgents.filter((agent) => agent.enabled);
```

## Acceptance Criteria

- [ ] All basic state selectors return correct property values
- [ ] Computed selectors perform essential transforms only
- [ ] `selectActiveConversation` correctly finds conversation from list
- [ ] `selectEnabledAgents` filters agents by enabled status
- [ ] Selectors are properly typed with TypeScript
- [ ] MessageViewModel selector (if created) coordinates with agent stores
- [ ] No over-engineering - keep selector logic simple
- [ ] All selectors export correctly for component usage

## Testing Requirements

- [ ] Unit tests for basic state selectors with mock store state
- [ ] Test computed selectors with various state scenarios
- [ ] Verify `selectActiveConversation` handles missing conversation
- [ ] Test enabled agents filtering with mixed enabled/disabled agents
- [ ] Validate TypeScript types for all selector returns

## Dependencies

- Requires completed conversation store implementation
- Requires conversation/message/agent types from shared package
- May coordinate with existing agent/role store selectors

## Out of Scope

- Complex selector optimization (unless performance issues arise)
- Memoization libraries (keep it simple)
- Advanced transformation logic beyond basic filtering

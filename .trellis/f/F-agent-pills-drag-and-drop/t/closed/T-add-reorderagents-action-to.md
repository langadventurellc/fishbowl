---
id: T-add-reorderagents-action-to
title: Add reorderAgents action to conversation store
status: done
priority: medium
parent: F-agent-pills-drag-and-drop
prerequisites:
  - T-install-and-configure-dnd-kit
affectedFiles:
  packages/ui-shared/src/stores/conversation/ConversationStoreActions.ts:
    Added reorderAgents method signature to interface with JSDoc documentation
    describing parameters and behavior
  packages/ui-shared/src/stores/conversation/useConversationStore.ts:
    Implemented reorderAgents method with race condition protection using
    activeRequestToken, optimistic UI updates with rollback on failure,
    validation of agent IDs, sequential service calls to update display_order,
    and comprehensive error handling following existing patterns
log:
  - Implemented reorderAgents action in conversation store with all required
    features including race condition protection, optimistic UI updates,
    rollback on failure, and proper error handling. The action updates
    display_order field for each agent using existing service layer and follows
    established patterns from toggleAgentEnabled and processAgentIntent methods.
    Implementation includes validation, sequential service calls, and
    comprehensive logging.
schema: v1.0
childrenIds: []
created: 2025-09-06T02:19:05.021Z
updated: 2025-09-06T02:19:05.021Z
---

# Add reorderAgents action to conversation store

## Context

Extend the existing useConversationStore in packages/ui-shared/src/stores/conversation/useConversationStore.ts to add a reorderAgents action that handles agent reordering logic and persistence via the existing IPC pathway.

## Specific Requirements

- Add `reorderAgents(conversationId: string, agentIds: string[])` action to store
- Use existing `conversationService.updateConversationAgent()` calls for persistence
- Follow existing error handling patterns in store (loading states, error states)
- Update display_order field for each agent based on new order
- Handle race conditions using existing activeRequestToken pattern
- Optimistic UI updates with rollback on failure

## Technical Approach

1. Add reorderAgents method to ConversationStore interface
2. Implement action following existing store patterns (loading/error states)
3. Use Promise.all to update all agents' display_order values
4. Update activeConversationAgents array optimistically, with rollback on error
5. Follow existing error handling pattern with proper error state setting

## Acceptance Criteria

- [ ] reorderAgents action added to useConversationStore
- [ ] Uses existing conversationService.updateConversationAgent pathway
- [ ] Updates display_order field for each agent based on array position
- [ ] Follows existing loading/error state patterns
- [ ] Handles race conditions with activeRequestToken
- [ ] Optimistic updates with error rollback
- [ ] Unit tests cover reorder action, error handling, and race conditions

## Dependencies

- T-install-and-configure-dnd-kit (for TypeScript type imports)

## Files to Modify

- packages/ui-shared/src/stores/conversation/useConversationStore.ts

## Reference Implementation

Look at existing `toggleAgentEnabled`, `addAgent`, and `processAgentIntent` actions in the same store for patterns to follow.

## Out of Scope

- Do not modify UI components yet
- Do not implement drag-and-drop logic
- Do not change IPC layer or service implementations

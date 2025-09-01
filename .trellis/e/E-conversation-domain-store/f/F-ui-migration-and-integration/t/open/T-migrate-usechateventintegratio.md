---
id: T-migrate-usechateventintegratio
title: Migrate useChatEventIntegration from useMessagesRefresh to store
status: open
priority: high
parent: F-ui-migration-and-integration
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T08:36:26.198Z
updated: 2025-09-01T08:36:26.198Z
---

## Purpose

Migrate the useChatEventIntegration hook from using the obsolete useMessagesRefresh hook to using the conversation store's refresh functionality, completing the chat event integration migration.

## Context

The useChatEventIntegration hook currently uses `useMessagesRefresh` to trigger message list refreshes in response to chat events. This is one of the remaining usages of the obsolete hook pattern that needs to be migrated to the conversation store.

**Current Implementation**: `apps/desktop/src/hooks/chat/useChatEventIntegration.ts`

- Uses `const { refetch } = useMessagesRefresh();` for message refresh functionality
- Calls `refetch()` in response to agent update events to keep message list current

**Target Migration**: Use conversation store's `refreshActiveConversation()` instead

## Detailed Implementation Requirements

### File to Modify

- **File**: `apps/desktop/src/hooks/chat/useChatEventIntegration.ts`
- **Pattern to Follow**: Replace `useMessagesRefresh` with `useConversationStore`

### Current Usage Analysis

The hook currently uses:

```typescript
import { useMessagesRefresh } from "../messages";
// ...
const { refetch } = useMessagesRefresh();
// ...
// Called in event handlers to refresh message list
refetch();
```

This is used within the chat event integration to refresh the message list when agent events occur.

### Migration Steps

1. **Update Imports**:
   - Remove: `import { useMessagesRefresh } from "../messages";`
   - Add: `import { useConversationStore } from "@fishbowl-ai/ui-shared";`

2. **Replace Hook Usage**:
   - Remove: `const { refetch } = useMessagesRefresh();`
   - Replace: `const { refreshActiveConversation } = useConversationStore();`

3. **Update Event Handler Logic**:
   - Replace all `refetch()` calls with `refreshActiveConversation()`
   - Maintain the same event-driven refresh timing
   - Preserve existing conditional logic for when refreshes occur

4. **Handle Async Operations**:
   - The store method may return a Promise, handle appropriately
   - Maintain existing error handling patterns
   - Ensure the event handling flow is not disrupted

### Implementation Approach

```typescript
// Before:
import { useMessagesRefresh } from "../messages";

export function useChatEventIntegration(
  options: UseChatEventIntegrationOptions,
) {
  const { refetch } = useMessagesRefresh();

  const handleAgentUpdate = useCallback(
    (event: AgentUpdateEvent) => {
      // ... event processing logic

      // Refresh messages after agent events
      refetch();
    },
    [refetch],
  );

  // ... rest of hook logic
}

// After:
import { useConversationStore } from "@fishbowl-ai/ui-shared";

export function useChatEventIntegration(
  options: UseChatEventIntegrationOptions,
) {
  const { refreshActiveConversation } = useConversationStore();

  const handleAgentUpdate = useCallback(
    (event: AgentUpdateEvent) => {
      // ... event processing logic

      // Refresh messages after agent events
      refreshActiveConversation();
    },
    [refreshActiveConversation],
  );

  // ... rest of hook logic
}
```

### Dependency Array Updates

- Update `useCallback` dependency arrays to include `refreshActiveConversation` instead of `refetch`
- Ensure all callback dependencies are properly tracked
- Maintain React hooks best practices

## Acceptance Criteria

### Functional Requirements

- [ ] Hook uses `useConversationStore()` instead of `useMessagesRefresh`
- [ ] All event-driven refresh functionality preserved
- [ ] Agent update events still trigger message list refresh
- [ ] Conversation filtering logic maintained (if any)
- [ ] Event handling timing preserved

### Code Quality Requirements

- [ ] TypeScript compilation succeeds without errors
- [ ] No ESLint or formatting issues
- [ ] Proper dependency arrays in useCallback hooks
- [ ] Import statements cleaned up (no unused imports)
- [ ] Consistent with store usage patterns

### Integration Requirements

- [ ] Chat event integration continues to work correctly
- [ ] Message list updates properly in response to events
- [ ] No breaking changes to consuming components
- [ ] Performance maintained or improved
- [ ] Event filtering logic preserved

### Testing Requirements

- [ ] Hook behavior unchanged from consumer perspective
- [ ] Event-driven refreshes work correctly
- [ ] Conversation ID filtering preserved (if applicable)
- [ ] Error handling continues to function

## Dependencies

- **Prerequisites**: None (conversation store is already implemented)
- **Blocks**: T-remove-obsolete-hooks-and (cannot remove useMessagesRefresh until this is complete)
- **Related**: Chat event system and conversation store integration

## Technical Approach

1. **Direct Hook Replacement**: Replace useMessagesRefresh with useConversationStore
2. **Preserve Event Logic**: Maintain the same event handling and refresh timing
3. **Update Dependencies**: Fix useCallback dependency arrays
4. **Handle Async**: Properly handle any Promise returns from store methods

## Out of Scope

- Changes to the chat event system itself
- Modifications to event payload structures
- Changes to conversation ID filtering logic (preserve existing)
- Performance optimizations beyond basic store usage
- Changes to the hook's external interface

## Implementation Notes

- **Event-Driven**: This hook is triggered by chat events, so timing is important
- **Conversation Context**: The hook likely operates in the context of an active conversation
- **Store Integration**: The store's `refreshActiveConversation()` is designed for this use case
- **Dependency Management**: Pay attention to useCallback dependencies

## Risk Mitigation

- **Preserve Event Flow**: Ensure event handling flow is not disrupted
- **Test Integration**: Verify with actual chat events if possible
- **Gradual Verification**: Test each event type that triggers refresh
- **Rollback Plan**: Changes are isolated and can be easily reverted

## Implementation Guidelines

- **Follow Store Patterns**: Use the same store connection pattern as other migrated files
- **Maintain React Hooks Rules**: Ensure proper dependency arrays and hook usage
- **Preserve Functionality**: The hook should work identically from the consumer perspective
- **Handle Errors**: Maintain existing error handling approaches

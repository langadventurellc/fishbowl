---
id: T-update-message-item-to-use
title: Update message item to use MessagesRefreshContext store integration
status: open
priority: medium
parent: F-ui-migration-and-integration
prerequisites:
  - T-migrate-message-input
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T06:28:49.156Z
updated: 2025-09-01T06:28:49.156Z
---

## Purpose

Update the MessageItem component to work correctly with the migrated MessagesRefreshContext that now uses the conversation domain store's `refreshActiveConversation` action instead of direct hook refetch.

## Context

The MessageItem component (apps/desktop/src/components/chat/MessageItem.tsx) currently uses `useMessagesRefresh` to trigger message list updates after message modifications. After the main content migration, MessagesRefreshContext now provides the store's `refreshActiveConversation` action instead of a direct hook refetch.

## Detailed Implementation Requirements

### Component Analysis - MessageItem.tsx

The component currently uses:

```typescript
const { refetch } = useMessagesRefresh();
```

After the main content migration, this `refetch` now calls `refreshActiveConversation` from the conversation store. The component should work without changes, but we need to verify and test the integration.

### Verification Requirements

1. **Context integration**: Ensure `useMessagesRefresh` works with store-backed refetch
2. **Message updates**: Verify message inclusion changes trigger correct store refresh
3. **State coordination**: Ensure message updates coordinate with store state
4. **Error handling**: Verify error states work correctly with store integration

### Expected Behavior

```typescript
const MessageItem = ({ message, ...props }: MessageItemProps) => {
  const { updateInclusion, updating, error, reset } = useUpdateMessage();
  const { refetch } = useMessagesRefresh(); // Now uses store refreshActiveConversation

  const handleInclusionChange = useCallback(
    async (included: boolean) => {
      await updateInclusion(message.id, included);
      await refetch(); // Triggers store refreshActiveConversation
    },
    [updateInclusion, message.id, refetch],
  );

  // Component should work unchanged with store-backed refetch
};
```

## Acceptance Criteria

### Integration Verification

- [ ] MessageItem component works correctly with store-backed MessagesRefreshContext
- [ ] Message inclusion changes trigger store `refreshActiveConversation`
- [ ] Message list updates correctly after message modifications
- [ ] Loading states coordinate properly during message updates
- [ ] Error handling works correctly with store integration
- [ ] No functional regressions in message editing flow

### State Coordination

- [ ] Message updates reflect correctly in activeMessages
- [ ] Store state stays consistent after message modifications
- [ ] No conflicts between message updates and store state
- [ ] Optimistic updates work correctly if any are present

### Performance Verification

- [ ] Message refresh performance maintained or improved
- [ ] No unnecessary re-renders during message updates
- [ ] Store state updates efficiently after message changes

## Testing Requirements

- [ ] Unit tests verify MessageItem works with store-backed context
- [ ] Test message inclusion changes trigger store refresh correctly
- [ ] Test error handling during message updates
- [ ] Test loading states display properly during updates
- [ ] Integration tests verify message editing workflow preserved

## Technical Approach

1. **Context verification**: Confirm `useMessagesRefresh` provides store action
2. **Integration testing**: Test message updates with store-backed refetch
3. **State validation**: Ensure message changes coordinate with store state
4. **Performance check**: Verify no regressions in update performance
5. **Error boundary**: Test error handling with store integration

## Dependencies

- **Prerequisites**: T-migrate-message-input (main content panel using store)
- **Context dependency**: MessagesRefreshContext now backed by conversation store
- **Component scope**: MessageItem.tsx and related message components
- **Store coordination**: refreshActiveConversation action working correctly

## Out of Scope

- Changes to useUpdateMessage hook (maintains existing implementation)
- Message rendering logic modifications
- Other message component interactions
- Message validation or business logic changes

## Implementation Notes

- **Minimal changes**: Component should work with existing implementation
- **Context consistency**: MessagesRefreshContext interface unchanged
- **Store coordination**: Verify store refresh works correctly
- **Error handling**: Maintain existing error display patterns

## Expected Outcome

This task should primarily be verification and testing, with minimal code changes needed since the MessagesRefreshContext interface remains the same. The main work is ensuring the store-backed refetch works correctly with existing message update flows.

---
id: T-implement-useupdatemessage
title: Implement useUpdateMessage hook for message modifications
status: open
priority: medium
parent: F-message-hooks-implementation
prerequisites:
  - T-implement-usemessages-hook
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T17:17:54.965Z
updated: 2025-08-29T17:17:54.965Z
---

# Implement useUpdateMessage Hook

## Context

Create the message update hook following patterns from `useConversationAgents.toggleEnabled` (lines 178-209). This hook handles updating message properties (primarily inclusion flags) with optimistic updates and rollback capabilities.

## Technical Requirements

### File Location

- Create `apps/desktop/src/hooks/messages/useUpdateMessage.ts`
- Follow mutation pattern from `toggleEnabled` function in useConversationAgents

### Implementation Details

**Hook Signature:**

```typescript
export function useUpdateMessage(
  refetchMessages: () => Promise<void>,
): UseUpdateMessageResult;
```

**Return Interface:**

```typescript
interface UseUpdateMessageResult {
  updateInclusion: (messageId: string, included: boolean) => Promise<void>;
  updating: boolean;
  error: Error | null;
}
```

**Core Functionality:**

1. **Inclusion Updates**: Call `window.electronAPI.messages.updateInclusion(id, included)` via IPC
2. **Optimistic Updates**: Update local state immediately for responsive UI
3. **Error Rollback**: Revert optimistic changes if server update fails
4. **Loading States**: Track updating state during async operations
5. **Real-time Sync**: Trigger refetch after successful update
6. **State Management**: Handle concurrent updates safely

### Pattern Consistency Requirements

**Follow useConversationAgents.toggleEnabled pattern exactly:**

- Accept refetch function parameter for real-time sync
- Use updating/error state management pattern
- Implement optimistic updates with rollback capability
- Call refetch after successful update
- Handle errors by setting error state and rolling back changes

### Integration Points

**Dependencies:**

- Use `useServices()` from `../../contexts` for logging
- Receive refetch function from parent component using useMessages
- Work with Message type from `@fishbowl-ai/shared`

**IPC Interface:**

- `window.electronAPI.messages.updateInclusion(messageId: string, included: boolean): Promise<Message>`

## Acceptance Criteria

### Functional Requirements

- ✅ Accepts refetch function parameter for real-time sync
- ✅ Returns UseUpdateMessageResult interface with all required properties
- ✅ Updates message inclusion flags via `window.electronAPI.messages.updateInclusion()`
- ✅ Provides updateInclusion function for toggling context inclusion
- ✅ Handles boolean included parameter (true/false)
- ✅ Provides updating state during async operations
- ✅ Includes comprehensive error handling with rollback

### Optimistic Update Requirements

- ✅ Updates local UI state immediately when called
- ✅ Provides responsive user experience during server sync
- ✅ Rolls back optimistic changes if server update fails
- ✅ Maintains data consistency between local and server state
- ✅ Handles concurrent updates safely

### State Management Requirements

- ✅ Sets updating: true at start of update process
- ✅ Clears error state when starting new update
- ✅ Sets updating: false after completion (success or failure)
- ✅ Sets error state on failures with rollback
- ✅ Triggers refetch after successful update

### Error Handling Requirements

- ✅ Validates messageId parameter before IPC call
- ✅ Handles invalid messageId with clear error message
- ✅ Handles IPC communication failures gracefully
- ✅ Reverts optimistic changes on server failure
- ✅ Provides user-friendly error messages
- ✅ Logs errors with context for debugging

### Real-time Behavior Requirements

- ✅ Calls refetchMessages() after successful update
- ✅ Maintains UI responsiveness during update process
- ✅ Updates message list to reflect server state
- ✅ Handles refetch failures without blocking update success

### Unit Testing Requirements

- ✅ Create comprehensive unit tests in `__tests__/useUpdateMessage.test.tsx`
- ✅ Mock `window.electronAPI.messages.updateInclusion` interface
- ✅ Test successful inclusion flag updates (true/false)
- ✅ Test optimistic updates and rollback scenarios
- ✅ Test updating state transitions
- ✅ Test error handling for various failure scenarios
- ✅ Test refetch triggering after successful update
- ✅ Test concurrent update handling
- ✅ Verify proper cleanup and state management

## Example Usage

```typescript
function MessageCard({ message, conversationId }: Props) {
  const { refetch: refetchMessages } = useMessages(conversationId);
  const { updateInclusion, updating, error } = useUpdateMessage(refetchMessages);

  const handleToggleInclusion = async () => {
    await updateInclusion(message.id, !message.included);
  };

  return (
    <div>
      <MessageContent>{message.content}</MessageContent>
      <IncludeToggle
        included={message.included}
        loading={updating}
        onToggle={handleToggleInclusion}
      />
      {error && <ErrorMessage error={error} />}
    </div>
  );
}
```

## Future Extension Points

- Support for content updates (not needed in MVP)
- Support for role changes (not needed in MVP)
- Batch update operations (not needed in MVP)

## Out of Scope

- Message content editing functionality (not in MVP)
- Message deletion functionality (not in MVP)
- Message role changes (not in MVP)
- Advanced optimistic update strategies beyond inclusion flags

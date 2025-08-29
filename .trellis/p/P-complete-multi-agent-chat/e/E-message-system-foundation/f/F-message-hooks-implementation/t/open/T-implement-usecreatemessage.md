---
id: T-implement-usecreatemessage
title: Implement useCreateMessage hook for message creation
status: open
priority: high
parent: F-message-hooks-implementation
prerequisites:
  - T-implement-usemessages-hook
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T17:17:29.977Z
updated: 2025-08-29T17:17:29.977Z
---

# Implement useCreateMessage Hook

## Context

Create the message creation hook following patterns from `useConversationAgents` (lines 138-154). This hook handles creating new messages (user or system) with proper error handling and real-time UI synchronization.

## Technical Requirements

### File Location

- Create `apps/desktop/src/hooks/messages/useCreateMessage.ts`
- Follow mutation pattern from `addAgent` function in useConversationAgents

### Implementation Details

**Hook Signature:**

```typescript
export function useCreateMessage(
  refetchMessages: () => Promise<void>,
): UseCreateMessageResult;
```

**Return Interface:**

```typescript
interface UseCreateMessageResult {
  createMessage: (input: CreateMessageInput) => Promise<void>;
  sending: boolean;
  error: Error | null;
}
```

**Core Functionality:**

1. **Message Creation**: Call `window.electronAPI.messages.create(input)` via IPC
2. **Input Validation**: Validate CreateMessageInput before IPC call
3. **Loading States**: Track sending state during async operations
4. **Error Handling**: Provide detailed error messages for failures
5. **Real-time Sync**: Trigger refetch after successful creation
6. **State Management**: Reset sending state and error state appropriately

### Pattern Consistency Requirements

**Follow useConversationAgents.addAgent pattern exactly:**

- Accept refetch function as parameter for real-time sync
- Use sending/error state management pattern
- Call refetch after successful creation
- Handle errors by setting error state (don't throw)
- Use proper TypeScript typing throughout

### Integration Points

**Dependencies:**

- Import `CreateMessageInput` type from `@fishbowl-ai/shared`
- Use `useServices()` from `../../contexts` for logging
- Receive refetch function from parent component using useMessages

**IPC Interface:**

- `window.electronAPI.messages.create(input: CreateMessageInput): Promise<Message>`

## Acceptance Criteria

### Functional Requirements

- ✅ Accepts refetch function parameter for real-time sync
- ✅ Returns UseCreateMessageResult interface with all required properties
- ✅ Creates messages via `window.electronAPI.messages.create()`
- ✅ Accepts CreateMessageInput with conversation_id, role, content
- ✅ Validates input before making IPC call (non-empty content, valid conversation_id)
- ✅ Handles user messages (role: 'user') and system messages (role: 'system')
- ✅ Provides sending state during message creation
- ✅ Includes comprehensive error handling with user-friendly messages

### State Management Requirements

- ✅ Sets sending: true at start of creation process
- ✅ Clears error state when starting new creation
- ✅ Sets sending: false after completion (success or failure)
- ✅ Sets error state on failures with descriptive messages
- ✅ Triggers refetch after successful creation for real-time UI updates

### Error Handling Requirements

- ✅ Validates CreateMessageInput fields before IPC call
- ✅ Handles empty content with clear validation message
- ✅ Handles invalid conversation_id with clear error
- ✅ Handles IPC communication failures gracefully
- ✅ Provides user-friendly error messages (no internal system details)
- ✅ Logs errors with context for debugging

### Real-time Behavior Requirements

- ✅ Calls refetchMessages() after successful message creation
- ✅ Maintains UI responsiveness during creation process
- ✅ Updates message list immediately after creation
- ✅ Handles refetch failures without blocking creation success

### Unit Testing Requirements

- ✅ Create comprehensive unit tests in `__tests__/useCreateMessage.test.tsx`
- ✅ Mock `window.electronAPI.messages.create` interface
- ✅ Test successful message creation with user and system roles
- ✅ Test input validation (empty content, invalid conversation_id)
- ✅ Test sending state transitions
- ✅ Test error handling for various failure scenarios
- ✅ Test refetch triggering after successful creation
- ✅ Verify proper cleanup and state management

## Example Usage

```typescript
function MessageInput({ conversationId }: { conversationId: string }) {
  const { refetch: refetchMessages } = useMessages(conversationId);
  const { createMessage, sending, error } = useCreateMessage(refetchMessages);

  const handleSend = async (content: string) => {
    await createMessage({
      conversation_id: conversationId,
      role: "user",
      content,
    });
  };

  // UI implementation...
}
```

## Out of Scope

- Message updates functionality (handled by useUpdateMessage)
- Message deletion functionality (not in MVP)
- Agent message creation (separate from user messages)
- Message validation beyond basic input checks

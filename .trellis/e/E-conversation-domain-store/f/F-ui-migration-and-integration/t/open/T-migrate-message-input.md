---
id: T-migrate-message-input
title: Migrate message input container to use domain store orchestration
status: open
priority: high
parent: F-ui-migration-and-integration
prerequisites:
  - T-migrate-add-agent-modal-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T06:28:24.577Z
updated: 2025-09-01T06:28:24.577Z
---

## Purpose

Replace direct `electronAPI.chat.sendToAgents` calls and `useMessages` hook usage in the message input container with conversation domain store's `sendUserMessage` action, completing the orchestration migration.

## Context

The message input container (apps/desktop/src/components/input/MessageInputContainer.tsx) currently uses multiple hooks (`useCreateMessage`, `useMessages`, `useMessagesRefresh`) and direct IPC calls to `electronAPI.chat.sendToAgents`. This needs to be migrated to use the conversation domain store's unified `sendUserMessage` action exclusively.

## Detailed Implementation Requirements

### Component Migration - MessageInputContainer.tsx

Replace the existing hook usage:

```typescript
// REMOVE: Multiple hook usage
const {
  createMessage,
  sending: createSending,
  error: createError,
  reset,
} = useCreateMessage();
const { refetch } = useMessagesRefresh();
const { messages } = useMessages(conversationId);

// REMOVE: Direct IPC call
await window.electronAPI.chat.sendToAgents(conversationId, messageResult.id);
```

With conversation store integration:

```typescript
// NEW: Domain store integration
const { sendUserMessage, loading, error, activeMessages } =
  useConversationStore();

const isSending = loading.sending;
const sendError = error.sending;
const messages = activeMessages;
```

### Message Sending Flow

Replace the complex orchestration with store action:

```typescript
const MessageInput = ({ conversationId }: Props) => {
  const { sendUserMessage, loading, error, activeMessages } =
    useConversationStore();

  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        await sendUserMessage(content);
        // Store handles:
        // 1. Message creation
        // 2. Agent orchestration
        // 3. State updates
        // 4. Error handling
        setInputValue(""); // Clear input on success
      } catch (err) {
        // Error handled by store error state
        // Input remains for retry
      }
    },
    [sendUserMessage],
  );

  // Continue using activeMessages for first message detection
  const isFirstMessage = activeMessages.length === 0;

  // Use store loading state for UI
  const isSending = loading.sending;
  const sendError = error.sending;
};
```

### Continuation Message Support

Maintain existing continuation and empty content rules through store:

```typescript
const handleSendMessage = useCallback(
  async (content: string) => {
    // Store's sendUserMessage supports empty content for continuation
    await sendUserMessage(content); // content can be empty string
  },
  [sendUserMessage],
);
```

### Error Handling Integration

Use store error state with existing error display patterns:

```typescript
// Error state from store
const sendError = error.sending;

// Display error using existing patterns
if (sendError) {
  return <ErrorDisplay error={sendError} onRetry={() => {
    // Retry logic - store action handles reset
    handleSendMessage(inputValue);
  }} />;
}
```

## Acceptance Criteria

### Core Migration Requirements

- [ ] Remove `useCreateMessage`, `useMessages`, `useMessagesRefresh` hook imports and usage
- [ ] Remove direct `window.electronAPI.chat.sendToAgents` calls
- [ ] Import and use `useConversationStore` from `@fishbowl-ai/ui-shared`
- [ ] Use `sendUserMessage` action for all message sending
- [ ] Use store loading and error states for UI feedback
- [ ] Use `activeMessages` for first message detection

### Message Orchestration Requirements

- [ ] Message sending creates message and triggers agent orchestration atomically
- [ ] Continuation messages work correctly (empty content allowed)
- [ ] Loading states show during entire send operation
- [ ] Error states display appropriately on send failures
- [ ] Input clears on successful send
- [ ] Input retains content on send failure for retry
- [ ] No functional regressions in message sending flow

### State Coordination

- [ ] Messages appear in UI after confirmed write (no optimistic updates)
- [ ] Chat state coordinates properly with message sending
- [ ] Store handles all orchestration without external coordination
- [ ] Error recovery allows retry of failed sends

### Agent Enablement Check

- [ ] Continue using `useConversationAgentsContext` temporarily for agent enablement check
- [ ] **Note**: This will be migrated in a subsequent task after agent context migration is complete

## Testing Requirements

- [ ] Unit tests verify store integration works correctly
- [ ] Test message sending through sendUserMessage action
- [ ] Test continuation message support (empty content)
- [ ] Test loading and error states display properly
- [ ] Test input clearing/retention based on success/failure
- [ ] Test first message detection using activeMessages
- [ ] Integration tests verify complete message flow preserved

## Technical Approach

1. **Import consolidation**: Replace multiple hooks with single useConversationStore
2. **Action integration**: Use sendUserMessage for all message operations
3. **State mapping**: Map store states to component UI needs
4. **Error integration**: Use store error state with existing error components
5. **Loading coordination**: Use store loading state for send button state
6. **Input management**: Handle input clearing/retention appropriately

## Dependencies

- **Prerequisites**: T-migrate-add-agent-modal-to (agent management using store)
- **Store dependency**: useConversationStore with sendUserMessage action
- **Component scope**: MessageInputContainer.tsx
- **Temporary dependency**: Keep useConversationAgentsContext for agent enablement check (will be migrated later)

## Out of Scope

- Agent enablement check migration (handled in subsequent task)
- Send button component modifications (maintain existing interface)
- Chat event integration (already handled through existing patterns)
- Message validation logic changes

## Implementation Notes

- **Preserve behavior**: Maintain exact existing message sending functionality
- **Atomic operations**: Store handles message creation + orchestration atomically
- **Error boundaries**: Use existing error display patterns
- **Performance**: Ensure no regressions in input responsiveness
- **State coordination**: Let store manage all message state automatically

## Migration Strategy

- **Single action**: Replace complex orchestration with single store action
- **Error consistency**: Maintain existing error handling patterns
- **Loading states**: Use store loading for consistent UI feedback
- **Input behavior**: Preserve existing input clearing/retention logic

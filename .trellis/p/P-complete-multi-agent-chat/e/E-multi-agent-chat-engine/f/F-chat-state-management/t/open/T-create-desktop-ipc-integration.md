---
id: T-create-desktop-ipc-integration
title: Create desktop IPC integration hook for chat events
status: open
priority: medium
parent: F-chat-state-management
prerequisites:
  - T-add-chat-store-barrel-exports
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T22:43:29.394Z
updated: 2025-08-29T22:43:29.394Z
---

# Create Desktop IPC Integration Hook for Chat Events

## Context

Create a React hook that integrates the shared useChatStore with the existing IPC chat events from F-ipc-chat-bridge. This hook will use `window.electronAPI.chat.onAgentUpdate()` to sync agent status changes with the store state.

## Implementation Requirements

### File Location

- `apps/desktop/src/hooks/chat/useChatEventIntegration.ts`

### Hook Interface

```typescript
interface UseChatEventIntegrationOptions {
  conversationId: string | null;
}

interface UseChatEventIntegrationResult {
  isConnected: boolean;
  lastEventTime: string | null;
}

function useChatEventIntegration(
  options: UseChatEventIntegrationOptions,
): UseChatEventIntegrationResult;
```

### Hook Implementation Requirements

**IPC Event Integration:**

- Use existing `window.electronAPI.chat.onAgentUpdate(listener)` from F-ipc-chat-bridge
- Subscribe to IPC events on mount, unsubscribe on unmount
- Parse `AgentUpdateEvent` payload: `{ conversationAgentId, status, messageId?, error? }`

**Store State Updates:**

- Import `useChatStore` from `@fishbowl-ai/ui-shared`
- Map IPC events to store actions:
  - `status: 'thinking'` → `setAgentThinking(conversationAgentId, true)`
  - `status: 'complete'` → `setAgentThinking(conversationAgentId, false)` + `setAgentError(conversationAgentId, null)`
  - `status: 'error'` → `setAgentThinking(conversationAgentId, false)` + `setAgentError(conversationAgentId, error)`

**Conversation Context Management:**

- Clear agent states when conversationId changes
- Call `clearConversationState()` when switching conversations
- Set `processingConversationId` when events start flowing

**Event Listener Cleanup:**

- Store the unsubscribe function returned by `onAgentUpdate()`
- Call unsubscribe in useEffect cleanup
- Handle component unmount properly to prevent memory leaks

### React Patterns

**useEffect for IPC Subscription:**

```typescript
useEffect(() => {
  if (!conversationId) return;

  const unsubscribe = window.electronAPI.chat.onAgentUpdate((event) => {
    // Map event to store actions
  });

  return unsubscribe;
}, [conversationId]);
```

**Store Integration:**

```typescript
const {
  setAgentThinking,
  setAgentError,
  setProcessingConversation,
  clearConversationState,
} = useChatStore();
```

### Error Handling

**IPC Event Error Handling:**

- Wrap event handler in try-catch
- Log errors to console for debugging
- Continue processing other events if one fails
- Sanitize error messages before storing

**Connection Status Tracking:**

- Track if IPC connection is active
- Provide connection status in return value
- Handle cases where electronAPI is not available

### Unit Tests Requirements

Create `apps/desktop/src/hooks/chat/__tests__/useChatEventIntegration.test.tsx`:

**Test Coverage:**

- Test IPC event subscription and cleanup
- Test store state updates for each event type
- Test conversation switching behavior
- Test error handling for malformed events
- Test component unmount cleanup
- Test behavior when conversationId is null

**Mock Setup:**

```typescript
// Mock electronAPI.chat
const mockOnAgentUpdate = jest.fn();
const mockUnsubscribe = jest.fn();

window.electronAPI = {
  chat: {
    onAgentUpdate: mockOnAgentUpdate,
  },
} as any;
```

**Test Scenarios:**

- `thinking` event updates store correctly
- `complete` event clears thinking and error states
- `error` event sets error message and clears thinking
- Conversation change triggers state cleanup
- Multiple rapid events handled correctly

## Detailed Acceptance Criteria

**GIVEN** a conversation requires multi-agent processing
**WHEN** IPC events are received from the main process
**THEN** the integration hook should:

- ✅ Subscribe to IPC events using existing `window.electronAPI.chat.onAgentUpdate()`
- ✅ Map event types to appropriate store actions
- ✅ Handle 'thinking' status by setting agent thinking state
- ✅ Handle 'complete' status by clearing thinking and error states
- ✅ Handle 'error' status by setting error message and clearing thinking
- ✅ Clean up agent states when switching conversations
- ✅ Unsubscribe from events on component unmount
- ✅ Provide connection status information

**Event Processing Requirements:**

- Process events within 5ms of receipt
- Handle malformed events gracefully
- Support concurrent agent updates
- Maintain event order consistency

**Memory Management:**

- No memory leaks from uncleaned event listeners
- Proper cleanup when conversations change
- Unsubscribe functions called correctly

## Hook Usage Pattern

This hook will be used in chat-related components:

```typescript
function ChatContainer({ conversationId }: { conversationId: string | null }) {
  const { isConnected } = useChatEventIntegration({ conversationId });
  const { agentThinking, lastError } = useChatStore();

  // Component renders agent states
}
```

## Out of Scope

- Store implementation (handled by previous task)
- React component updates (components will use store directly)
- IPC handler implementation (already completed in F-ipc-chat-bridge)
- Message persistence (handled by repositories)

## Dependencies

- **Prerequisite:** T-add-chat-store-barrel-exports must be completed
- **IPC Infrastructure:** F-ipc-chat-bridge (completed) provides `window.electronAPI.chat.onAgentUpdate()`
- **Import:** `useChatStore` from `@fishbowl-ai/ui-shared`
- **Types:** `AgentUpdateEvent` from `apps/desktop/src/shared/ipc/chat`

## References

- IPC integration: F-ipc-chat-bridge feature
- Event types: `apps/desktop/src/shared/ipc/chat/agentUpdateEvent.ts`
- Store patterns: Existing hooks in `apps/desktop/src/hooks/`
- ElectronAPI: `apps/desktop/src/types/electron.d.ts`

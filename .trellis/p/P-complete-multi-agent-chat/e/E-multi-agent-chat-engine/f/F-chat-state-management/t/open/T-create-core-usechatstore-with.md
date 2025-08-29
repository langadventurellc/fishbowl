---
id: T-create-core-usechatstore-with
title: Create core useChatStore with transient UI state management
status: open
priority: medium
parent: F-chat-state-management
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T22:42:34.903Z
updated: 2025-08-29T22:42:34.903Z
---

# Create Core useChatStore with Transient UI State Management

## Context

Implement the core Zustand store for managing transient chat UI states during multi-agent processing. This store will be placed in the shared package since both desktop and mobile will need these UI states. The IPC integration is already complete from F-ipc-chat-bridge feature.

## Implementation Requirements

### File Location

- `packages/ui-shared/src/stores/chat/useChatStore.ts`

### Store Interface

```typescript
interface ChatStore {
  // Transient UI state only
  sendingMessage: boolean;
  agentThinking: Record<string, boolean>; // conversationAgentId -> thinking
  lastError: Record<string, string | null>; // conversationAgentId -> error
  processingConversationId: string | null;

  // Actions
  setSending: (sending: boolean) => void;
  setAgentThinking: (agentId: string, thinking: boolean) => void;
  setAgentError: (agentId: string, error: string | null) => void;
  setProcessingConversation: (conversationId: string | null) => void;
  clearAgentState: (agentId: string) => void;
  clearAllThinking: () => void;
  clearConversationState: () => void;
}
```

### Store Implementation Requirements

**State Management:**

- Use Zustand `create` function following patterns from `useAgentsStore`
- Track `sendingMessage: boolean` for input disable state
- Maintain `agentThinking: Record<string, boolean>` mapping conversationAgentId to thinking status
- Store `lastError: Record<string, string | null>` for agent-specific error display
- Track `processingConversationId: string | null` for current processing context

**Action Functions:**

- `setSending(sending: boolean)` - Control message input disable state
- `setAgentThinking(conversationAgentId: string, thinking: boolean)` - Individual agent thinking state
- `setAgentError(conversationAgentId: string, error: string | null)` - Agent-specific error messages
- `setProcessingConversation(conversationId: string | null)` - Track active conversation
- `clearAgentState(conversationAgentId: string)` - Reset specific agent state (thinking + error)
- `clearAllThinking()` - Reset all agent thinking states to false
- `clearConversationState()` - Clear processing conversation and all agent states

**Performance Optimization:**

- Use shallow comparison for object updates
- Minimize unnecessary re-renders through targeted selectors
- Avoid nested object mutations that could cause stale closures
- Use stable reference patterns for action functions

### TypeScript Integration

**Import Required Types:**

```typescript
import { create } from "zustand";
```

**Follow Existing Patterns:**

- Study `packages/ui-shared/src/stores/useAgentsStore.ts` for Zustand patterns
- Use similar state update patterns and action creators
- Follow the same TypeScript interface conventions

### Unit Tests Requirements

Create `packages/ui-shared/src/stores/chat/__tests__/useChatStore.test.ts`:

**Test Coverage:**

- Test initial state (all false/empty)
- Test `setSending` action with boolean values
- Test `setAgentThinking` with multiple agents
- Test `setAgentError` with various error states
- Test `setProcessingConversation` with conversation IDs
- Test `clearAgentState` for specific agent cleanup
- Test `clearAllThinking` resets all agent thinking states
- Test `clearConversationState` resets all state
- Test concurrent agent state updates
- Test state immutability and reference stability

**Test Patterns:**

- Follow test patterns from `packages/ui-shared/src/stores/__tests__/useAgentsStore.test.ts`
- Use Jest and proper store state assertions
- Test action functions independently and in combination
- Verify no state mutation issues

## Detailed Acceptance Criteria

**GIVEN** multi-agent chat interactions require UI feedback
**WHEN** managing temporary states during processing
**THEN** the store should:

- ✅ Track sending message state for input disable
- ✅ Maintain independent thinking states per conversationAgentId
- ✅ Store agent-specific error messages
- ✅ Support concurrent agent processing
- ✅ Provide atomic state updates with minimal re-renders
- ✅ Never store persistent data (delegate to repositories)
- ✅ Support selective state cleanup for different scenarios

**Performance Requirements:**

- State updates complete within 10ms for typical operations
- Support up to 5 simultaneous agent state updates
- Maintain state consistency during concurrent updates

## Out of Scope

- IPC integration (already handled by F-ipc-chat-bridge)
- React component integration (handled by separate task)
- Desktop-specific event handlers (will be separate integration task)
- Message persistence (handled by repositories)

## References

- Existing pattern: `packages/ui-shared/src/stores/useAgentsStore.ts`
- Epic context: E-multi-agent-chat-engine
- IPC infrastructure: F-ipc-chat-bridge (completed)

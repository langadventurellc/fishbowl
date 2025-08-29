---
id: F-chat-state-management
title: Chat State Management
status: in-progress
priority: medium
parent: E-multi-agent-chat-engine
prerequisites:
  - F-ipc-chat-bridge
affectedFiles:
  packages/ui-shared/src/stores/chat/useChatStore.ts: Created core Zustand store
    for managing transient chat UI states during multi-agent processing with
    actions for setSending, setAgentThinking, setAgentError,
    setProcessingConversation, clearAgentState, clearAllThinking, and
    clearConversationState; Added export keyword to ChatStore interface to make
    it available for barrel export
  packages/ui-shared/src/stores/chat/__tests__/useChatStore.test.ts:
    Created comprehensive unit test suite with 23 test cases covering store
    initialization, all action methods, concurrent state updates, state
    immutability, and edge cases with 100% functionality coverage
  packages/ui-shared/src/stores/chat/index.ts: Created chat store barrel export
    file with JSDoc documentation, exporting useChatStore hook and ChatStore
    type interface
  packages/ui-shared/src/stores/index.ts:
    Added chat store exports to main stores
    index using barrel export pattern (export * from './chat')
  packages/ui-shared/src/stores/chat/__tests__/index.test.ts: Created
    comprehensive barrel export test suite covering hook exports, React
    integration, TypeScript types, store functionality, and import resolution
    with 10 passing test cases
log: []
schema: v1.0
childrenIds:
  - T-add-chat-store-barrel-exports
  - T-create-desktop-ipc-integration
  - T-create-core-usechatstore-with
created: 2025-08-29T19:19:53.610Z
updated: 2025-08-29T19:19:53.610Z
---

# Chat State Management

## Purpose and Functionality

Implement transient UI state management for multi-agent chat interactions using Zustand store pattern. This feature manages temporary states like agent thinking indicators, message sending status, and error states that don't need database persistence.

## Key Components to Implement

### useChatStore (`apps/desktop/src/stores/chat/useChatStore.ts`)

- Zustand store for transient chat UI states
- Agent-specific thinking indicators and error states
- Message sending status and coordination
- Actions for state updates during multi-agent processing

### Store Integration (`apps/desktop/src/stores/chat/index.ts`)

- Barrel exports for chat store modules
- Type definitions for chat store interfaces
- Integration with existing store patterns

### IPC Event Listeners (`apps/desktop/src/stores/chat/chatEventHandlers.ts`)

- Handlers for `agent:update` IPC events from main process
- Real-time state updates based on multi-agent processing events
- Event cleanup and memory management

## Detailed Acceptance Criteria

### useChatStore State Management

- **GIVEN** chat interactions require UI feedback
- **WHEN** managing temporary states during multi-agent processing
- **THEN** the store should:
  - Track `sendingMessage: boolean` for input disable state
  - Maintain `agentThinking: Record<string, boolean>` mapping conversationAgentId to thinking status
  - Store `lastError: Record<string, string>` for agent-specific error display
  - Track `processingConversationId: string | null` for current processing context
  - Provide `clearAllThinking()` action to reset all agent states
  - **NOT store persistent data** - delegate to repositories via hooks
  - Support concurrent agent processing with independent state tracking

### Store Actions and Updates

- **GIVEN** multi-agent chat events occur
- **WHEN** state updates are triggered
- **THEN** the store should provide:
  - `setSending(sending: boolean)` - Control message input disable state
  - `setAgentThinking(conversationAgentId: string, thinking: boolean)` - Individual agent thinking state
  - `setAgentError(conversationAgentId: string, error: string | null)` - Agent-specific error messages
  - `setProcessingConversation(conversationId: string | null)` - Track active conversation
  - `clearAgentState(conversationAgentId: string)` - Reset specific agent state
  - All actions should be atomic and cause minimal re-renders

### IPC Event Integration

- **GIVEN** main process emits `agent:update` events during processing
- **WHEN** events are received in renderer process
- **THEN** the event handlers should:
  - Parse event payload: `{ conversationAgentId, status: 'thinking' | 'complete' | 'error', messageId?, error? }`
  - Update corresponding agent state based on status
  - Handle 'thinking' status by setting `agentThinking[conversationAgentId] = true`
  - Handle 'complete' status by setting `agentThinking[conversationAgentId] = false` and clearing errors
  - Handle 'error' status by setting error message and clearing thinking state
  - Trigger message refetch on 'complete' status for UI updates
  - Clean up event listeners to prevent memory leaks
  - Subscribe via `window.electronAPI.chat.onAgentUpdate(listener)` exposed by preload and ensure to call the returned unsubscribe during cleanup

### State Persistence and Cleanup

- **GIVEN** conversation switching or app lifecycle events
- **WHEN** cleaning up transient state
- **THEN** the store should:
  - Clear all agent thinking states when switching conversations
  - Reset error states appropriately (preserve or clear based on context)
  - Clean up processing state when conversations close
  - Maintain state only for active conversation context
  - Provide selective cleanup methods for different scenarios

### Store Performance Optimization

- **GIVEN** frequent state updates during multi-agent processing
- **WHEN** managing store performance
- **THEN** the implementation should:
  - Use shallow comparison for object updates
  - Minimize unnecessary re-renders through targeted selectors
  - Batch related state updates when possible
  - Avoid nested object mutations that could cause stale closures
  - Use stable reference patterns for action functions

## Implementation Guidance

### Technology Approach

- Follow existing store patterns from `useAgentsStore` and other Zustand stores
- Use TypeScript interfaces for type safety across store boundaries
- Implement proper action creators with payload typing
- Use immer pattern for immutable state updates if needed
- Follow React hooks optimization patterns

### State Structure Design

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

### IPC Integration Pattern

- Use existing IPC event patterns from the application
- Set up event listeners in appropriate component lifecycle hooks
- Handle event cleanup to prevent memory leaks
- Provide error boundaries for IPC event processing
- Consume events exclusively through the preload chat API (`electronAPI.chat.onAgentUpdate`) rather than accessing `ipcRenderer` directly

### Error Handling Strategy

- Store only user-friendly error messages in state
- Optional: Provide timeout handling for stuck thinking states (defer for MVP if not needed)
- Handle malformed IPC events gracefully
- Log structured errors for debugging without exposing sensitive data

## Testing Requirements

### Unit Tests

- Test all store actions with various state combinations
- Verify state immutability and update patterns
- Test IPC event handler logic with mock events
- Validate state cleanup and memory management
- Test concurrent agent state updates

### Integration Tests

- Test store integration with React components
- Verify IPC event flow from main process to store updates
- Test multi-agent scenarios with various thinking/error combinations
- Validate performance with frequent state updates

### Component Integration Tests

- Test AgentPill component integration with thinking states
- Verify MessageInput disable state during processing
- Test error display components with store error states

## Security Considerations

### Data Exposure

- Never store sensitive data (API keys, tokens) in renderer store
- Validate IPC event data before processing
- Sanitize error messages before display
- Ensure no cross-conversation data leakage

### State Isolation

- Isolate conversation-specific state appropriately
- Prevent unauthorized state access across conversation boundaries
- Clean up state when conversations are deleted or access is revoked

## Performance Requirements

### Response Time

- State updates complete within 10ms for typical operations
- IPC event processing within 5ms of event receipt
- UI re-renders complete within 16ms for 60fps performance

### Memory Usage

- Store size remains under 1MB for typical usage patterns
- No memory leaks from uncleaned event listeners
- Efficient garbage collection of stale state

### Concurrent Operations

- Handle up to 5 simultaneous agent state updates
- Support rapid state changes during parallel agent processing
- Maintain state consistency during concurrent updates

## Dependencies

### Internal Dependencies

- Existing Zustand store patterns and utilities
- IPC infrastructure for `agent:update` events
- React hooks and context patterns
- TypeScript interfaces from shared package

### Component Dependencies

- AgentPill components (for thinking indicators)
- MessageInput components (for disable state)
- Error display components (for agent-specific errors)
- Chat container components (for state coordination)

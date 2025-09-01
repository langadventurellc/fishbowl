---
id: T-implement-core-conversation
title: Implement core conversation store with Zustand and service injection
status: open
priority: high
parent: F-conversation-domain-store
prerequisites:
  - T-create-conversation-store
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T04:38:06.302Z
updated: 2025-09-01T04:38:06.302Z
---

## Context

Implement the main conversation domain store using Zustand, following existing store patterns like `useChatStore`. The store manages active conversation focus with dependency injection for the ConversationService.

## Implementation Requirements

**File to create**: `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

**Core Implementation**:

1. **Store Creation** using Zustand `create<ConversationStore>()` pattern
2. **Initial State** matching the type definitions:
   - All arrays empty, loading states false, no active conversation
   - `maximumMessages: 100` as default
   - Clean error state initialization

3. **Service Injection Pattern**:

   ```typescript
   // Store service reference privately
   let conversationService: ConversationService | null = null;

   // Initialize action for dependency injection
   initialize: (service: ConversationService) => {
     conversationService = service;
   };
   ```

4. **Core Actions Implementation**:
   - `loadConversations()` - Load conversation list with loading states
   - `selectConversation(id)` - Switch active conversation, clear chat state
   - `createConversationAndSelect(title?)` - Atomic create and select
   - `refreshActiveConversation()` - Reload active conversation data

**Technical Approach**:

- Follow `useChatStore` patterns for state updates using plain object spreading
- Use `set((state) => ({ ...state, ... }))` pattern for immutable updates
- Implement proper error handling converting service errors to ErrorState
- Add request token generation for race condition handling
- Import and coordinate with `useChatStore.clearConversationState()`

**Error Handling Pattern**:

```typescript
try {
  set((state) => ({
    ...state,
    loading: { ...state.loading, conversations: true },
    error: { ...state.error, conversations: undefined },
  }));
  const result = await conversationService!.listConversations();
  set((state) => ({
    ...state,
    conversations: result,
    loading: { ...state.loading, conversations: false },
  }));
} catch (error) {
  set((state) => ({
    ...state,
    loading: { ...state.loading, conversations: false },
    error: {
      ...state.error,
      conversations: {
        message: error.message,
        operation: "load",
        isRetryable: true,
        retryCount: 0,
        timestamp: new Date().toISOString(),
      },
    },
  }));
}
```

## Acceptance Criteria

- [ ] Store follows existing Zustand patterns from codebase
- [ ] Service injection works correctly with initialize action
- [ ] All actions update state using plain immutable updates (no Immer)
- [ ] Loading states properly managed for all operations
- [ ] Service errors converted to ErrorState pattern
- [ ] `selectConversation` clears chat state automatically
- [ ] Request token pattern implemented for race conditions
- [ ] Store compiles without TypeScript errors
- [ ] File size ≤300 LOC as specified

## Testing Requirements

- [ ] Unit tests for store initialization and service injection
- [ ] Test all actions update state correctly with mock service
- [ ] Verify error handling converts service errors to ErrorState
- [ ] Test race condition handling with request tokens
- [ ] Verify chat state clearing coordination

## Dependencies

- Requires type definitions from previous task
- Requires `ConversationService` interface
- Requires `useChatStore` for coordination
- Requires `ErrorState` interface

## Out of Scope

- Message management actions (separate task)
- Agent management actions (separate task)
- Selectors implementation
- Complete integration testing

---
id: F-conversation-domain-store
title: Conversation Domain Store Implementation
status: in-progress
priority: medium
parent: E-conversation-domain-store
prerequisites:
  - F-end-to-end-wiring-validation
affectedFiles:
  packages/ui-shared/src/stores/conversation/ConversationStoreState.ts:
    Created main state interface for conversation store with
    activeConversationId, conversations array, activeMessages array,
    activeConversationAgents array, activeRequestToken for race conditions,
    loading states object, error states using ErrorState pattern, and
    maximumMessages configuration
  packages/ui-shared/src/stores/conversation/ConversationStoreActions.ts:
    Created actions interface with all required conversation store operations
    including initialize, loadConversations, selectConversation,
    createConversationAndSelect, refreshActiveConversation, sendUserMessage,
    addAgent, removeAgent, and toggleAgentEnabled methods
  packages/ui-shared/src/stores/conversation/ConversationStore.ts:
    Created combined store type merging ConversationStoreState and
    ConversationStoreActions interfaces
  packages/ui-shared/src/stores/conversation/index.ts:
    Created barrel exports file
    for clean conversation store type imports; Added barrel export for
    useConversationStore to enable clean imports from the conversation store
    package
  packages/ui-shared/src/stores/index.ts:
    Added conversation store exports to main
    stores barrel file following established patterns
  packages/ui-shared/src/stores/conversation/useConversationStore.ts:
    "Created core Zustand conversation store with service injection, race
    condition protection, and complete conversation lifecycle management
    including loadConversations, selectConversation,
    createConversationAndSelect, refreshActiveConversation, sendUserMessage,
    addAgent, removeAgent, and toggleAgentEnabled actions; Extended conversation
    store with three new message management actions: loadMessages() for explicit
    message loading with client-side trimming and race condition protection,
    updated sendUserMessage() to support continuation messages (empty content
    allowed) and apply memory limits atomically, deleteMessage() for removing
    individual messages with proper state synchronization. Added
    applyMessageLimit() helper function for consistent client-side message
    trimming that maintains chronological order. All actions follow established
    ErrorState patterns and include proper loading state management.; Added
    ConversationAgent import and implemented four agent management actions:
    loadConversationAgents() for loading agents with race condition protection,
    addAgent() with optimistic state updates and request token validation,
    removeAgent() with direct array filtering, and toggleAgentEnabled() with
    atomic state updates using service response"
log: []
schema: v1.0
childrenIds:
  - T-create-barrel-exports-and-1
  - T-create-conversation-store-1
  - T-implement-conversation-agent-2
  - T-create-conversation-store
  - T-implement-core-conversation
  - T-implement-message-management
created: 2025-09-01T02:21:00.818Z
updated: 2025-09-01T02:21:00.818Z
---

## Purpose

Implement the single unified conversation domain store that manages complete conversation lifecycle with active-conversation focus, replacing fragmented state ownership across multiple hooks and components. This store coordinates conversations, messages, and agents through the ConversationService interface using existing codebase patterns.

## Key Components

### Main Store Implementation

- **Location**: `packages/ui-shared/src/stores/conversation/useConversationStore.ts`
- **Size limit**: ≤300 LOC initially (extract when it grows)
- **Architecture**: Zustand store with dependency injection for ConversationService
- **Focus**: Active conversation only + configurable message cap
- **State updates**: Plain immutable updates (match existing store patterns, no Immer)

### Supporting Files

- **Types**: `packages/ui-shared/src/stores/conversation/types.ts`
- **Selectors**: `packages/ui-shared/src/stores/conversation/selectors.ts` (minimal, centralized transforms)
- **Index**: `packages/ui-shared/src/stores/conversation/index.ts`

## Detailed Acceptance Criteria

### Core State Management

- [ ] Store manages activeConversationId with automatic chat state clearing
- [ ] Conversations list loaded and maintained centrally
- [ ] activeMessages array for current conversation only (not multi-conversation cache)
- [ ] activeConversationAgents for current conversation agents
- [ ] Loading states for all major operations (conversations, messages, agents, sending)
- [ ] Error handling: Store converts thrown service errors to ErrorState patterns

### State Shape Implementation

```typescript
interface ConversationStoreState {
  // Core state
  activeConversationId: string | null;
  conversations: Conversation[];
  activeMessages: Message[];
  activeConversationAgents: ConversationAgent[];

  // Active request tracking for race conditions
  activeRequestToken: string | null;

  // Loading states
  loading: {
    conversations: boolean;
    messages: boolean;
    agents: boolean;
    sending: boolean;
  };

  // Error handling - store converts service errors to ErrorState
  error: {
    conversations?: ErrorState;
    messages?: ErrorState;
    agents?: ErrorState;
    sending?: ErrorState;
  };

  // Configuration
  maximumMessages: number;
}
```

### Key Actions Implementation

- [ ] `initialize(service: ConversationService)` - Dependency injection setup
- [ ] `loadConversations()` - Load and cache conversation list
- [ ] `selectConversation(id | null)` - Switch active conversation with chat state clearing
- [ ] `createConversationAndSelect(title?)` - Atomic create and select operation
- [ ] `refreshActiveConversation()` - Reload active conversation data with race protection
- [ ] `sendUserMessage(content?)` - Create message then trigger orchestration
- [ ] `addAgent(conversationId, agentId)` - Add agent to conversation
- [ ] `removeAgent(conversationId, agentId)` - Remove agent from conversation
- [ ] `toggleAgentEnabled(conversationAgentId)` - Enable/disable conversation agent

### Error Handling Pattern

- [ ] Store catches service errors and converts to ErrorState
- [ ] Service layer throws standard errors (adapter doesn't use ErrorState)
- [ ] Consistent ErrorState usage across all operations
- [ ] Error clearing before operations
- [ ] Meaningful error messages for users

### Memory Management Policy

- [ ] Active conversation focus - clear messages on conversation switch
- [ ] Configurable maximumMessages with client-side trimming
- [ ] No multi-conversation message caching (keep it simple)
- [ ] Clear data appropriately to prevent memory leaks

### Race Condition Handling

- [ ] Active request token generation per operation
- [ ] Stale result filtering when activeConversationId changes
- [ ] Token validation before state updates
- [ ] Simple pattern - ignore outdated results, no complex cancellation

### State Update Implementation

- [ ] **Plain immutable updates**: Follow existing store patterns, don't add Immer dependency
- [ ] Batched state updates to minimize re-renders
- [ ] Efficient state spreading and updates
- [ ] Focus on active conversation performance

### Selector Strategy

- [ ] **Minimal selectors**: Keep selector logic simple and centralized
- [ ] **MessageViewModel centralization**: If needed, create one central transform selector
- [ ] **Reuse pattern**: Let useMessagesWithAgentData call centralized selector to avoid duplication
- [ ] Don't over-engineer selector layer

### Integration with Existing Stores

- [ ] Automatic useChatStore state clearing on conversation selection
- [ ] Coordinate processingConversationId with ChatStore
- [ ] Follow existing error handling patterns from other stores
- [ ] Maintain consistency with current store architecture

### Implementation Guidance

- **Match existing patterns**: Follow current Zustand store structure in codebase
- **Plain immutable updates**: Use existing store update patterns, no new dependencies
- **Error conversion**: Store converts service errors to ErrorState, service throws standard errors
- **Performance focus**: Optimize for active conversation, not multi-conversation caching

### Testing Requirements

- [ ] Store initializes correctly with injected service
- [ ] All actions update state appropriately using plain immutable updates
- [ ] Race condition handling prevents stale updates
- [ ] Error states managed correctly (service errors converted to ErrorState)
- [ ] Memory management (message trimming) works as expected
- [ ] Integration with useChatStore functions properly

### Security Considerations

- [ ] No credentials stored in store state
- [ ] Input validation delegated to service layer
- [ ] Error messages don't expose sensitive data
- [ ] Race condition handling prevents data corruption

### Performance Requirements

- [ ] Batched state updates minimize re-renders
- [ ] Memory usage controlled through message limits
- [ ] Store operations don't block UI interactions
- [ ] Focus on active conversation performance over global optimization

## Technical Specifications

### Service Integration Pattern

```typescript
export const useConversationStore = create<ConversationStoreState>(
  (set, get) => ({
    // Initial state
    activeConversationId: null,
    conversations: [],
    activeMessages: [],
    // ... other state

    // Actions with service dependency
    initialize: (service: ConversationService) => {
      // Store service reference and initialize
    },

    selectConversation: async (id: string | null) => {
      // Generate request token
      // Clear chat store state
      // Load conversation data with plain immutable updates
      // Handle race conditions
    },
  }),
);
```

### Error Handling Pattern

```typescript
try {
  const result = await service.someOperation();
  set((state) => ({
    ...state,
    data: result,
    error: { ...state.error, operation: undefined },
  }));
} catch (error) {
  set((state) => ({
    ...state,
    error: {
      ...state.error,
      operation: { message: error.message, timestamp: Date.now() },
    },
  }));
}
```

### State Update Optimization

- Use plain object spreading for immutable updates
- Batch related state changes in single set() call
- Minimize unnecessary re-renders through careful state structure
- Focus on active conversation performance

## Dependencies

- **Prerequisites**: F-end-to-end-wiring-validation (proven service layer)
- **Service dependency**: ConversationService interface implementation
- **Store dependencies**: Coordinate with existing useChatStore
- **Type dependencies**: Message, Conversation, ConversationAgent types
- **Pattern consistency**: Follow existing store patterns in codebase

## Implementation Notes

- Keep initial implementation simple and focused
- Match existing codebase store patterns exactly
- Add complexity only when proven necessary
- Focus on replacing fragmented state management with centralized coordination
- Plan for gradual migration from existing state management

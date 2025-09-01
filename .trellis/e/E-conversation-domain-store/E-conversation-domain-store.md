---
id: E-conversation-domain-store
title: Conversation Domain Store Architecture Design
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  packages/shared/src/services/conversations/ConversationService.ts:
    Created main interface file with type-only imports of Conversation, Message,
    ConversationAgent, and CreateMessageInput from existing shared package
    locations. Includes comprehensive TypeDoc documentation explaining Platform
    Abstraction Pattern and empty interface structure ready for method
    implementations in subsequent tasks.
  packages/shared/src/services/conversations/index.ts:
    Created barrel export file
    providing clean import path for ConversationService interface following
    established shared package patterns.
  packages/shared/src/services/conversations/__tests__/ConversationService.test.ts:
    "Created comprehensive test suite with 3 tests: interface type validation,
    import resolution verification, and barrel export confirmation. All tests
    pass and verify TypeScript compilation works correctly."
log: []
schema: v1.0
childrenIds:
  - F-conversation-domain-store
  - F-conversationservice-interface
  - F-desktop-ipc-adapter
  - F-end-to-end-wiring-validation
  - F-enhanced-ipc-event-integration
  - F-ui-migration-and-integration
created: 2025-09-01T01:59:54.406Z
updated: 2025-09-01T01:59:54.406Z
---

## Purpose and Goals

Design a unified conversation domain store architecture to replace the current fragmented state management system in the Fishbowl chat application. This epic addresses the "big ball of mud" architecture where conversations, messages, agents, and chat state are scattered across multiple hooks and components with no centralized coordination.

**Scope**: Simple, pragmatic solution for single-user desktop application - avoid over-engineering.

## Problem Statement

Current architecture suffers from:

- **Fragmented state ownership**: selectedConversationId in component state, conversations/messages in separate hooks, transient UI state isolated in useChatStore
- **Manual refetching**: Repeated refetch() calls to maintain synchronization after operations
- **Implicit coordination**: Chat state clearing and orchestration triggered from disparate components
- **No unified domain owner**: Selection, lists, messages, agents coordinated by components rather than a domain service

## Major Components and Deliverables

### 1. Simple Platform-Agnostic Service Interface

- **ConversationService interface** in `packages/shared/src/services/conversations/`
- Clean ports for conversations, messages, and conversation-agents operations
- Eliminates direct window.electronAPI calls from UI components
- **No pagination complexity** - client-side message capping only

### 2. Desktop IPC Adapter Implementation

- **ConversationIpcAdapter** in `apps/desktop/src/renderer/services/`
- Wraps existing electronAPI calls using existing ErrorState model
- Provides clean platform boundary for future mobile implementation
- Implements against existing window.electronAPI patterns

### 3. Single Conversation Domain Store

- **One store file** ≤300 LOC initially, extract when it grows
- **Active conversation focus** - cache only active conversation messages
- **Simple memory management** - configurable maximumMessages cap
- **Existing error patterns** - reuse ErrorState across operations

### 4. Enhanced Integration Architecture

- **Enhanced IPC event integration** with conversationId in AgentUpdateEvent
- **Active request token** pattern for race condition handling
- **Simple message management** - no optimistic updates in v1
- **Selector-based view models** - reuse existing patterns

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] ConversationService interface provides clean operations without pagination complexity
- [ ] Desktop IPC adapter reuses existing ErrorState model consistently
- [ ] Conversation domain store manages complete conversation lifecycle with active-conversation focus
- [ ] Message management with simple client-side capping (configurable maximumMessages)
- [ ] Agent management coordinated through domain store
- [ ] Store actions coordinate with useChatStore with automatic clearing on conversation selection

### Architecture Quality Standards

- [ ] **File organization**: Start simple with one store file ≤300 LOC plus types
- [ ] **Memory policy**: Active conversation only + configurable message cap (no LRU complexity)
- [ ] **Race condition safety**: Active request token pattern for operation filtering
- [ ] **Error handling**: Consistent ErrorState usage across all operations
- [ ] **Performance**: Batched state updates for simultaneous operations

### Enhanced Integration Requirements

- [ ] **Event payload enhancement**: Add conversationId to AgentUpdateEvent (update preload/renderer and chatHandlers)
- [ ] **No optimistic UX**: Render after confirmed write in v1
- [ ] **Selector strategy**: Provide MessageViewModel selectors using Agents/Roles stores
- [ ] **Chat event coordination**: Direct conversationId filtering without reverse mapping

### Migration and Compatibility

- [ ] **Phase 1-2**: Move selection, conversations list, messages, agents into store - eliminate UI refetch() calls
- [ ] **Phase 3**: Implement sendUserMessage() (create message + trigger orchestration)
- [ ] **Phase 4**: Add optimistic insert behind feature flag if UX requires it
- [ ] **Future**: Add retention policy only if memory becomes an issue

## Technical Specifications

### Simplified ConversationService Interface

```typescript
export interface ConversationService {
  listConversations(): Promise<Conversation[]>;
  createConversation(title?: string): Promise<Conversation>;
  renameConversation(id: string, title: string): Promise<void>;
  deleteConversation(id: string): Promise<void>;

  listMessages(conversationId: string): Promise<Message[]>; // No pagination params
  createMessage(input: CreateMessageInput): Promise<Message>;
  deleteMessage(id: string): Promise<void>;

  listConversationAgents(conversationId: string): Promise<ConversationAgent[]>;
  addAgent(conversationId: string, agentId: string): Promise<ConversationAgent>;
  removeAgent(conversationId: string, agentId: string): Promise<void>;
  updateConversationAgent(
    conversationAgentId: string,
    updates: Partial<ConversationAgent>,
  ): Promise<ConversationAgent>;

  sendToAgents(conversationId: string, userMessageId: string): Promise<void>;
}
```

### Domain Store State Shape

```typescript
interface ConversationStoreState {
  // Core state
  activeConversationId: string | null;
  conversations: Conversation[];
  activeMessages: Message[]; // Only active conversation, not Record<string, Message[]>
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

  // Error handling using existing ErrorState
  error: {
    conversations?: ErrorState;
    messages?: ErrorState;
    agents?: ErrorState;
    sending?: ErrorState;
  };

  // Configuration
  maximumMessages: number; // Client-side message cap
}
```

### Key Actions Architecture

- `initialize(service)` - Platform adapter injection
- `loadConversations()` - Load conversation list
- `selectConversation(id | null)` - With automatic chat state clearing and request token management
- `createConversationAndSelect(title?)` - Atomic operation (no optimistic updates)
- `refreshActiveConversation()` - Unified sync with request token guard
- `sendUserMessage(content?)` - Create message then trigger orchestration (no optimistic UI)
- `addAgent/removeAgent/toggleAgentEnabled(conversationAgentId)` - Agent management

### Simple Memory Management Policy

- **Focus**: Active conversation only
- **Message limits**: Configurable maximumMessages with client-side trimming
- **No caching**: Clear messages when switching conversations
- **Performance**: Batch updates for simultaneous operations

### Enhanced Chat Event Integration

- **Event payload**: Add conversationId to AgentUpdateEvent (update preload/renderer and chatHandlers.createEventEmitter)
- **Direct filtering**: Use conversationId directly, no reverse mapping needed
- **Processing state**: Coordinate ChatStore.processingConversationId with domain store
- **Request token**: Filter stale responses using active request token

### Race Condition Handling

- **Active request token**: Generate unique token per operation
- **Stale result filtering**: Discard responses when activeConversationId or token changes
- **Simple pattern**: No complex cancellation, just ignore outdated results

## File Organization Strategy (Start Simple)

### Initial Structure

- `packages/ui-shared/src/stores/conversation/types.ts` - State and action types
- `packages/ui-shared/src/stores/conversation/useConversationStore.ts` - Main store (≤300 LOC)
- `packages/ui-shared/src/stores/conversation/selectors.ts` - MessageViewModel selectors
- `packages/ui-shared/src/stores/conversation/index.ts` - Barrel exports

### Service Interface

- `packages/shared/src/services/conversations/ConversationService.ts`
- `packages/shared/src/services/conversations/index.ts`

### Desktop Adapter

- `apps/desktop/src/renderer/services/ConversationIpcAdapter.ts`

**Future**: Extract into more files only when store actually grows beyond 300 LOC

## Migration Phase Acceptance Criteria

### Phase 1-2: Core Migration

- [ ] Sidebar reads conversations from store exclusively
- [ ] selectConversation action clears ChatStore state automatically
- [ ] Create/delete/rename operations go through store actions
- [ ] Main content uses activeMessages/activeConversationAgents from store
- [ ] All UI refetch() calls eliminated - store owns consistency
- [ ] Zero regressions in conversation/message behavior

### Phase 3: Orchestration

- [ ] Input component uses sendUserMessage action exclusively
- [ ] No direct electronAPI.chat.sendToAgents calls remain
- [ ] Continuation and empty content rules maintained
- [ ] Messages render after confirmed write (no optimistic updates)

### Phase 4: Optional Enhancements

- [ ] Optimistic message insert behind feature flag (if UX requires)
- [ ] Retention policy (if memory becomes an issue)
- [ ] File extraction (if store grows beyond 300 LOC)

## Risk Mitigation Strategies

### Simplicity Focus

- Start with minimal feature set
- Add complexity only when proven necessary
- Measure before optimizing (memory, performance)
- Feature flags for experimental features

### Migration Risk Reduction

- Feature flags for gradual rollout
- Rollback plan for each migration phase
- Focus on core functionality first
- Comprehensive regression testing

## Performance Considerations

### State Update Optimization

- Batch simultaneous updates (messages + agents)
- Use immer for immutable updates
- Focus on active conversation performance
- Monitor re-render frequency

### Memory Efficiency

- Active conversation only (no multi-conversation cache)
- Client-side message trimming with configurable limits
- Clear data on conversation switch
- Simple garbage collection

## Dependencies on Other Epics

- None - This is a standalone design epic that will inform future implementation epics

## Estimated Scale (Simplified)

- **Design deliverables**: 4-6 architectural documents
- **Interface definitions**: 3-4 TypeScript interfaces (no pagination complexity)
- **Store design**: 1 focused Zustand store specification (≤300 LOC)
- **Migration strategy**: 3-phase implementation plan (Phase 4 optional)
- **File organization**: 4-6 files initially

## User Stories

**As a developer**, I want a single point of coordination for conversation state so that I don't need to manually synchronize multiple hooks and components.

**As a developer**, I want simple conversation management so that the solution doesn't over-engineer for a single-user desktop app.

**As a developer**, I want clear platform boundaries so that mobile implementation can reuse the domain store with different adapters.

**As a maintainer**, I want straightforward architecture so that the codebase remains maintainable without unnecessary complexity.

## Non-functional Requirements

### Simplicity

- Avoid over-engineering for single-user desktop context
- Start simple, add complexity only when needed
- Clear, predictable patterns
- Minimal file proliferation

### Performance

- Focus on active conversation performance
- Batch related state updates
- Simple memory management
- Responsive UI during conversation switching

### Maintainability

- Single store file until growth necessitates splitting
- Reuse existing error handling patterns (ErrorState)
- Clear migration path with minimal risk
- Self-documenting store actions

### Testability

- Domain store logic testable with mock services
- Platform adapters testable independently
- Simple integration points for focused testing
- No complex caching logic to test

## MVP Scope Summary

### Include in V1

- Single conversation domain store with active conversation focus
- ConversationService adapter with simple operations
- Enhanced AgentUpdateEvent with conversationId
- Automatic ChatStore clearing on conversation selection
- Client-side message capping
- Existing ErrorState error handling
- Active request token for race condition safety

### Exclude from V1 (Add Later If Needed)

- Pagination with cursors/beforeId
- Multi-conversation message caching
- LRU retention policies
- Optimistic UI updates
- Complex file organization
- Advanced memory management

The design prioritizes solving the immediate "big ball of mud" problem with a simple, maintainable solution appropriate for a single-user desktop application.

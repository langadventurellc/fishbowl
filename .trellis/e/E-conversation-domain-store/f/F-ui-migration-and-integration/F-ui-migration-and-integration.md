---
id: F-ui-migration-and-integration
title: UI Migration and Integration
status: in-progress
priority: medium
parent: E-conversation-domain-store
prerequisites:
  - F-conversation-domain-store
affectedFiles:
  apps/desktop/src/contexts/ServicesProvider.tsx:
    Extended existing provider with
    useConversationStore import and useEffect hook for conversation store
    initialization. Added useMemo for services instance to prevent unnecessary
    re-renders, proper error handling with console.error fallback, and race
    condition protection with mounted flag. Follows established dependency
    injection patterns from other providers in the codebase.
  apps/desktop/src/contexts/__tests__/ServicesProvider.test.tsx:
    "Created comprehensive unit test suite with 7 test cases covering: service
    provision to child components, conversation store initialization with
    correct service instance, custom services instance handling, error handling
    gracefully without app crash, prevention of re-initialization on re-renders
    with same services, re-initialization when services instance changes, and
    default RendererProcessServices creation. Includes proper mocking of all
    dependencies and TypeScript type safety."
  apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx:
    "Migrated from useConversations/useCreateConversation hooks to
    useConversationStore from @fishbowl-ai/ui-shared. Replaced direct hook usage
    with store actions: selectConversation() for conversation selection,
    createConversationAndSelect() for conversation creation, loadConversations()
    for data refresh. Eliminated all manual refetch() calls in
    handleDeleteConversation and RenameConversationModal onOpenChange handler.
    Added backward compatibility mapping for loading states (isCreating =
    loading.sending). Maintained exact existing UI behavior while transitioning
    to centralized domain store pattern."
  apps/desktop/src/components/layout/MainContentPanelDisplay.tsx:
    Migrated from useMessagesWithAgentData composite hook to conversation domain
    store. Added useConversationStore, useAgentsStore, and useRolesStore
    imports. Moved message enrichment logic into component with useMemo for
    performance. Updated imports to remove useMessagesWithAgentData and use
    conversation store actions. Updated MessagesRefreshContext.Provider to use
    store's refreshActiveConversation instead of hook refetch. Updated interface
    types to match ErrorState from store.
  apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx:
    Migrated from useConversationAgentsContext to useConversationStore and
    useAgentsStore. Updated imports to use @fishbowl-ai/ui-shared stores.
    Replaced context state mapping with store state (activeConversationAgents ->
    conversationAgents, loading.agents -> isLoading, error.agents ->
    agentsError). Added agent configuration lookup logic to transform
    ConversationAgent objects to AgentPillViewModel using agent_id field.
    Replaced toggleEnabled action with toggleAgentEnabled store action. Updated
    error handling to use ErrorState pattern. Removed manual refetch calls in
    AddAgentToConversationModal onAgentAdded callback. Maintained exact existing
    functionality while transitioning to centralized domain store pattern.
  apps/desktop/src/components/modals/AddAgentToConversationModal.tsx:
    Migrated from useConversationAgentsContext to useConversationStore from
    @fishbowl-ai/ui-shared. Removed context import and usage, replaced with
    store's activeConversationAgents, addAgent action, loading.agents, and
    error.agents states. Updated addAgent call to pass conversationId parameter
    as required by store interface. Fixed property mapping from ca.agentId to
    ca.agent_id to match ConversationAgent interface. Combined local
    isSubmitting state with store loading state for comprehensive loading
    management. Maintained all existing functionality while eliminating context
    dependency.
  apps/desktop/src/components/input/MessageInputContainer.tsx:
    Migrated from multiple hooks (useCreateMessage, useMessages,
    useMessagesRefresh, useConversationAgentsContext) to unified
    useConversationStore. Replaced complex manual orchestration logic (~120
    lines) with store's sendUserMessage action. Updated imports, removed direct
    IPC calls to window.electronAPI.chat.sendToAgents, simplified
    handleSendMessage function, updated loading and error state handling to use
    store states. Maintained exact existing functionality including input
    clearing, focus management, keyboard shortcuts, agent validation, and first
    message detection while eliminating fragmented state management.
  apps/desktop/src/components/chat/__tests__/MessageItem.test.tsx:
    "Created comprehensive test suite with 12 test cases covering store
    integration scenarios: store refresh function calls, null refetch handling,
    error recovery, optimistic updates, loading state coordination, different
    message types (user, agent, system), keyboard interactions, and disabled
    state handling. Tests verify MessageItem component works correctly with
    MessagesRefreshContext backed by conversation store's
    refreshActiveConversation action."
  apps/desktop/src/contexts/ConversationAgentsContext/ConversationAgentsProvider.tsx:
    "Completely migrated provider implementation from useConversationAgents hook
    to useConversationStore and useAgentsStore. Updated imports to use
    @fishbowl-ai/ui-shared stores and React hooks. Replaced simple hook wrapper
    with comprehensive store integration including: conversation selection
    coordination via useEffect, data transformation with exact same
    transformToViewModel logic, proper interface mapping from store state to
    UseConversationAgentsResult, wrapper functions for addAgent/removeAgent to
    match expected signatures, and error handling with ErrorState to Error
    conversion. Maintains complete backward compatibility with existing
    consumers."
  apps/desktop/src/components/chat/MessageItem.tsx: Migrated from
    useMessagesRefresh hook to useConversationStore. Updated imports to include
    useConversationStore from @fishbowl-ai/ui-shared, removed useMessagesRefresh
    import, replaced { refetch } = useMessagesRefresh() with {
    refreshActiveConversation } = useConversationStore(), and updated refetch()
    calls to use refreshActiveConversation(). Maintained all existing
    functionality including async error handling, conditional checks, and
    message refresh timing.
  apps/desktop/src/hooks/chat/useChatEventIntegration.ts: Migrated from
    useMessagesRefresh hook to useConversationStore. Updated import from
    '../messages' to '@fishbowl-ai/ui-shared', replaced useMessagesRefresh()
    with useConversationStore(), changed refetch() calls to
    refreshActiveConversation(), and updated useCallback dependency array.
    Maintained all existing event handling logic and timing.
  apps/desktop/src/hooks/chat/__tests__/useChatEventIntegration.test.tsx:
    Updated test mocks to include useConversationStore from
    @fishbowl-ai/ui-shared. Added mockRefreshActiveConversation as a resolved
    Promise to prevent 'cannot read properties of undefined' errors when calling
    .catch(). Updated beforeEach to properly reset the conversation store mock.
log: []
schema: v1.0
childrenIds:
  - T-complete-cleanup-remove-all
  - T-migrate-usechateventintegratio
  - T-remove-usemessageswithagentdat
  - T-extend-servicesprovider-for
  - T-migrate-add-agent-modal-to
  - T-migrate-agent-labels
  - T-migrate-conversationagentsprov
  - T-migrate-main-content-panel-to
  - T-migrate-message-input
  - T-migrate-messageitem-component
  - T-migrate-sidebar-conversation
  - T-remove-obsolete-hooks-and
  - T-update-message-item-to-use
created: 2025-09-01T02:22:11.606Z
updated: 2025-09-01T02:22:11.606Z
---

## Purpose

Migrate all UI components from fragmented state management (multiple hooks, manual refetch calls) to the unified conversation domain store, eliminating the "big ball of mud" architecture and establishing centralized conversation state coordination. Enhanced IPC events are helpful but don't block initial migration.

## Key Components

### Sidebar Migration (Phase 1)

- **Components**: Conversation list, conversation selection
- **Changes**: Remove direct hook usage, connect to domain store
- **Operations**: Create/delete/rename through store actions
- **Can start**: After store + adapter are ready (enhanced events help but don't block)

### Main Content Migration (Phase 2)

- **Components**: Message display, agent management
- **Data source**: Use activeMessages and activeConversationAgents from store
- **Coordination**: Eliminate manual refetch() calls

### Input Component Migration (Phase 3)

- **Component**: Message input and send functionality
- **Integration**: Use sendUserMessage store action exclusively
- **Orchestration**: Remove direct electronAPI.chat.sendToAgents calls

### Service Initialization

- **Provider pattern**: Initialize store via existing provider (ServicesProvider) or create ConversationStoreProvider
- **DI consistency**: Match current dependency injection patterns in codebase
- **Avoid direct initialization**: Don't initialize in component mounting

## Detailed Acceptance Criteria

### Phase 1-2: Core UI Migration

- [ ] Sidebar reads conversations from store exclusively (eliminate useConversations hook)
- [ ] selectConversation action triggers automatic ChatStore state clearing
- [ ] Create/delete/rename operations use store actions (eliminate manual refetch calls)
- [ ] Main content uses activeMessages from store (eliminate useMessages hook)
- [ ] Agent management uses activeConversationAgents from store (eliminate direct hooks)
- [ ] All UI refetch() calls removed - store owns data consistency
- [ ] Zero functional regressions in conversation/message behavior

### Phase 3: Message Orchestration Migration

- [ ] Input component uses sendUserMessage store action exclusively
- [ ] No direct window.electronAPI.chat.sendToAgents calls remain in UI
- [ ] Continuation and empty content rules maintained through store
- [ ] Messages render after confirmed write (no optimistic updates in v1)
- [ ] Error handling consistent with existing ErrorState patterns

### Component Integration Examples

```typescript
// Sidebar component migration
const ConversationSidebar = () => {
  const {
    conversations,
    loading,
    error,
    selectConversation,
    createConversationAndSelect
  } = useConversationStore();

  // REMOVE: const { conversations, refetch } = useConversations();
  // REMOVE: manual refetch() calls after operations

  return (
    // Render using store data
  );
};

// Main content migration
const ConversationView = () => {
  const { activeMessages, activeConversationAgents, loading } = useConversationStore();

  // REMOVE: const { messages } = useMessages(conversationId);
  // REMOVE: const { agents } = useConversationAgents(conversationId);

  return (
    // Render using store data
  );
};

// Input component migration
const MessageInput = () => {
  const { sendUserMessage, loading } = useConversationStore();

  // REMOVE: direct electronAPI.chat.sendToAgents calls

  const handleSend = (content: string) => {
    sendUserMessage(content);
  };

  return (
    // Input UI with store integration
  );
};
```

### Service Initialization Integration

- [ ] **Provider approach**: Use existing ServicesProvider or create ConversationStoreProvider
- [ ] **DI pattern match**: Follow current dependency injection patterns in codebase
- [ ] ConversationIpcAdapter instantiated in renderer services
- [ ] Domain store initialized with service during app startup
- [ ] Service availability validated before store operations
- [ ] **Avoid component initialization**: Don't initialize service in component useEffect

### Service Provider Pattern

```typescript
// Option A: Extend existing ServicesProvider
const ServicesProvider = ({ children }) => {
  const conversationService = useMemo(() => new ConversationIpcAdapter(), []);

  useEffect(() => {
    const conversationStore = useConversationStore.getState();
    conversationStore.initialize(conversationService);
  }, [conversationService]);

  return (
    <ServiceContext.Provider value={{ conversationService, ... }}>
      {children}
    </ServiceContext.Provider>
  );
};

// Option B: Create dedicated ConversationStoreProvider
const ConversationStoreProvider = ({ children }) => {
  useEffect(() => {
    const conversationService = new ConversationIpcAdapter();
    const conversationStore = useConversationStore.getState();
    conversationStore.initialize(conversationService);
  }, []);

  return children;
};
```

### Error Handling Migration

- [ ] UI components use error states from domain store
- [ ] ErrorState patterns consistent across all operations
- [ ] Loading states coordinated through store
- [ ] Error recovery actions available through store

### State Coordination

- [ ] Automatic useChatStore clearing on conversation selection
- [ ] ProcessingConversationId coordination maintained
- [ ] Chat state clearing happens reliably during conversation switches
- [ ] No race conditions between store operations and chat state

### Migration Sequencing

- [ ] **Relaxed prerequisites**: UI migration can begin after store + adapter ready
- [ ] **Enhanced events helpful**: IPC event improvements help but don't block initial migration
- [ ] **Phase flexibility**: Sidebar and main content migration can proceed while event enhancement continues
- [ ] **Reduced sequencing risk**: More parallel development possible

### Implementation Guidance

- **Gradual migration**: Migrate one component at a time to reduce risk
- **Provider consistency**: Use existing DI patterns, don't create new initialization approaches
- **Maintain behavior**: Existing UI behavior should be preserved exactly
- **Error consistency**: Use same ErrorState patterns throughout
- **Performance**: Minimize re-renders through proper selector usage

### Testing Requirements

- [ ] All migrated components render correctly with store data
- [ ] Conversation selection triggers appropriate state changes
- [ ] Create/delete/rename operations work through store
- [ ] Message sending works through store actions
- [ ] Agent management operations function correctly
- [ ] Error states display appropriately
- [ ] Loading states coordinate properly
- [ ] No performance regressions in UI responsiveness

### Security Considerations

- [ ] UI components don't directly access platform APIs
- [ ] All operations go through domain store abstraction
- [ ] Error messages don't expose sensitive data
- [ ] Input validation maintained through service layer

### Performance Requirements

- [ ] UI responsiveness maintained or improved
- [ ] No unnecessary re-renders from store connections
- [ ] Loading states provide appropriate user feedback
- [ ] Conversation switching performance maintained
- [ ] Message display performance optimized for active conversation

## Technical Specifications

### Store Connection Pattern

```typescript
// Component connection to store
const ComponentName = () => {
  const {
    // State selectors
    conversations,
    activeMessages,
    activeConversationAgents,

    // Loading states
    loading,
    error,

    // Actions
    selectConversation,
    createConversationAndSelect,
    sendUserMessage,
  } = useConversationStore();

  // Component logic using store data
};
```

### Migration Phase Strategy

1. **Phase 1**: Sidebar and conversation list migration (after store ready)
2. **Phase 2**: Main content and message display migration
3. **Phase 3**: Input component and orchestration migration
4. **Validation**: End-to-end testing after each phase
5. **Enhanced events**: Integrate when available, but don't block phases 1-2

## Dependencies

- **Prerequisites**: F-conversation-domain-store (domain store implementation)
- **Service dependency**: ConversationIpcAdapter available in renderer
- **Component scope**: All conversation-related UI components
- **Optional enhancement**: F-enhanced-ipc-event-integration (helpful but not blocking)
- **Provider integration**: Existing or new service provider setup

## Implementation Notes

- **Relaxed sequencing**: Enhanced events don't block initial UI migration
- **Provider approach**: Initialize through existing DI patterns, not component-level
- **Incremental migration**: Migrate components step by step to minimize risk
- **Maintain behavior**: Preserve exact existing behavior during migration
- **Focus on eliminating**: Manual refetch() calls and fragmented state management
- **Rollback plan**: Each component migration should be independently reversible

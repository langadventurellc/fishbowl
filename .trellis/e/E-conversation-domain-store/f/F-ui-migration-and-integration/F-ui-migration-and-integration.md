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
log: []
schema: v1.0
childrenIds:
  - T-migrate-add-agent-modal-to
  - T-migrate-agent-labels
  - T-migrate-main-content-panel-to
  - T-migrate-message-input
  - T-migrate-sidebar-conversation
  - T-remove-obsolete-hooks-and
  - T-update-message-item-to-use
  - T-extend-servicesprovider-for
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

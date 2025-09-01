---
id: T-migrate-main-content-panel-to
title: Migrate main content panel to use domain store messages
status: open
priority: high
parent: F-ui-migration-and-integration
prerequisites:
  - T-migrate-sidebar-conversation
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T06:27:05.364Z
updated: 2025-09-01T06:27:05.364Z
---

## Purpose

Replace `useMessagesWithAgentData` hook usage in the main content panel with conversation domain store, eliminating manual refetch calls and using `activeMessages` for message display.

## Context

The main content panel (apps/desktop/src/components/layout/MainContentPanelDisplay.tsx) currently uses `useMessagesWithAgentData` which combines `useMessages` and `useConversationAgents` hooks. This needs to be migrated to use the conversation domain store's `activeMessages` and `activeConversationAgents` exclusively.

## Detailed Implementation Requirements

### Component Migration - MainContentPanelDisplay.tsx

Replace the existing composite hook usage:

```typescript
// REMOVE: Composite hook usage
const { messages, isLoading, error, refetch } = useMessagesWithAgentData(
  selectedConversationId || null,
);
```

With conversation store integration:

```typescript
// NEW: Domain store integration
const {
  activeMessages,
  activeConversationAgents,
  loading,
  error,
  selectConversation,
} = useConversationStore();

const messages = activeMessages;
const isLoading = loading.messages;
const messagesError = error.messages;
```

### Message Processing Logic

Since the domain store provides raw messages and agents separately, maintain the existing message enrichment pattern but source data from the store:

```typescript
const ConversationView = ({ selectedConversationId }: Props) => {
  const { activeMessages, activeConversationAgents, loading, error } =
    useConversationStore();

  const { agents } = useAgentsStore();
  const { roles } = useRolesStore();

  // Existing message enrichment logic but using store data
  const messagesWithAgentData = useMemo(() => {
    if (!activeMessages.length) return [];

    return activeMessages.map((message) => {
      // Same enrichment logic as before
      // Use activeConversationAgents instead of hook data
    });
  }, [activeMessages, activeConversationAgents, agents, roles]);

  const isLoading = loading.messages || loading.agents;
  const error = error.messages || error.agents;
};
```

### MessagesRefreshContext Integration

Update the MessagesRefreshContext provider to use store refresh instead of hook refetch:

```typescript
// In MessagesRefreshContext provider
const { refreshActiveConversation } = useConversationStore();

const contextValue = useMemo(
  () => ({
    refetch: refreshActiveConversation,
  }),
  [refreshActiveConversation],
);
```

## Acceptance Criteria

### Core Migration Requirements

- [ ] Remove `useMessagesWithAgentData` hook import and usage
- [ ] Import and use `useConversationStore` from `@fishbowl-ai/ui-shared`
- [ ] Replace message data source with `activeMessages` from store
- [ ] Replace agent data source with `activeConversationAgents` from store
- [ ] Use store loading and error states instead of hook states
- [ ] Eliminate manual `refetch()` calls

### Message Display Requirements

- [ ] Messages display correctly from store `activeMessages`
- [ ] Message enrichment with agent data works using `activeConversationAgents`
- [ ] Agent names and roles resolve correctly using existing stores
- [ ] Loading states display appropriately during message loading
- [ ] Error states display using existing ErrorState patterns
- [ ] Message ordering preserved (chronological)

### Context Integration

- [ ] MessagesRefreshContext uses store `refreshActiveConversation` action
- [ ] Child components can still access refresh functionality
- [ ] No breaking changes to components using MessagesRefreshContext
- [ ] Context provides same interface as before

### State Coordination

- [ ] Messages automatically load when conversation is selected
- [ ] Store manages message consistency without manual refetch
- [ ] Loading states coordinate between messages and agents
- [ ] Active conversation focus maintained

## Testing Requirements

- [ ] Unit tests verify store integration works correctly
- [ ] Test messages display correctly from activeMessages
- [ ] Test message enrichment with activeConversationAgents works
- [ ] Test loading and error states display properly
- [ ] Test MessagesRefreshContext uses store action
- [ ] Integration tests verify main content functionality preserved
- [ ] Test conversation switching updates messages correctly

## Technical Approach

1. **Import changes**: Replace useMessagesWithAgentData with useConversationStore
2. **Data mapping**: Map activeMessages and activeConversationAgents to component state
3. **Enrichment logic**: Maintain existing message enrichment but use store data
4. **Context update**: Update MessagesRefreshContext to use store action
5. **Loading coordination**: Combine loading states from messages and agents
6. **Error handling**: Combine error states appropriately

## Dependencies

- **Prerequisites**: T-migrate-sidebar-conversation (conversation selection working)
- **Store dependency**: useConversationStore with activeMessages and activeConversationAgents
- **Component scope**: MainContentPanelDisplay.tsx and MessagesRefreshContext
- **Data enrichment**: Continue using useAgentsStore and useRolesStore for enrichment

## Out of Scope

- Individual message components (MessageItem.tsx, etc.) - will be updated in separate tasks
- Message input component (handled in Phase 3)
- Chat event integration (already uses MessagesRefreshContext)
- Agent label container (handled separately)

## Implementation Notes

- **Preserve enrichment**: Maintain existing message enrichment logic
- **Context compatibility**: Keep MessagesRefreshContext interface unchanged
- **Performance**: Use same memoization patterns for message processing
- **Error boundaries**: Handle both message and agent loading errors appropriately
- **State synchronization**: Let store handle conversation switching automatically

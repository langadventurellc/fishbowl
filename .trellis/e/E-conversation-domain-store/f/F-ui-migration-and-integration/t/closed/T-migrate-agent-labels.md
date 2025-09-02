---
id: T-migrate-agent-labels
title: Migrate agent labels container to domain store
status: done
priority: medium
parent: F-ui-migration-and-integration
prerequisites:
  - T-migrate-main-content-panel-to
affectedFiles:
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
log:
  - Successfully migrated AgentLabelsContainerDisplay from
    useConversationAgentsContext to conversation domain store. Replaced context
    usage with useConversationStore and useAgentsStore imports, mapped
    activeConversationAgents to component expectations, implemented proper
    ConversationAgent to AgentPillViewModel transformation using agent_id
    lookups, replaced toggleEnabled action with store's toggleAgentEnabled,
    updated error handling to use ErrorState pattern, and eliminated manual
    refetch calls. All functionality preserved with improved state management
    through centralized store architecture.
schema: v1.0
childrenIds: []
created: 2025-09-01T06:27:27.840Z
updated: 2025-09-01T06:27:27.840Z
---

## Purpose

Replace `useConversationAgentsContext` usage in the agent labels container with conversation domain store, eliminating the context layer and using `activeConversationAgents` directly.

## Context

The agent labels container (apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx) currently uses `useConversationAgentsContext` which wraps the `useConversationAgents` hook. This needs to be migrated to use the conversation domain store's `activeConversationAgents` and agent management actions.

## Detailed Implementation Requirements

### Component Migration - AgentLabelsContainerDisplay.tsx

Replace the existing context usage:

```typescript
// REMOVE: Context usage
const { conversationAgents, isLoading, error, refetch, toggleEnabled } =
  useConversationAgentsContext();
```

With conversation store integration:

```typescript
// NEW: Domain store integration
const { activeConversationAgents, loading, error, toggleAgentEnabled } =
  useConversationStore();

const conversationAgents = activeConversationAgents;
const isLoading = loading.agents;
const agentsError = error.agents;
```

### Agent Management Actions

Replace context actions with store actions:

1. **Agent toggling**: Use `toggleAgentEnabled(conversationAgentId)` from store
2. **Remove refetch**: Eliminate manual `refetch()` calls
3. **Error handling**: Use store error states
4. **Loading states**: Use store loading states

### Updated Component Pattern

```typescript
const AgentLabelsContainer = ({ conversationId }: Props) => {
  const { activeConversationAgents, loading, error, toggleAgentEnabled } =
    useConversationStore();

  const isLoading = loading.agents;
  const agentsError = error.agents;

  const handleToggleAgent = useCallback(
    async (conversationAgentId: string) => {
      await toggleAgentEnabled(conversationAgentId);
      // No manual refetch needed - store handles consistency
    },
    [toggleAgentEnabled],
  );

  // Transform conversation agents to display format (existing logic)
  const displayAgents = useMemo(() => {
    return activeConversationAgents.map((agent) => ({
      // Existing transformation logic
    }));
  }, [activeConversationAgents]);
};
```

## Acceptance Criteria

### Core Migration Requirements

- [ ] Remove `useConversationAgentsContext` import and usage
- [ ] Import and use `useConversationStore` from `@fishbowl-ai/ui-shared`
- [ ] Replace agent data source with `activeConversationAgents` from store
- [ ] Use store loading and error states instead of context states
- [ ] Use `toggleAgentEnabled` action instead of context action
- [ ] Eliminate manual `refetch()` calls

### Agent Management Requirements

- [ ] Agent list displays correctly from store `activeConversationAgents`
- [ ] Agent enable/disable functionality works through store action
- [ ] Loading states display appropriately during agent operations
- [ ] Error states display using existing ErrorState patterns
- [ ] Agent state changes reflect immediately in UI
- [ ] No functional regressions in agent management

### UI Consistency

- [ ] Agent pills display with correct enabled/disabled states
- [ ] Loading indicators show during agent operations
- [ ] Error states maintain existing user experience
- [ ] Agent list updates automatically when conversation changes

## Testing Requirements

- [ ] Unit tests verify store integration works correctly
- [ ] Test agent list displays correctly from activeConversationAgents
- [ ] Test agent toggle functionality through store action
- [ ] Test loading and error states display properly
- [ ] Test no manual refetch calls remain in component
- [ ] Integration tests verify agent management functionality preserved

## Technical Approach

1. **Import changes**: Replace useConversationAgentsContext with useConversationStore
2. **State mapping**: Map activeConversationAgents to component expectations
3. **Action integration**: Use toggleAgentEnabled store action
4. **Remove manual sync**: Eliminate refetch calls throughout component
5. **Error patterns**: Use existing ErrorState display patterns
6. **Loading coordination**: Use store loading states

## Dependencies

- **Prerequisites**: T-migrate-main-content-panel-to (main content using store)
- **Store dependency**: useConversationStore with activeConversationAgents and toggleAgentEnabled
- **Component scope**: AgentLabelsContainerDisplay.tsx
- **Context removal**: Remove dependency on useConversationAgentsContext

## Out of Scope

- ConversationAgentsContext and ConversationAgentsProvider (can be removed in cleanup)
- Agent addition modal (separate component, handled elsewhere)
- Agent pill individual components (maintain existing implementation)
- Bulk agent operations (not currently implemented)

## Implementation Notes

- **Preserve behavior**: Maintain exact existing functionality
- **Context elimination**: Remove intermediate context layer completely
- **Error handling**: Maintain existing error display patterns
- **Performance**: Ensure no regressions in agent list responsiveness
- **State coordination**: Let store handle conversation switching automatically

## Context Cleanup Note

After this migration is complete, the ConversationAgentsContext and related provider can be marked for removal since they will no longer be needed. However, this cleanup should be done in a separate task to avoid scope creep.

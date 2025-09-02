---
id: T-migrate-add-agent-modal-to
title: Migrate add agent modal to domain store
status: done
priority: medium
parent: F-ui-migration-and-integration
prerequisites:
  - T-migrate-agent-labels
affectedFiles:
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
log:
  - Successfully migrated AddAgentToConversationModal from
    useConversationAgentsContext to conversation domain store. Replaced context
    usage with useConversationStore, updated addAgent action to pass both
    conversationId and agentId parameters, mapped activeConversationAgents to
    existing filtering logic, and integrated store loading/error states with
    existing local state management. Fixed property name from agentId to
    agent_id to match ConversationAgent interface. All quality checks pass with
    no functional regressions.
schema: v1.0
childrenIds: []
created: 2025-09-01T06:27:50.208Z
updated: 2025-09-01T06:27:50.208Z
---

## Purpose

Replace `useConversationAgentsContext` usage in the add agent modal with conversation domain store, using `addAgent` action and eliminating context dependency.

## Context

The add agent modal (apps/desktop/src/components/modals/AddAgentToConversationModal.tsx) currently uses `useConversationAgentsContext` for accessing conversation agents and adding new agents. This needs to be migrated to use the conversation domain store's `activeConversationAgents` and `addAgent` action.

## Detailed Implementation Requirements

### Component Migration - AddAgentToConversationModal.tsx

Replace the existing context usage:

```typescript
// REMOVE: Context usage
const { conversationAgents, addAgent, error } = useConversationAgentsContext();
```

With conversation store integration:

```typescript
// NEW: Domain store integration
const { activeConversationAgents, addAgent, loading, error } =
  useConversationStore();

const conversationAgents = activeConversationAgents;
const isAdding = loading.agents;
const addError = error.agents;
```

### Modal Operation Flow

Update the agent addition flow to use store action:

```typescript
const AddAgentModal = ({ conversationId, open, onClose }: Props) => {
  const { activeConversationAgents, addAgent, loading, error } =
    useConversationStore();

  const handleAddAgent = useCallback(
    async (agentId: string) => {
      try {
        await addAgent(conversationId, agentId);
        onClose(); // Close modal on success
        // No manual refetch needed - store handles consistency
      } catch (err) {
        // Error handled by store error state
      }
    },
    [addAgent, conversationId, onClose],
  );

  // Filter already added agents (existing logic)
  const availableAgents = useMemo(() => {
    const addedAgentIds = new Set(
      activeConversationAgents.map((ca) => ca.agentId),
    );
    return agents.filter((agent) => !addedAgentIds.has(agent.id));
  }, [agents, activeConversationAgents]);
};
```

## Acceptance Criteria

### Core Migration Requirements

- [ ] Remove `useConversationAgentsContext` import and usage
- [ ] Import and use `useConversationStore` from `@fishbowl-ai/ui-shared`
- [ ] Replace agent data source with `activeConversationAgents` from store
- [ ] Use store `addAgent` action instead of context action
- [ ] Use store loading and error states for UI feedback
- [ ] Eliminate dependency on ConversationAgentsContext

### Modal Functionality Requirements

- [ ] Agent selection dropdown shows available agents correctly
- [ ] Already added agents are filtered out from selection
- [ ] Add agent button triggers store action
- [ ] Loading state shows during agent addition
- [ ] Error states display appropriately
- [ ] Modal closes automatically on successful addition
- [ ] No functional regressions in agent addition flow

### State Management

- [ ] Agent addition updates store state immediately
- [ ] Agent list updates automatically in other components
- [ ] Loading states coordinate properly during operation
- [ ] Error handling maintains existing user experience

## Testing Requirements

- [ ] Unit tests verify store integration works correctly
- [ ] Test agent filtering logic with activeConversationAgents
- [ ] Test add agent functionality through store action
- [ ] Test loading and error states display properly
- [ ] Test modal closes on successful agent addition
- [ ] Integration tests verify agent addition workflow preserved

## Technical Approach

1. **Import changes**: Replace useConversationAgentsContext with useConversationStore
2. **State mapping**: Map activeConversationAgents to filtering logic
3. **Action integration**: Use store addAgent action
4. **Loading states**: Use store loading state for button/modal state
5. **Error handling**: Use store error state for error display
6. **Modal lifecycle**: Maintain existing modal open/close behavior

## Dependencies

- **Prerequisites**: T-migrate-agent-labels (agent labels using store)
- **Store dependency**: useConversationStore with activeConversationAgents and addAgent
- **Component scope**: AddAgentToConversationModal.tsx
- **Modal integration**: Maintain existing modal trigger patterns

## Out of Scope

- Modal trigger components (buttons that open the modal)
- Agent dropdown component modifications
- Agent store integration (continues using useAgentsStore)
- Bulk agent addition (not currently implemented)

## Implementation Notes

- **Preserve behavior**: Maintain exact existing modal functionality
- **Context elimination**: Remove dependency on ConversationAgentsContext
- **Error handling**: Use existing modal error display patterns
- **Performance**: Ensure no regressions in modal responsiveness
- **State coordination**: Let store handle agent list consistency automatically

## Edge Cases to Handle

- **Conversation switching**: Handle case where conversation changes while modal is open
- **Agent removal**: Ensure available agents list updates if agents are removed elsewhere
- **Loading states**: Handle concurrent agent operations properly
- **Error recovery**: Allow retry after failed agent addition

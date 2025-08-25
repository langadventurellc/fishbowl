---
id: T-fix-agent-display-and-refresh
title: Fix agent display and refresh after conversation agent addition
status: open
priority: medium
parent: F-agent-labels-container
prerequisites:
  - T-verify-and-fix-addagenttoconve
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T19:47:53.148Z
updated: 2025-08-25T19:47:53.148Z
---

# Fix agent display and refresh after conversation agent addition

## Context

After successfully adding an agent to a conversation, the UI needs to properly refresh and display the newly added agent in the AgentLabelsContainerDisplay. This includes ensuring the useConversationAgents hook refetches data and the component renders the updated agent list.

## Specific Implementation Requirements

### Agent Display Integration

- **Verify agent transformation** from ConversationAgentViewModel to AgentViewModel
- **Test refetch mechanism** after successful agent addition
- **Fix agent rendering** in AgentLabelsContainerDisplay
- **Ensure proper ordering** of conversation agents vs. selected agents
- **Test visual updates** happen immediately after addition

### Implementation Tasks

- Debug the displayAgents logic in AgentLabelsContainerDisplay
- Verify transformToViewModel creates proper AgentSettingsViewModel objects
- Test that fetchConversationAgents is called after addAgent succeeds
- Ensure agent pills render correctly with proper styling
- Verify no duplicate agents appear in the display
- Test agent ordering and display preferences

### Technical Requirements

```typescript
// In AgentLabelsContainerDisplay.tsx - debug agent display
const displayAgents = selectedConversationId
  ? conversationAgents.map((ca) => ca.agent)
  : agents;

console.log("AgentLabels: selectedConversationId =", selectedConversationId);
console.log("AgentLabels: conversationAgents =", conversationAgents);
console.log("AgentLabels: displayAgents =", displayAgents);

// In useConversationAgents.ts - ensure refetch works
const addAgent = useCallback(
  async (agentId: string) => {
    // ... existing logic ...

    await fetchConversationAgents(); // This should trigger re-render
    console.log(
      "Agent added and refetched, new count:",
      conversationAgents.length,
    );
  },
  [conversationId, fetchConversationAgents],
);
```

## Detailed Acceptance Criteria

### Agent Display Requirements

- ✅ Newly added agents appear immediately in the agent pills container
- ✅ Agent pills show correct name, role, and styling
- ✅ No duplicate agents appear when conversation agents load
- ✅ Agent ordering follows display_order from database
- ✅ Loading states don't interfere with agent display

### State Synchronization Requirements

- ✅ useConversationAgents hook refetches after successful addition
- ✅ Component re-renders with updated agent list
- ✅ Modal closes and agents refresh automatically
- ✅ Error states don't prevent subsequent additions
- ✅ State remains consistent across operations

### Visual Integration Requirements

- ✅ Agent pills maintain consistent styling with existing design
- ✅ Proper spacing and layout with varying numbers of agents
- ✅ Scrolling behavior works with additional agents
- ✅ Add Agent button positioning remains correct
- ✅ Loading/error states display appropriately

## Files to Modify

- `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx` - Fix agent display logic
- `apps/desktop/src/hooks/conversationAgents/useConversationAgents.ts` - Verify refetch mechanism
- Test agent transformation and rendering pipeline
- Verify modal integration triggers proper refreshes

## Dependencies

- useConversationAgents hook refetch functionality
- Agent transformation from database to UI models
- AgentPill component styling and rendering
- Modal closing and callback integration

## Testing Requirements

**Unit Tests (include in this task):**

- Test agent display updates after state changes
- Test agent transformation from ConversationAgent to UI format
- Test component re-rendering with new agent data
- Test loading and error states during refresh

**Integration Tests:**

- Test complete add agent flow shows agent in UI
- Test multiple agents can be added successfully
- Test agent display with different conversation states
- Test error recovery doesn't break agent display

**Visual Testing:**

- Verify agent pills render with correct styling
- Test layout behavior with many agents
- Verify scrolling and responsive behavior
- Test Add Agent button remains accessible

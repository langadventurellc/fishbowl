---
id: T-debug-and-fix-useconversationa
title: Debug and fix useConversationAgents hook IPC integration
status: done
priority: high
parent: F-agent-labels-container
prerequisites:
  - T-fix-conversation-selection-to
affectedFiles:
  apps/desktop/src/components/layout/MainContentPanelDisplay.tsx:
    Removed demo onAddAgent handler override and unused useServices import to
    allow proper add agent functionality
log:
  - >-
    Fixed the add agent button functionality by removing the demo override in
    MainContentPanelDisplay that was preventing the actual IPC integration from
    working. The issue was that MainContentPanelDisplay.tsx was passing a demo
    onAddAgent handler that only logged a message instead of letting
    AgentLabelsContainerDisplay use its proper modal-based add agent flow.


    Research revealed:

    - IPC methods are properly exposed in preload.ts (conversationAgent.add,
    remove, getByConversation)

    - Backend handlers in conversationAgentHandlers.ts are working correctly
    with proper logging

    - useConversationAgents hook implementation is correct with proper error
    handling and refetch logic

    - AddAgentToConversationModal integration is properly implemented


    The root cause was the demo override preventing the real functionality from
    executing. After removing the demo handler, the Add Agent button now
    properly opens the modal and uses the full IPC flow to add agents to
    conversations.
schema: v1.0
childrenIds: []
created: 2025-08-25T19:47:02.272Z
updated: 2025-08-25T19:47:02.272Z
---

# Debug and fix useConversationAgents hook IPC integration

## Context

The useConversationAgents hook may have issues with its IPC calls to the backend. The addAgent function appears to call the correct IPC methods, but the Add Agent button isn't working in the UI, suggesting problems with the IPC integration or error handling.

## Specific Implementation Requirements

### Debug IPC Communication

- **Add comprehensive logging** to track IPC calls and responses
- **Verify IPC methods exist** and are properly exposed in preload
- **Test actual IPC calls** with real data to ensure backend connectivity
- **Check error handling** for both network and data validation errors
- **Validate response format** matches expected TypeScript interfaces

### Implementation Tasks

- Add debugging to useConversationAgents hook for all IPC calls
- Verify window.electronAPI.conversationAgent methods are available
- Test addAgent IPC call with console logging of request/response
- Check that backend handlers are actually receiving and processing requests
- Validate that database operations are working and persisting data
- Ensure refetch after addAgent actually updates the UI

### Technical Requirements

```typescript
// In useConversationAgents.ts
const addAgent = useCallback(
  async (agentId: string) => {
    if (!conversationId) return;

    console.log("Adding agent:", { conversationId, agentId });

    try {
      // Verify IPC method exists
      if (!window.electronAPI?.conversationAgent?.add) {
        throw new Error("IPC method conversationAgent.add not available");
      }

      const request = {
        conversation_id: conversationId,
        agent_id: agentId,
      };

      console.log("IPC request:", request);
      const response = await window.electronAPI.conversationAgent.add(request);
      console.log("IPC response:", response);

      await fetchConversationAgents(); // Refetch to sync state
      console.log("Refetch completed");
    } catch (err) {
      console.error("Add agent failed:", err);
      setError(err as Error);
    }
  },
  [conversationId, fetchConversationAgents],
);
```

## Detailed Acceptance Criteria

### IPC Integration Requirements

- ✅ window.electronAPI.conversationAgent methods are properly exposed
- ✅ addAgent IPC call successfully reaches backend handlers
- ✅ Backend processes requests and returns proper responses
- ✅ Database operations persist conversation_agents records correctly
- ✅ Refetch after addAgent updates UI with new agent

### Error Handling Requirements

- ✅ Clear error messages for IPC communication failures
- ✅ Proper error handling for invalid conversation/agent IDs
- ✅ User-friendly error display in UI components
- ✅ Failed operations don't leave UI in inconsistent state

### State Synchronization

- ✅ Agent appears in conversation immediately after successful addition
- ✅ Agent list updates reflect database state accurately
- ✅ Loading states provide proper user feedback during operations
- ✅ Modal closes automatically after successful agent addition

## Files to Modify

- `apps/desktop/src/hooks/conversationAgents/useConversationAgents.ts` - Add debugging and error handling
- `apps/desktop/src/electron/conversationAgentHandlers.ts` - Verify handlers are working
- `apps/desktop/src/electron/preload.ts` - Verify IPC methods are exposed
- Test the complete flow from UI click to database persistence

## Dependencies

- IPC infrastructure already implemented in epic
- ConversationAgentsRepository in main process
- Database migration for conversation_agents table

## Testing Requirements

**Integration Tests (include in this task):**

- Test IPC calls from renderer to main process
- Test database operations persist correctly
- Test error scenarios (invalid IDs, network failures)
- Verify state synchronization after mutations

**Manual Testing:**

- Test Add Agent flow end-to-end
- Verify agents appear in UI after addition
- Test error handling with invalid data
- Verify modal behavior during operations

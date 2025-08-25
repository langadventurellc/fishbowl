---
id: T-add-data-transformation-logic
title: Add data transformation logic for ConversationAgent to
  ConversationAgentViewModel
status: done
priority: medium
parent: F-conversation-agents-hook-and
prerequisites:
  - T-create-useconversationagents
affectedFiles:
  apps/desktop/src/hooks/useConversationAgents.ts: Updated transformToViewModel
    function to create fallback AgentSettingsViewModel objects when agent
    configurations are missing from store, and updated fetchConversationAgents
    to remove filtering since fallbacks are always created
  apps/desktop/src/hooks/__tests__/useConversationAgents.test.tsx:
    Updated test case to verify fallback agent creation behavior instead of
    filtering, including assertions for fallback agent properties and updated
    logger warning message
log:
  - Implemented data transformation logic to create fallback agents when agent
    configurations are missing from the store. Updated the transformToViewModel
    function to create fallback AgentSettingsViewModel objects with default
    values instead of filtering out missing agents. This ensures the UI remains
    functional even when agent configurations are not found. Updated
    corresponding test to verify fallback behavior and ensure comprehensive test
    coverage. All quality checks and tests pass.
schema: v1.0
childrenIds: []
created: 2025-08-25T07:08:09.551Z
updated: 2025-08-25T07:08:09.551Z
---

# Add Data Transformation Logic for ConversationAgent to ConversationAgentViewModel

## Context

Implement the data transformation logic within the `useConversationAgents` hook to convert raw `ConversationAgent` data from the IPC layer into fully populated `ConversationAgentViewModel` objects using agent settings from `useAgentsStore`.

## Technical Requirements

### Implementation Location

- Within the existing `useConversationAgents` hook
- Specifically in the `fetchConversationAgents` function

### Transformation Logic

Add transformation logic that:

1. Takes `ConversationAgent[]` from IPC response
2. Uses `useAgentsStore` to get agent settings by ID
3. Creates `ConversationAgentViewModel[]` with populated agent data
4. Handles missing agent configurations gracefully

### Code Structure

```typescript
export function useConversationAgents(conversationId: string | null) {
  // Existing state management...

  // Get agents store for data population
  const { agents: availableAgents } = useAgentsStore();

  // Transform ConversationAgent to ConversationAgentViewModel
  const transformConversationAgents = useCallback(
    (conversationAgents: ConversationAgent[]): ConversationAgentViewModel[] => {
      return conversationAgents.map((conversationAgent) => {
        // Find agent settings from store
        const agentSettings = availableAgents.find(
          (agent) => agent.id === conversationAgent.agentId,
        );

        // Create fallback agent if not found
        const agent: AgentSettingsViewModel = agentSettings || {
          id: conversationAgent.agentId,
          name: `Unknown Agent (${conversationAgent.agentId.slice(0, 8)})`,
          model: "Unknown Model",
          role: "Unknown Role",
          personality: "Unknown Personality",
          temperature: 0.7,
          maxTokens: 2000,
          topP: 0.9,
          systemPrompt: "",
          createdAt: conversationAgent.addedAt,
          updatedAt: conversationAgent.addedAt,
        };

        return {
          id: conversationAgent.id,
          conversationId: conversationAgent.conversationId,
          agentId: conversationAgent.agentId,
          agent,
          addedAt: conversationAgent.addedAt,
          isActive: conversationAgent.isActive,
          displayOrder: conversationAgent.displayOrder,
        };
      });
    },
    [availableAgents],
  );

  // Update fetchConversationAgents to use transformation
  const fetchConversationAgents = useCallback(async () => {
    if (!conversationId) {
      setConversationAgents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response =
        await window.electronAPI.conversationAgent.getByConversation(
          conversationId,
        );

      if (response.success) {
        const transformedAgents = transformConversationAgents(response.data);
        setConversationAgents(transformedAgents);
      } else {
        setError(new Error(response.error.message));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, transformConversationAgents]);

  // Rest of hook implementation...
}
```

### Graceful Degradation Strategy

Handle missing agent configurations by:

- Creating fallback `AgentSettingsViewModel` objects
- Using truncated agent ID in display name
- Setting reasonable default values for missing properties
- Logging warnings for missing configurations (optional)
- Maintaining functional UI even with incomplete data

### Performance Optimization

- Memoize transformation function with proper dependencies
- Minimize re-computation when agents store updates
- Efficient array mapping and finding operations
- Avoid unnecessary re-renders with proper dependency management

## Testing Requirements

- Unit tests for transformation function with various input scenarios
- Tests for missing agent configurations (fallback behavior)
- Tests for empty agent arrays
- Tests for malformed conversation agent data
- Integration tests with mocked useAgentsStore data
- Performance tests for large agent lists

## Acceptance Criteria

- ✅ Transformation function converts ConversationAgent to ConversationAgentViewModel
- ✅ Agent data populated from useAgentsStore using agentId lookup
- ✅ Graceful handling of missing agent configurations with fallback data
- ✅ Proper memoization to prevent unnecessary re-computation
- ✅ Integration with existing fetchConversationAgents function
- ✅ Maintains referential integrity between conversation and agent data
- ✅ Performance optimized for typical agent list sizes
- ✅ Error handling for malformed or invalid data
- ✅ Unit tests covering all transformation scenarios
- ✅ Fallback agent data follows AgentSettingsViewModel structure
- ✅ TypeScript type safety throughout transformation

## Error Handling Requirements

- Invalid agent IDs: Create fallback agent with clear indication
- Missing agent store data: Use reasonable defaults
- Malformed conversation agent data: Skip invalid entries with logging
- Store loading states: Handle scenarios where agents store is still loading

## Dependencies

- Completed useConversationAgents hook (prerequisite)
- useAgentsStore hook for agent data population
- ConversationAgent and ConversationAgentViewModel types
- Existing AgentSettingsViewModel type structure

## Integration Notes

- Must work seamlessly with existing hook functionality
- Should not break existing IPC communication patterns
- Needs to handle dynamic updates when agent settings change
- Should maintain consistent behavior with other store integrations

## Security Considerations

- Validate agent IDs to prevent injection attacks
- Sanitize fallback display names for XSS prevention
- Ensure no sensitive data exposure in fallback scenarios
- Safe handling of untrusted data from IPC layer

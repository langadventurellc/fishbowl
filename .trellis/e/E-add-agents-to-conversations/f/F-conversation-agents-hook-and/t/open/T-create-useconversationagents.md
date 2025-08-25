---
id: T-create-useconversationagents
title: Create useConversationAgents hook with state management
status: open
priority: high
parent: F-conversation-agents-hook-and
prerequisites:
  - T-create-conversationagentviewmo
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T07:07:42.314Z
updated: 2025-08-25T07:07:42.314Z
---

# Create useConversationAgents Hook with State Management

## Context

Implement the main `useConversationAgents` hook following the exact pattern from `useConversations`. This hook provides conversation-specific agent management with loading states, error handling, and real-time synchronization using the refetch pattern.

## Technical Requirements

### File Location

- `apps/desktop/src/hooks/useConversationAgents.ts`

### Hook Structure

Follow the exact pattern from `useConversations` hook:

```typescript
export function useConversationAgents(conversationId: string | null) {
  const [conversationAgents, setConversationAgents] = useState<
    ConversationAgentViewModel[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch agents with proper error handling
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
        // Transform to ViewModel using useAgentsStore
        setConversationAgents(response.data);
      } else {
        setError(new Error(response.error.message));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Add agent with refetch pattern
  const addAgent = useCallback(
    async (agentId: string) => {
      if (!conversationId) return;

      try {
        const response = await window.electronAPI.conversationAgent.add({
          conversationId,
          agentId,
        });

        if (response.success) {
          await fetchConversationAgents(); // Refetch to sync state
        } else {
          setError(new Error(response.error.message));
        }
      } catch (err) {
        setError(err as Error);
      }
    },
    [conversationId, fetchConversationAgents],
  );

  // Remove agent with refetch pattern
  const removeAgent = useCallback(
    async (agentId: string) => {
      if (!conversationId) return;

      try {
        const response = await window.electronAPI.conversationAgent.remove({
          conversationId,
          agentId,
        });

        if (response.success) {
          await fetchConversationAgents(); // Refetch to sync state
        } else {
          setError(new Error(response.error.message));
        }
      } catch (err) {
        setError(err as Error);
      }
    },
    [conversationId, fetchConversationAgents],
  );

  // Auto-fetch when conversation changes
  useEffect(() => {
    fetchConversationAgents();
  }, [fetchConversationAgents]);

  return {
    conversationAgents,
    isLoading,
    error,
    addAgent,
    removeAgent,
    refetch: fetchConversationAgents,
  };
}
```

### Data Transformation Strategy

- Use existing `useAgentsStore` to populate agent details
- Transform `ConversationAgent[]` to `ConversationAgentViewModel[]`
- Handle missing agent configurations gracefully with fallback data
- Maintain referential integrity with agent settings

### State Management Requirements

- `conversationAgents: ConversationAgentViewModel[]` - Current agents list
- `isLoading: boolean` - Loading state for async operations
- `error: Error | null` - Current error state
- `addAgent: (agentId: string) => Promise<void>` - Add agent method
- `removeAgent: (agentId: string) => Promise<void>` - Remove agent method
- `refetch: () => Promise<void>` - Manual refresh method

### Error Handling Patterns

- Network errors: Display user-friendly messages
- Validation errors: Show specific field issues
- Missing data: Graceful degradation with fallbacks
- IPC errors: Consistent error serialization handling

## Implementation Guidance

### IPC Integration

- Direct IPC communication (no service abstraction)
- Use existing IPC channels from conversationAgentHandlers
- Follow established response handling patterns
- Maintain consistent error handling with other hooks

### Performance Optimization

- Efficient re-renders using proper dependency arrays
- Memoized callbacks to prevent unnecessary child re-renders
- Minimal network requests (refetch only after mutations)
- Debounced operations where appropriate

### TypeScript Integration

- Full type safety with proper imports
- Use ConversationAgentViewModel for state
- Proper return type interface definition
- Integration with existing IPC type definitions

## Testing Requirements

- Unit tests for all hook methods (fetchConversationAgents, addAgent, removeAgent)
- Loading state transitions testing
- Error handling scenarios for network and validation errors
- Proper cleanup on unmount verification
- Dependency array correctness testing
- Integration tests with mocked IPC calls

## Acceptance Criteria

- ✅ Hook loads conversation agents for given conversation ID
- ✅ Add agent functionality with immediate UI update via refetch
- ✅ Remove agent functionality with state synchronization
- ✅ Loading states during all async operations
- ✅ Comprehensive error handling with user-friendly messages
- ✅ Automatic refetch when conversation ID changes
- ✅ Agent data population using existing agent settings
- ✅ Direct IPC communication following established patterns
- ✅ Proper dependency array management in useEffect/useCallback
- ✅ Type safety with TypeScript throughout
- ✅ Unit tests covering all functionality and edge cases
- ✅ Consistent error handling patterns with other hooks
- ✅ Memoized callbacks for performance optimization

## Dependencies

- ConversationAgentViewModel type (prerequisite task)
- Existing IPC integration (completed in epic)
- useAgentsStore for agent data population
- Existing IPC response types and patterns

## Integration Requirements

- Hook integrates with existing agent store patterns
- Compatible with current component architecture
- Follows established state management conventions
- Proper TypeScript integration throughout

## Security Considerations

- Input validation on agent operations
- Error handling prevents information leakage
- Proper state cleanup on component unmount
- Safe fallback handling for missing agent data

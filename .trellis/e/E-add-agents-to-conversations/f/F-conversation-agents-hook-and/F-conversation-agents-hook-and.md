---
id: F-conversation-agents-hook-and
title: Conversation Agents Hook and State Management
status: in-progress
priority: medium
parent: E-add-agents-to-conversations
prerequisites:
  - F-ipc-integration-for
affectedFiles:
  packages/ui-shared/src/types/conversationAgents/ConversationAgentViewModel.ts:
    Created new ConversationAgentViewModel interface with proper imports from
    AgentSettingsViewModel and comprehensive JSDoc documentation following
    existing ViewModel patterns
  packages/ui-shared/src/types/conversationAgents/index.ts: Created barrel export file for conversationAgents types module
  packages/ui-shared/src/types/index.ts: Added conversationAgents export to main types index for package consumption
  packages/ui-shared/src/types/conversationAgents/__tests__/ConversationAgentViewModel.test.ts:
    Created comprehensive unit tests with 12 passing tests covering interface
    structure, type integration, imports/exports, property validation, and UI
    consistency patterns
log: []
schema: v1.0
childrenIds:
  - T-add-data-transformation-logic
  - T-create-conversationagentviewmo
  - T-create-hook-return-type
  - T-create-useconversationagents
created: 2025-08-25T05:58:58.022Z
updated: 2025-08-25T05:58:58.022Z
---

# Conversation Agents Hook and State Management

## Purpose

Create a custom React hook for managing conversation agent state, following the established useConversations pattern. This hook will provide the data layer interface for UI components to interact with conversation agents.

## Functionality

Implement state management for conversation agents with loading states, error handling, and real-time synchronization using the refetch pattern established in the existing codebase.

## Key Components to Implement

### 1. Custom Hook (`apps/desktop/src/hooks/useConversationAgents.ts`)

- State management for conversation agents list
- Loading and error states
- CRUD operations with proper error handling
- Refetch mechanism for state synchronization
- Integration with IPC layer

### 2. UI Types (`packages/ui-shared/src/types/conversationAgents/`)

- `ConversationAgentViewModel` - UI representation with populated agent data
- Hook return types and method signatures
- Integration with existing `AgentSettingsViewModel`

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Hook loads conversation agents for a given conversation ID
- ✅ Add agent functionality with immediate UI update via refetch
- ✅ Remove agent functionality with state synchronization
- ✅ Loading states during all async operations
- ✅ Comprehensive error handling with user-friendly messages
- ✅ Automatic refetch when conversation ID changes
- ✅ Agent data population using existing agent settings

### State Management Requirements

- ✅ `conversationAgents: ConversationAgentViewModel[]` - Current agents list
- ✅ `isLoading: boolean` - Loading state for async operations
- ✅ `error: Error | null` - Current error state
- ✅ `addAgent: (agentId: string) => Promise<void>` - Add agent method
- ✅ `removeAgent: (agentId: string) => Promise<void>` - Remove agent method
- ✅ `refetch: () => Promise<void>` - Manual refresh method

### Technical Requirements

- ✅ Follow exact pattern from `useConversations` hook
- ✅ Direct IPC communication (no service abstraction)
- ✅ Proper dependency array management in useEffect/useCallback
- ✅ Type safety with TypeScript throughout
- ✅ Consistent error handling patterns

### Performance Requirements

- ✅ Efficient re-renders using proper dependency arrays
- ✅ Memoized callbacks to prevent unnecessary child re-renders
- ✅ Minimal network requests (refetch only after mutations)
- ✅ Debounced operations where appropriate

## Implementation Guidance

### Hook Structure Pattern

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

### Data Population Strategy

- Use existing `useAgentsStore` to populate agent details
- Transform `ConversationAgent` to `ConversationAgentViewModel`
- Handle missing agent configurations gracefully
- Maintain referential integrity with agent settings

### Error Handling Patterns

- Network errors: Display user-friendly messages
- Validation errors: Show specific field issues
- Missing data: Graceful degradation with fallbacks
- IPC errors: Consistent error serialization handling

## Testing Requirements

- ✅ Unit tests for all hook methods
- ✅ Loading state transitions testing
- ✅ Error handling scenarios
- ✅ Proper cleanup on unmount
- ✅ Dependency array correctness testing

## Integration Requirements

- ✅ Hook integrates with existing agent store patterns
- ✅ Compatible with current component architecture
- ✅ Follows established state management conventions
- ✅ Proper TypeScript integration throughout

## Dependencies

- IPC Integration for Conversation Agents (prerequisite)
- Existing `useAgentsStore` hook
- ConversationAgent types (already implemented)
- Existing IPC response patterns

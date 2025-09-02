---
id: T-migrate-conversationagentsprov
title: Migrate ConversationAgentsProvider to use conversation store
status: done
priority: high
parent: F-ui-migration-and-integration
prerequisites: []
affectedFiles:
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
log:
  - "Successfully migrated ConversationAgentsProvider from using the obsolete
    useConversationAgents hook to the unified conversation domain store. The
    provider now uses useConversationStore() and useAgentsStore() directly while
    maintaining complete interface compatibility with existing consumers. Key
    achievements: preserved exact same interface (UseConversationAgentsResult),
    maintained data transformation logic with agent lookup and fallback
    handling, implemented proper conversation selection coordination, and
    ensured all quality checks pass. All consuming components continue to work
    unchanged through the useConversationAgentsContext hook."
schema: v1.0
childrenIds: []
created: 2025-09-01T08:35:19.750Z
updated: 2025-09-01T08:35:19.750Z
---

## Purpose

Migrate the ConversationAgentsProvider from using the obsolete useConversationAgents hook to using the conversation domain store directly, completing the provider migration pattern established in the codebase.

## Context

The ConversationAgentsProvider currently wraps the useConversationAgents hook to provide conversation agent data via React Context. This is one of the last remaining files using the obsolete hook pattern that needs to be migrated to the conversation store before we can safely remove the obsolete hooks.

**Current Implementation**: `apps/desktop/src/contexts/ConversationAgentsContext/ConversationAgentsProvider.tsx`

- Uses `useConversationAgents(conversationId)` hook internally
- Provides the hook result through `ConversationAgentsContext.Provider`

**Target Migration**: Use `useConversationStore()` directly instead of the hook

## Detailed Implementation Requirements

### File to Modify

- **File**: `apps/desktop/src/contexts/ConversationAgentsContext/ConversationAgentsProvider.tsx`
- **Pattern to Follow**: Similar to how other components have been migrated to use `useConversationStore()`

### Migration Steps

1. **Update Imports**:
   - Remove: `import { useConversationAgents } from "../../hooks/conversationAgents/useConversationAgents";`
   - Add: `import { useConversationStore } from "@fishbowl-ai/ui-shared";`

2. **Replace Hook Usage**:
   - Remove: `const value = useConversationAgents(conversationId);`
   - Replace with direct store usage to extract the same data structure

3. **Map Store State to Expected Interface**:
   - The provider needs to provide a `ConversationAgentsContextValue` that matches what components expect
   - Map store state (`activeConversationAgents`, `loading.agents`, `error.agents`) to the expected interface
   - Provide store actions (`addAgent`, `removeAgent`, etc.) in the expected format

4. **Handle Conversation ID Changes**:
   - The provider receives a `conversationId` prop that may change
   - Ensure the store's `selectConversation` action is called when `conversationId` changes
   - Handle the case where `conversationId` is null (should clear active conversation)

### Expected Interface Compatibility

The provider must continue to provide the same interface that consuming components expect:

```typescript
// Current interface from UseConversationAgentsResult
interface ConversationAgentsContextValue {
  conversationAgents: ConversationAgent[];
  loading: boolean;
  error?: ErrorState;
  addAgent: (agentId: string) => Promise<void>;
  removeAgent: (conversationAgentId: string) => Promise<void>;
  refetch: () => Promise<void>;
}
```

Map from store state:

- `conversationAgents` ← `activeConversationAgents` from store
- `loading` ← `loading.agents` from store
- `error` ← `error.agents` from store
- `addAgent` ← `addAgent` action from store
- `removeAgent` ← `removeAgent` action from store
- `refetch` ← `loadConversationAgents` or `refreshActiveConversation` action from store

### Implementation Approach

```typescript
export function ConversationAgentsProvider({
  conversationId,
  children,
}: ConversationAgentsProviderProps) {
  const {
    activeConversationAgents,
    loading,
    error,
    selectConversation,
    addAgent,
    removeAgent,
    loadConversationAgents,
    refreshActiveConversation,
  } = useConversationStore();

  // Handle conversation ID changes
  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
    } else {
      selectConversation(null);
    }
  }, [conversationId, selectConversation]);

  // Map store state to expected interface
  const value: ConversationAgentsContextValue = {
    conversationAgents: activeConversationAgents,
    loading: loading.agents,
    error: error.agents,
    addAgent: (agentId: string) => addAgent(conversationId!, agentId),
    removeAgent: (conversationAgentId: string) => removeAgent(conversationId!, conversationAgentId),
    refetch: () => refreshActiveConversation(),
  };

  return (
    <ConversationAgentsContext.Provider value={value}>
      {children}
    </ConversationAgentsContext.Provider>
  );
}
```

## Acceptance Criteria

### Functional Requirements

- [ ] Provider uses `useConversationStore()` instead of `useConversationAgents` hook
- [ ] All existing functionality preserved (addAgent, removeAgent, refetch)
- [ ] Conversation ID changes trigger appropriate store actions
- [ ] Loading and error states properly mapped from store
- [ ] Interface compatibility maintained for consuming components

### Code Quality Requirements

- [ ] TypeScript compilation succeeds without errors
- [ ] No ESLint or formatting issues
- [ ] Proper error handling maintained
- [ ] React hooks rules followed (dependencies arrays, etc.)

### Testing Requirements

- [ ] Existing provider tests pass without modification
- [ ] Component behavior unchanged from consumer perspective
- [ ] Loading states function correctly
- [ ] Error states display appropriately
- [ ] Conversation switching works properly

## Dependencies

- **Prerequisites**: None (conversation store is already implemented and working)
- **Blocks**: T-remove-obsolete-hooks-and (cannot remove hooks until this migration is complete)

## Technical Approach

1. **Preserve Existing Interface**: Don't change the provider's external interface
2. **Follow Established Patterns**: Use the same store connection pattern as other migrated components
3. **Handle State Mapping**: Carefully map store state to the expected provider interface
4. **Conversation Coordination**: Ensure conversation selection is properly coordinated with the store

## Out of Scope

- Changes to consuming components (they should continue working unchanged)
- Modifications to the ConversationAgentsContext definition
- Changes to the useConversationAgentsContext hook
- Performance optimizations beyond basic store usage

## Implementation Notes

- **Backward Compatibility**: The provider must continue to work exactly as before from the consumer perspective
- **Store Coordination**: The provider is responsible for calling `selectConversation` when its `conversationId` prop changes
- **Error Handling**: Use the same ErrorState patterns established in the store
- **Testing**: Existing tests should continue to pass without modification

## Risk Mitigation

- **Interface Preservation**: Maintain exact same interface to avoid breaking consuming components
- **Gradual Verification**: Test each method (addAgent, removeAgent, refetch) individually
- **Rollback Plan**: Changes are isolated to single file, can be easily reverted

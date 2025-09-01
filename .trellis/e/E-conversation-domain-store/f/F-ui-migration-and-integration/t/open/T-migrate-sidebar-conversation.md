---
id: T-migrate-sidebar-conversation
title: Migrate sidebar conversation list to domain store
status: open
priority: high
parent: F-ui-migration-and-integration
prerequisites:
  - T-extend-servicesprovider-for
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T06:26:34.779Z
updated: 2025-09-01T06:26:34.779Z
---

## Purpose

Replace direct `useConversations` hook usage in the sidebar with conversation domain store, eliminating manual refetch calls and establishing centralized conversation state management.

## Context

The sidebar component (apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx) currently uses `useConversations` hook with manual refetch calls. This needs to be migrated to use the conversation domain store exclusively, following the migration pattern outlined in the feature specification.

## Detailed Implementation Requirements

### Component Migration - SidebarContainerDisplay.tsx

Replace the existing hook usage:

```typescript
// REMOVE: Direct hook usage
const {
  conversations,
  isLoading: _isLoading,
  error: _listError,
  refetch,
} = useConversations();
```

With conversation store integration:

```typescript
// NEW: Domain store integration
const {
  conversations,
  loading,
  error,
  selectConversation,
  createConversationAndSelect,
} = useConversationStore();

const isLoading = loading.conversations;
const listError = error.conversations;
```

### State Management Changes

1. **Remove refetch calls**: Eliminate all manual `refetch()` calls after operations
2. **Use store actions**: Replace direct operations with store actions
3. **Error handling**: Use error states from domain store (ErrorState pattern)
4. **Loading states**: Use loading states from domain store

### Integration Points

1. **Conversation selection**: Use `selectConversation(id)` action
2. **Conversation creation**: Use `createConversationAndSelect(title?)` action
3. **Data source**: Read conversations from store state exclusively
4. **State coordination**: Store automatically handles chat state clearing

### Updated Component Pattern

```typescript
const ConversationSidebar = () => {
  const {
    conversations,
    loading,
    error,
    selectConversation,
    createConversationAndSelect,
  } = useConversationStore();

  const isLoading = loading.conversations;
  const listError = error.conversations;

  const handleConversationSelect = useCallback(
    (id: string) => {
      selectConversation(id);
    },
    [selectConversation],
  );

  const handleCreateConversation = useCallback(
    async (title?: string) => {
      await createConversationAndSelect(title);
    },
    [createConversationAndSelect],
  );

  // Remove all manual refetch() calls
  // Store owns data consistency
};
```

## Acceptance Criteria

### Core Migration Requirements

- [ ] Remove `useConversations` hook import and usage
- [ ] Import and use `useConversationStore` from `@fishbowl-ai/ui-shared`
- [ ] Replace conversations data source with store state
- [ ] Use store loading and error states instead of hook states
- [ ] Eliminate all manual `refetch()` calls
- [ ] Use `selectConversation` action for conversation selection
- [ ] Use `createConversationAndSelect` action for conversation creation

### Functional Requirements

- [ ] Conversation list displays correctly from store data
- [ ] Conversation selection works through store actions
- [ ] New conversation creation works through store actions
- [ ] Loading states display appropriately during operations
- [ ] Error states display using existing ErrorState patterns
- [ ] No functional regressions in sidebar behavior

### State Coordination

- [ ] Conversation selection automatically clears chat state
- [ ] Store handles data consistency without manual refetch
- [ ] Loading states coordinate properly across operations
- [ ] Error handling maintains existing user experience

## Testing Requirements

- [ ] Unit tests verify store integration works correctly
- [ ] Test conversation selection triggers store action
- [ ] Test conversation creation works through store
- [ ] Test loading and error states display properly
- [ ] Test no manual refetch calls remain in component
- [ ] Integration tests verify sidebar functionality preserved

## Technical Approach

1. **Import changes**: Replace useConversations with useConversationStore
2. **State mapping**: Map store states to component expectations
3. **Action integration**: Use store actions for all operations
4. **Remove manual sync**: Eliminate refetch calls throughout component
5. **Error patterns**: Use existing ErrorState display patterns
6. **Loading coordination**: Use store loading states

## Dependencies

- **Prerequisites**: T-extend-servicesprovider-for (store initialization)
- **Store dependency**: useConversationStore with conversation operations
- **Component scope**: SidebarContainerDisplay.tsx and related sidebar components
- **Context integration**: Remove dependency on useConversations hook

## Out of Scope

- Changes to conversation creation modal (separate component)
- Modifications to other conversation operations (rename/delete)
- Chat state management (handled automatically by store)
- Message display components (handled in Phase 2)

## Migration Strategy

- **Preserve behavior**: Maintain exact existing functionality
- **Gradual replacement**: Replace hook usage step by step
- **Test continuously**: Verify functionality after each change
- **Error handling**: Maintain existing error display patterns
- **Performance**: Ensure no regressions in sidebar responsiveness

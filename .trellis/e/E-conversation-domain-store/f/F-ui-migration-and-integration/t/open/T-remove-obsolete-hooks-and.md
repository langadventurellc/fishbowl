---
id: T-remove-obsolete-hooks-and
title: Remove obsolete hooks and context after migration
status: open
priority: low
parent: F-ui-migration-and-integration
prerequisites:
  - T-update-message-item-to-use
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T06:29:17.692Z
updated: 2025-09-01T06:29:17.692Z
---

## Purpose

Clean up obsolete hooks and context components that are no longer needed after the UI migration to the conversation domain store, reducing technical debt and preventing future confusion.

## Context

After migrating all UI components to use the conversation domain store, several hooks and context components are no longer used:

- `useConversations` hook
- `useMessages` hook
- `useConversationAgents` hook
- `useMessagesWithAgentData` hook
- `ConversationAgentsContext` and `ConversationAgentsProvider`
- Related test files and type definitions

## Detailed Implementation Requirements

### Files to Remove

1. **Conversation Hooks**:
   - `apps/desktop/src/hooks/conversations/useConversations.ts`
   - `apps/desktop/src/hooks/conversations/__tests__/useConversations.test.tsx`

2. **Message Hooks**:
   - `apps/desktop/src/hooks/messages/useMessages.ts`
   - `apps/desktop/src/hooks/messages/__tests__/useMessages.test.tsx`
   - `apps/desktop/src/hooks/messages/useMessagesWithAgentData.ts`
   - `apps/desktop/src/hooks/messages/UseMessagesWithAgentDataResult.ts`

3. **Conversation Agent Hooks**:
   - `apps/desktop/src/hooks/conversationAgents/useConversationAgents.ts`
   - `apps/desktop/src/hooks/conversationAgents/__tests__/useConversationAgents.test.tsx`
   - `apps/desktop/src/hooks/conversationAgents/UseConversationAgentsResult.ts`

4. **Context Components**:
   - `apps/desktop/src/contexts/ConversationAgentsContext/ConversationAgentsContext.ts`
   - `apps/desktop/src/contexts/ConversationAgentsContext/ConversationAgentsProvider.tsx`
   - `apps/desktop/src/contexts/ConversationAgentsContext/useConversationAgentsContext.ts`
   - `apps/desktop/src/contexts/ConversationAgentsContext/index.ts`

### Index File Updates

Update barrel exports to remove obsolete exports:

1. **Update `apps/desktop/src/hooks/conversations/index.ts`**:

   ```typescript
   // Remove useConversations export
   export { useCreateConversation } from "./useCreateConversation";
   export { useDeleteConversation } from "./useDeleteConversation";
   export { useRenameConversation } from "./useRenameConversation";
   ```

2. **Update `apps/desktop/src/hooks/messages/index.ts`**:

   ```typescript
   // Remove useMessages and useMessagesWithAgentData exports
   export { useCreateMessage } from "./useCreateMessage";
   export { useUpdateMessage } from "./useUpdateMessage";
   export {
     useMessagesRefresh,
     MessagesRefreshContext,
   } from "./useMessagesRefresh";
   ```

3. **Update `apps/desktop/src/contexts/index.ts`**:
   ```typescript
   // Remove ConversationAgentsContext exports
   export { ServicesProvider } from "./ServicesProvider";
   export { ServicesContext } from "./ServicesContext";
   export { useServices } from "./useServices";
   // ... other existing exports
   ```

### Verification Steps

Before removing files, verify they are not imported anywhere:

1. **Search for imports**: Use global search to find any remaining imports
2. **Check test files**: Ensure no test files still reference removed hooks
3. **Build verification**: Ensure TypeScript compilation succeeds
4. **Runtime verification**: Ensure application starts without errors

## Acceptance Criteria

### File Removal

- [ ] All obsolete hook files removed from filesystem
- [ ] All obsolete context files removed from filesystem
- [ ] All related test files removed from filesystem
- [ ] All related type definition files removed

### Index File Updates

- [ ] Barrel exports updated to remove obsolete exports
- [ ] No broken export references remain
- [ ] TypeScript compilation succeeds after updates
- [ ] No runtime import errors occur

### Verification Requirements

- [ ] Global search confirms no remaining imports of removed hooks
- [ ] TypeScript build passes without errors
- [ ] Application starts successfully
- [ ] All existing functionality works correctly
- [ ] Test suite passes without removed hook references

### Documentation Updates

- [ ] Update any README files that reference removed hooks
- [ ] Update component documentation if it references old patterns
- [ ] Ensure migration is complete and no references remain

## Testing Requirements

- [ ] Run full TypeScript build to catch any missing imports
- [ ] Run full test suite to ensure no tests reference removed hooks
- [ ] Run application and verify all functionality works
- [ ] Test conversation operations to ensure they work through store
- [ ] Test message operations to ensure they work through store
- [ ] Test agent operations to ensure they work through store

## Technical Approach

1. **Gradual removal**: Remove files one category at a time
2. **Import verification**: Search for imports before removing each file
3. **Build testing**: Run TypeScript build after each removal step
4. **Index updates**: Update barrel exports after removing files
5. **Final verification**: Complete application test after all removals

## Dependencies

- **Prerequisites**: T-update-message-item-to-use (all migrations complete)
- **Migration completion**: All UI components using conversation store
- **Testing**: Comprehensive testing of migrated functionality
- **Documentation**: Updated patterns and examples

## Out of Scope

- Changes to remaining active hooks (useCreateMessage, useUpdateMessage, etc.)
- Modifications to other context providers
- Changes to store implementation
- Performance optimizations

## Implementation Notes

- **Safe removal**: Only remove files that are definitively unused
- **Gradual approach**: Remove files in logical groups and test between
- **Documentation**: Update any inline documentation that references removed patterns
- **Future maintenance**: Prevent reintroduction of obsolete patterns

## Risk Mitigation

- **Backup strategy**: Ensure Git history preserves removed files for recovery
- **Verification steps**: Multiple verification steps before final removal
- **Rollback plan**: Clear rollback path if issues are discovered
- **Testing strategy**: Comprehensive testing before and after removal

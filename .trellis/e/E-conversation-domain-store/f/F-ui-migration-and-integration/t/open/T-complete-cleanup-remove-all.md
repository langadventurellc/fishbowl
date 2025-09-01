---
id: T-complete-cleanup-remove-all
title: "Complete cleanup: Remove all obsolete hooks and context files"
status: open
priority: low
parent: F-ui-migration-and-integration
prerequisites:
  - T-migrate-conversationagentsprov
  - T-migrate-messageitem-component
  - T-migrate-usechateventintegratio
  - T-remove-usemessageswithagentdat
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T08:37:56.525Z
updated: 2025-09-01T08:37:56.525Z
---

## Purpose

Complete the final cleanup by removing all obsolete hooks and context files that are no longer needed after the UI migration to the conversation domain store, reducing technical debt and preventing future confusion.

## Context

This is the final cleanup task that was originally described in T-remove-obsolete-hooks-and. After completing the migration of all remaining usages to the conversation store, we can now safely remove the obsolete files.

**Prerequisites Complete**: All remaining usages have been migrated:

- ConversationAgentsProvider → migrated to use store
- MessageItem → migrated to use store
- useChatEventIntegration → migrated to use store
- useMessagesWithAgentData → removed or migrated

**Target State**: Remove all obsolete hook and context files and update barrel exports

## Detailed Implementation Requirements

### Files to Remove

#### 1. Conversation Hooks

- `apps/desktop/src/hooks/conversations/useConversations.ts`
- `apps/desktop/src/hooks/conversations/__tests__/useConversations.test.tsx`

#### 2. Message Hooks

- `apps/desktop/src/hooks/messages/useMessages.ts`
- `apps/desktop/src/hooks/messages/__tests__/useMessages.test.tsx`
- `apps/desktop/src/hooks/messages/useMessagesRefresh.ts` (if no other usage)

#### 3. Conversation Agent Hooks

- `apps/desktop/src/hooks/conversationAgents/useConversationAgents.ts`
- `apps/desktop/src/hooks/conversationAgents/__tests__/useConversationAgents.test.tsx`
- `apps/desktop/src/hooks/conversationAgents/UseConversationAgentsResult.ts`

#### 4. Context Components

- `apps/desktop/src/contexts/ConversationAgentsContext/ConversationAgentsContext.ts`
- `apps/desktop/src/contexts/ConversationAgentsContext/ConversationAgentsProvider.tsx`
- `apps/desktop/src/contexts/ConversationAgentsContext/useConversationAgentsContext.ts`
- `apps/desktop/src/contexts/ConversationAgentsContext/index.ts`
- Remove entire `apps/desktop/src/contexts/ConversationAgentsContext/` directory

### Index File Updates

#### 1. Update `apps/desktop/src/hooks/conversations/index.ts`

Remove the useConversations export:

```typescript
// Remove this line:
// export { useConversations } from "./useConversations";

// Keep these:
export { useCreateConversation } from "./useCreateConversation";
export { useDeleteConversation } from "./useDeleteConversation";
export { useRenameConversation } from "./useRenameConversation";
```

#### 2. Update `apps/desktop/src/hooks/messages/index.ts`

Remove obsolete message hook exports:

```typescript
// Remove these lines:
// export { useMessages } from "./useMessages";
// export { useMessagesWithAgentData } from "./useMessagesWithAgentData";
// export { useMessagesRefresh, MessagesRefreshContext } from "./useMessagesRefresh";

// Keep these:
export { useCreateMessage } from "./useCreateMessage";
export { useUpdateMessage } from "./useUpdateMessage";
```

#### 3. Update `apps/desktop/src/contexts/index.ts`

Remove ConversationAgentsContext exports:

```typescript
// Remove this line:
// export * from "./ConversationAgentsContext";

// Keep these:
export { ServicesProvider } from "./ServicesProvider";
export { ServicesContext } from "./ServicesContext";
export { useServices } from "./useServices";
// ... other existing exports
```

## Verification Steps

### 1. Pre-Removal Verification

Before removing files, verify they are not imported anywhere:

- [ ] **Global search for imports**: Search for any remaining imports of removed hooks
- [ ] **Check test files**: Ensure no test files reference removed hooks
- [ ] **TypeScript compilation**: Ensure project compiles before removal

### 2. Removal Process

- [ ] Remove hook files from filesystem
- [ ] Remove test files from filesystem
- [ ] Remove context files and directory
- [ ] Update barrel export files

### 3. Post-Removal Verification

- [ ] **TypeScript build passes**: `pnpm type-check` succeeds
- [ ] **Linting passes**: `pnpm lint` succeeds with no errors
- [ ] **Application starts**: Desktop app starts without runtime errors
- [ ] **Existing functionality works**: All conversation/message operations work correctly

## Acceptance Criteria

### File Removal Requirements

- [ ] All obsolete hook files removed from filesystem
- [ ] All obsolete context files removed from filesystem
- [ ] All related test files removed from filesystem
- [ ] ConversationAgentsContext directory completely removed

### Index File Updates

- [ ] Barrel exports updated to remove obsolete exports
- [ ] No broken export references remain
- [ ] Only active hooks/contexts are exported

### Build and Runtime Verification

- [ ] TypeScript compilation succeeds: `pnpm type-check`
- [ ] Linting passes: `pnpm lint`
- [ ] Quality checks pass: `pnpm quality`
- [ ] Application starts successfully
- [ ] All existing functionality works correctly

### Documentation Updates

- [ ] Update any README files that reference removed hooks (if any)
- [ ] Ensure no documentation references obsolete patterns
- [ ] Migration is complete with no references remaining

## Dependencies

- **Prerequisites**: All migration tasks must be complete:
  - T-migrate-conversationagentsprov
  - T-migrate-messageitem-component
  - T-migrate-usechateventintegratio
  - T-remove-usemessageswithagentdat

## Technical Approach

1. **Cautious Removal**: Remove files one category at a time
2. **Import Verification**: Search for imports before removing each file
3. **Build Testing**: Run TypeScript build after each removal step
4. **Index Updates**: Update barrel exports after removing files
5. **Final Verification**: Complete application test after all removals

## Out of Scope

- Changes to remaining active hooks (useCreateMessage, useUpdateMessage, etc.)
- Modifications to other context providers
- Changes to store implementation
- Performance optimizations

## Implementation Notes

- **Safe Removal**: Only remove files that are definitively unused
- **Gradual Approach**: Remove files in logical groups and test between
- **Documentation**: Update any inline documentation that references removed patterns
- **Future Maintenance**: Prevent reintroduction of obsolete patterns

## Risk Mitigation

- **Backup Strategy**: Git history preserves removed files for recovery
- **Multiple Verification Steps**: Several verification steps before final removal
- **Rollback Plan**: Clear rollback path if issues are discovered
- **Testing Strategy**: Comprehensive testing before and after removal

This represents the final cleanup of the UI migration to the conversation domain store, completing the elimination of the fragmented state management architecture.

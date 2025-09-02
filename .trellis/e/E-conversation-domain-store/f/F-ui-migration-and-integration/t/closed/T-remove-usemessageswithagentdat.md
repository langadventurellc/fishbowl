---
id: T-remove-usemessageswithagentdat
title: Remove useMessagesWithAgentData composite hook and migrate usage
status: done
priority: medium
parent: F-ui-migration-and-integration
prerequisites:
  - T-migrate-conversationagentsprov
  - T-migrate-messageitem-component
  - T-migrate-usechateventintegratio
affectedFiles:
  apps/desktop/src/hooks/messages/useMessagesWithAgentData.ts:
    Deleted - Composite hook that combined useMessages + useConversationAgents +
    store data for message enrichment (no longer used)
  apps/desktop/src/hooks/messages/UseMessagesWithAgentDataResult.ts: Deleted - TypeScript interface for the removed hook's return type
  apps/desktop/src/hooks/messages/index.ts: Removed barrel export for
    useMessagesWithAgentData hook to prevent import errors
  apps/desktop/src/components/layout/MainContentPanelDisplay.tsx:
    Updated comment to remove reference to deleted hook, maintaining
    documentation of enrichment logic
log:
  - Successfully removed useMessagesWithAgentData composite hook and all
    associated files. The hook was no longer in use as all components (including
    MainContentPanelDisplay) had already been migrated to the conversation store
    pattern. Performed clean removal of hook file, result interface, barrel
    exports, and updated documentation comments. All quality checks pass and no
    functionality was affected.
schema: v1.0
childrenIds: []
created: 2025-09-01T08:37:08.799Z
updated: 2025-09-01T08:37:08.799Z
---

## Purpose

Remove or replace the useMessagesWithAgentData composite hook that combines useMessages and useConversationAgents, since both underlying hooks are becoming obsolete and the functionality has been moved to the conversation store.

## Context

The useMessagesWithAgentData hook is a composite hook that combines data from both useMessages and useConversationAgents hooks to provide enriched message data with agent information. Since both underlying hooks are being removed as part of the store migration, this composite hook needs to be handled.

**Current Implementation**: `apps/desktop/src/hooks/messages/useMessagesWithAgentData.ts`

- Uses `useMessages(conversationId)` to get raw messages
- Uses `useConversationAgents(conversationId)` to get conversation agents
- Uses `useAgentsStore()` and `useRolesStore()` to enrich message data
- Combines all data into enriched MessageViewModel objects

**Target State**: Remove the hook and migrate any remaining usage to direct store usage

## Detailed Implementation Requirements

### Analysis Phase

1. **Check for Current Usage**:
   - Search codebase for any remaining imports/usage of `useMessagesWithAgentData`
   - The task description notes that MainContentPanelDisplay was already migrated from this hook
   - Verify no other components are using this hook

2. **Determine Migration Path**:
   - If no usage found: Simply remove the hook file and export
   - If usage found: Migrate consuming components to use store directly

### Option A: Remove Hook (If No Usage)

If no components are using this hook anymore:

1. **Remove Files**:
   - Delete: `apps/desktop/src/hooks/messages/useMessagesWithAgentData.ts`
   - Delete: `apps/desktop/src/hooks/messages/UseMessagesWithAgentDataResult.ts`

2. **Update Barrel Exports**:
   - Remove from `apps/desktop/src/hooks/messages/index.ts`:
     - `export { useMessagesWithAgentData } from "./useMessagesWithAgentData";`

### Option B: Migrate Usage (If Components Still Use It)

If components are still using this hook:

1. **Replace in Consuming Components**:

   ```typescript
   // Before:
   const { messages, loading, error, refetch } =
     useMessagesWithAgentData(conversationId);

   // After:
   const { activeMessages, loading, error, refreshActiveConversation } =
     useConversationStore();
   const { agents } = useAgentsStore();
   const { roles } = useRolesStore();

   // Move enrichment logic into component with useMemo
   const messages = useMemo(() => {
     // Enrichment logic from the hook
   }, [activeMessages, agents, roles]);
   ```

2. **Follow MainContentPanelDisplay Pattern**:
   - The MainContentPanelDisplay.tsx already shows how to replace this hook
   - Use the same pattern of moving enrichment logic into the component
   - Use useMemo for performance optimization

### Message Enrichment Logic

The hook contains logic to enrich messages with agent data:

- Maps agent_id from messages to agent configurations
- Resolves agent names, avatars, and role information
- Creates MessageViewModel objects with complete agent data

This logic should either be:

- Moved into consuming components (if few consumers)
- Extracted into a utility function (if many consumers)
- Built into a selector in the store (if universally needed)

## Acceptance Criteria

### Analysis Requirements

- [ ] Complete search of codebase for useMessagesWithAgentData usage
- [ ] Determine current usage count and consuming components
- [ ] Document migration approach based on usage analysis

### Option A: Removal (If No Usage)

- [ ] Hook files removed from filesystem
- [ ] Barrel exports updated to remove obsolete exports
- [ ] TypeScript compilation succeeds
- [ ] No broken imports remain

### Option B: Migration (If Usage Found)

- [ ] All consuming components migrated to store usage
- [ ] Message enrichment logic preserved
- [ ] Loading and error states maintained
- [ ] Performance optimizations preserved (useMemo, etc.)
- [ ] Hook files removed after migration complete

### Code Quality Requirements

- [ ] TypeScript compilation succeeds without errors
- [ ] No ESLint or formatting issues
- [ ] No unused imports or dead code
- [ ] Consistent patterns with other store migrations

### Testing Requirements

- [ ] No broken tests due to hook removal
- [ ] Consuming components (if any) continue to work correctly
- [ ] Message enrichment functionality preserved
- [ ] Loading and error states function properly

## Dependencies

- **Prerequisites**:
  - T-migrate-conversationagentsprov (ConversationAgentsProvider migrated)
  - T-migrate-messageitem-component (MessageItem migrated)
  - T-migrate-usechateventintegratio (Chat event integration migrated)
- **Blocks**: T-remove-obsolete-hooks-and (cannot remove underlying hooks until this is complete)

## Technical Approach

1. **Search and Analyze**: Determine current usage of the hook
2. **Choose Migration Path**: Based on usage analysis
3. **Execute Migration**: Either remove directly or migrate usage first
4. **Verify Integration**: Ensure no functionality is lost
5. **Clean Up**: Remove files and update exports

## Out of Scope

- Changes to the underlying store implementation
- Performance optimizations beyond preserving existing patterns
- Changes to MessageViewModel interface
- Creation of new store selectors (unless specifically needed)

## Implementation Notes

- **MainContentPanelDisplay Pattern**: Follow the established migration pattern from this component
- **Message Enrichment**: The enrichment logic is valuable and should be preserved
- **Performance**: Use useMemo for message enrichment to avoid unnecessary re-calculations
- **Store Integration**: Use the same store connection patterns as other migrated components

## Risk Mitigation

- **Usage Analysis First**: Don't remove until we know what's using it
- **Preserve Functionality**: Ensure message enrichment logic is not lost
- **Test Integration**: Verify enriched messages continue to work correctly
- **Rollback Plan**: Keep files until migration is verified complete

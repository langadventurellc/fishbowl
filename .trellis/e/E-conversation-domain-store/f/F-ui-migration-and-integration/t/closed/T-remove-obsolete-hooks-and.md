---
id: T-remove-obsolete-hooks-and
title: Remove obsolete hooks and context after migration
status: wont-do
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

## Status: Cannot Complete as Originally Written

This task was found to be **premature** during implementation research. The migration from obsolete hooks to the conversation store is **not actually complete** - several files still actively use the hooks that this task was meant to remove.

## Problem Discovered

During implementation research, I found that **4 key files** still use the obsolete hooks:

1. **ConversationAgentsProvider.tsx** - Still uses `useConversationAgents` hook
2. **MessageItem.tsx** - Still uses `useMessagesRefresh` hook
3. **useChatEventIntegration.ts** - Still uses `useMessagesRefresh` hook
4. **useMessagesWithAgentData.ts** - Composite hook using both `useMessages` and `useConversationAgents`

**Removing the hooks would break the application.**

## Replacement Task Structure

This task has been **replaced by a proper task sequence** that completes the remaining migration work first:

### Prerequisites (Migration Tasks):

- **T-migrate-conversationagentsprov**: Migrate ConversationAgentsProvider to store
- **T-migrate-messageitem-component**: Migrate MessageItem to store
- **T-migrate-usechateventintegratio**: Migrate useChatEventIntegration to store
- **T-remove-usemessageswithagentdat**: Handle useMessagesWithAgentData composite hook

### Final Cleanup:

- **T-complete-cleanup-remove-all**: Actually remove obsolete hooks (same work as originally planned here)

## Why This Task Won't Do

The original task description stated:

> "After migrating all UI components to use the conversation domain store, several hooks and context components are no longer used"

**This assumption was incorrect.** The migration is not complete, and the hooks are still actively used.

## Next Steps

1. **Complete the migration tasks** listed above
2. **Then execute T-complete-cleanup-remove-all** which contains the same cleanup work originally planned here
3. **This ensures safe removal** without breaking the application

The cleanup work described in this task is still valid and needed - it just needs to happen **after** the remaining migrations are complete, not before.

## Original Task Content

The detailed implementation requirements, file lists, and verification steps from this task have been **preserved in T-complete-cleanup-remove-all**, which will execute the same cleanup once it's safe to do so.

---

**Resolution**: Use the new task sequence instead of this task to safely complete the UI migration cleanup.

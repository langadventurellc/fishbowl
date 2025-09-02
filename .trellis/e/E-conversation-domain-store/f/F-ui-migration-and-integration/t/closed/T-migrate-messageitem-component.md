---
id: T-migrate-messageitem-component
title: Migrate MessageItem component from useMessagesRefresh to store
status: done
priority: high
parent: F-ui-migration-and-integration
prerequisites: []
affectedFiles:
  apps/desktop/src/components/chat/MessageItem.tsx: Migrated from
    useMessagesRefresh hook to useConversationStore. Updated imports to include
    useConversationStore from @fishbowl-ai/ui-shared, removed useMessagesRefresh
    import, replaced { refetch } = useMessagesRefresh() with {
    refreshActiveConversation } = useConversationStore(), and updated refetch()
    calls to use refreshActiveConversation(). Maintained all existing
    functionality including async error handling, conditional checks, and
    message refresh timing.
log:
  - Successfully migrated MessageItem component from useMessagesRefresh hook to
    conversation store. Replaced the obsolete useMessagesRefresh hook with
    direct useConversationStore access, using refreshActiveConversation() method
    for message list refreshes. Migration maintains exact same functionality
    while eliminating dependency on React Context provider and completing the
    pattern established by other UI migrations.
schema: v1.0
childrenIds: []
created: 2025-09-01T08:35:54.889Z
updated: 2025-09-01T08:35:54.889Z
---

## Purpose

Migrate the MessageItem component from using the obsolete useMessagesRefresh hook to using the conversation store's refresh functionality, completing the message refresh pattern migration.

## Context

The MessageItem component currently uses the `useMessagesRefresh` hook to trigger message list refreshes. This is one of the remaining usages of the obsolete hook pattern that needs to be migrated to the conversation store before we can safely remove the obsolete hooks.

**Current Implementation**: `apps/desktop/src/components/chat/MessageItem.tsx`

- Uses `const { refetch } = useMessagesRefresh();` for message list refresh functionality
- Calls `refetch()` after message updates to ensure the message list is current

**Target Migration**: Use conversation store's `refreshActiveConversation()` instead

## Detailed Implementation Requirements

### File to Modify

- **File**: `apps/desktop/src/components/chat/MessageItem.tsx`
- **Pattern to Follow**: Replace `useMessagesRefresh` with `useConversationStore`

### Current Usage Analysis

The component currently uses:

```typescript
import { useMessagesRefresh } from "../../hooks/messages";
// ...
const { refetch } = useMessagesRefresh();
// ...
// Called after message updates
refetch();
```

### Migration Steps

1. **Update Imports**:
   - Remove: `import { useMessagesRefresh } from "../../hooks/messages";`
   - Add: `import { useConversationStore } from "@fishbowl-ai/ui-shared";`

2. **Replace Hook Usage**:
   - Remove: `const { refetch } = useMessagesRefresh();`
   - Replace: `const { refreshActiveConversation } = useConversationStore();`

3. **Update Function Calls**:
   - Replace all `refetch()` calls with `refreshActiveConversation()`
   - Maintain the same timing and conditional logic for refresh calls

4. **Handle Async Operations**:
   - The store method may return a Promise, handle appropriately
   - Maintain existing error handling patterns
   - Ensure loading states are handled if needed

### Implementation Approach

```typescript
// Before:
import { useMessagesRefresh } from "../../hooks/messages";

const MessageItem = ({ message /* other props */ }) => {
  const { refetch } = useMessagesRefresh();

  // ... other logic

  const handleSomeUpdate = async () => {
    // ... update logic
    refetch(); // Refresh message list
  };
};

// After:
import { useConversationStore } from "@fishbowl-ai/ui-shared";

const MessageItem = ({ message /* other props */ }) => {
  const { refreshActiveConversation } = useConversationStore();

  // ... other logic

  const handleSomeUpdate = async () => {
    // ... update logic
    refreshActiveConversation(); // Refresh message list via store
  };
};
```

### Testing Considerations

The existing test file `apps/desktop/src/components/chat/__tests__/MessageItem.test.tsx` has comprehensive tests covering store integration scenarios. These tests should continue to pass after the migration, ensuring:

- Store refresh function calls work correctly
- Null refetch handling works
- Error recovery functions properly
- Loading state coordination works
- Component behavior is preserved

## Acceptance Criteria

### Functional Requirements

- [ ] Component uses `useConversationStore()` instead of `useMessagesRefresh` hook
- [ ] All refresh functionality preserved (same timing and conditions)
- [ ] Message updates still trigger message list refresh
- [ ] Async operation handling maintained
- [ ] Error handling patterns preserved

### Code Quality Requirements

- [ ] TypeScript compilation succeeds without errors
- [ ] No ESLint or formatting issues
- [ ] Import statements cleaned up (no unused imports)
- [ ] Consistent with store usage patterns in other components

### Testing Requirements

- [ ] All existing MessageItem tests pass without modification
- [ ] Store refresh functionality works correctly in tests
- [ ] Component behavior unchanged from user perspective
- [ ] Message refresh timing preserved
- [ ] Error handling continues to work

### Integration Requirements

- [ ] Component works correctly within MessagesRefreshContext
- [ ] No breaking changes to parent components
- [ ] Message list updates work as expected
- [ ] Performance maintained or improved

## Dependencies

- **Prerequisites**: None (conversation store is already implemented)
- **Blocks**: T-remove-obsolete-hooks-and (cannot remove useMessagesRefresh until this is complete)

## Technical Approach

1. **Direct Replacement**: Replace the hook usage with store method calls
2. **Preserve Timing**: Maintain the same timing for refresh calls
3. **Handle Async**: Properly handle any Promise returns from store methods
4. **Test Compatibility**: Ensure existing tests continue to pass

## Out of Scope

- Changes to the component's external interface or props
- Modifications to the test file (should pass unchanged)
- Changes to parent components or context providers
- Performance optimizations beyond basic store usage
- Changes to message update logic (only refresh mechanism)

## Implementation Notes

- **Minimal Changes**: This should be a straightforward hook replacement
- **Preserve Behavior**: The component should work exactly the same from user perspective
- **Test Verification**: Existing comprehensive tests should validate the migration
- **Store Method**: Use `refreshActiveConversation()` which is the equivalent of the old `refetch()`

## Risk Mitigation

- **Isolated Changes**: Changes are limited to import and hook usage
- **Test Coverage**: Comprehensive existing tests will catch any regressions
- **Simple Migration**: This is a direct hook-to-store method replacement
- **Rollback Plan**: Easy to revert if issues are discovered

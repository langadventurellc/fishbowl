---
id: T-add-getactivechatmode
title: Add getActiveChatMode function to conversation store
status: open
priority: high
parent: F-state-management-integration
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T21:12:48.337Z
updated: 2025-09-03T21:12:48.337Z
---

# Add getActiveChatMode Function to Conversation Store

## Context

Integrate chat mode functionality into the existing `useConversationStore` by adding a function that derives the active chat mode from the selected conversation. This function will serve as the foundation for all chat mode-related operations in the store.

## Detailed Requirements

### Implementation Details

Add `getActiveChatMode()` function to the conversation store that:

- Returns `'manual' | 'round-robin' | null` based on the active conversation
- Derives chat mode from selected conversation (no separate state storage)
- Handles null safety when no conversation is selected
- Provides reactive updates when conversation selection changes

### Technical Approach

```typescript
// Add to useConversationStore
getActiveChatMode: (): "manual" | "round-robin" | null => {
  const { activeConversationId, conversations } = get();
  if (!activeConversationId) return null;

  const conversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  return conversation?.chat_mode || null;
},
```

### Files to Modify

- `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

## Acceptance Criteria

- [ ] **Function Implementation**: `getActiveChatMode()` function added to store with correct return type
- [ ] **State Derivation**: Chat mode always derived from conversation, never stored separately
- [ ] **Null Safety**: Returns null when no conversation is selected or conversation not found
- [ ] **Reactivity**: Function returns updated chat mode when conversation selection changes
- [ ] **Performance**: Function execution has negligible performance impact (<1ms)
- [ ] **Unit Tests**: Comprehensive tests for all scenarios including null cases
- [ ] **Type Safety**: Function properly typed with literal union return type

## Testing Requirements

Write unit tests covering:

- Returns correct chat mode for active conversation
- Returns null when no conversation is selected
- Returns null when conversation is not found in array
- Performance benchmark for typical conversation arrays
- Type safety verification

## Dependencies

- Requires F-database-schema-and-core-types completion (Conversation type includes chat_mode field)
- Must work with existing conversation loading and selection logic

## Out of Scope

- Do not implement chat mode setting functionality (separate task)
- Do not modify existing conversation loading logic
- Do not add UI components or user interaction

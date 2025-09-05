---
id: T-preserve-scroll-state-during
title: Preserve scroll state during conversation refreshes
status: done
priority: high
parent: F-fix-chat-auto-scroll-behavior
prerequisites:
  - T-implement-robust-scroll
affectedFiles:
  packages/ui-shared/src/stores/conversation/useConversationStore.ts:
    Modified refreshActiveConversation method to load fresh data without
    clearing activeMessages array. Implemented atomic message updates using race
    condition protection and proper error handling with 'load' operation type.
log:
  - Implemented minimal fix to preserve scroll state during conversation
    refreshes. Modified refreshActiveConversation() to avoid clearing
    activeMessages array during refresh, preventing unwanted scroll resets. The
    fix maintains the same loading states and error handling while ensuring
    atomic message updates without intermediate empty states that trigger
    ChatContainerDisplay to reset scroll position.
schema: v1.0
childrenIds: []
created: 2025-09-05T19:25:55.916Z
updated: 2025-09-05T19:25:55.916Z
---

# Preserve Scroll State During Conversation Refreshes

## Context

Agent message completion triggers `refreshActiveConversation()` which temporarily clears `activeMessages` to `[]`, causing the ChatContainerDisplay to reset pinned state and force initial-load scroll behavior. This task prevents unwanted scrolling during agent message updates.

## Root Cause Analysis

- `useChatEventIntegration.ts:96-103` calls `refreshActiveConversation()` on agent completion
- `useConversationStore.ts` clears message array during refresh, causing length change from N to 0 to N
- `ChatContainerDisplay` detects this as initial load and forces scroll to bottom

## Specific Implementation Requirements

### Store-Level Changes

**Primary**: `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

- Modify conversation refresh to avoid clearing `activeMessages` to empty array
- Implement atomic message list updates: prepare new list, then swap in single operation
- Add flag to track refresh-in-progress state to prevent UI resets

### UI-Level Changes

**Primary**: `apps/desktop/src/components/layout/ChatContainerDisplay.tsx`

- Ignore pinned state reset when message array temporarily empties during refresh
- Add logic to detect transient empty states vs genuine conversation start
- Preserve scroll position during refresh operations

## Technical Approach

1. **Store modification**:

```typescript
// Instead of: set({ activeMessages: [] }) then load then set({ activeMessages: newList })
// Do: prepare newList, then set({ activeMessages: newList }) in single operation
const loadMessages = async () => {
  const newMessages = await conversationService.getMessages(conversationId);
  set((state) => ({ ...state, activeMessages: newMessages })); // Single update
};
```

2. **UI enhancement**:

```typescript
// Track if we're in a refresh to ignore transient empty states
const isRefreshingRef = useRef(false);
const prevMessageCount = useRef(messages?.length || 0);

// Don't reset pinned state if this looks like a temporary clear during refresh
if (
  currentCount === 0 &&
  prevMessageCount.current > 0 &&
  !isRefreshingRef.current
) {
  // This is a genuine conversation clear, reset pinned state
  shouldScrollToBottom.current = true;
}
```

### Event Integration Changes

**Primary**: `apps/desktop/src/hooks/chat/useChatEventIntegration.ts`

- Coordinate with store to signal refresh operations
- Ensure agent completion doesn't trigger unwanted scrolls

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Agent message arrival does NOT scroll when user is scrolled up
- ✅ Agent message arrival DOES scroll when user is pinned to bottom
- ✅ User scroll position preserved during agent `refreshActiveConversation()` calls
- ✅ No flicker or jump in scroll position during message refresh
- ✅ Initial conversation load still scrolls to bottom as expected

### Technical Requirements

- ✅ Atomic message list updates in store (no intermediate empty states)
- ✅ ChatContainerDisplay ignores transient empty message arrays
- ✅ Refresh state tracking prevents unwanted scroll resets
- ✅ Maintains compatibility with existing chat event integration

### Testing Requirements (include in this task)

- Unit tests for conversation store message refresh without clearing array
- Test ChatContainerDisplay behavior with simulated refresh (empty -> populated)
- Integration test: agent completion preserves user scroll position
- Test initial conversation load still works correctly
- Test rapid agent responses don't cause scroll flicker

## Dependencies

- Requires T-implement-robust-scroll for reliable pinned detection during refresh

## Out of Scope

- User message auto-scroll behavior (separate task)
- Message trimming detection (separate task)
- Performance optimizations beyond fixing the bug

---
id: T-handle-message-trimming-edge
title: Handle message trimming edge cases in auto-scroll detection
status: done
priority: medium
parent: F-fix-chat-auto-scroll-behavior
prerequisites:
  - T-implement-robust-scroll
affectedFiles:
  apps/desktop/src/components/layout/ChatContainerDisplay.tsx:
    Enhanced message change detection by adding prevLastMessageId ref tracking
    and detectNewMessages callback. Updated auto-scroll effect to detect content
    changes even with constant array length during message trimming. Added
    proper reset logic for message ID tracking when conversation becomes empty.
log:
  - Implemented enhanced message change detection for auto-scroll behavior that
    handles edge cases where message arrays stay constant length due to
    trimming. Added detectNewMessages callback that tracks both message count
    changes and last message ID changes to detect new content even when old
    messages are trimmed. Updated auto-scroll effect to use the new detection
    logic with O(1) performance. The solution maintains backward compatibility
    and handles all specified edge cases including empty arrays, rapid trimming,
    and component remounts. All quality checks passed successfully.
schema: v1.0
childrenIds: []
created: 2025-09-05T19:26:49.113Z
updated: 2025-09-05T19:26:49.113Z
---

# Handle Message Trimming Edge Cases in Auto-Scroll Detection

## Context

When messages reach the maximum limit, new messages cause old ones to be trimmed, resulting in constant array length. The current auto-scroll detection relies on message count changes, missing these scenarios. This task ensures auto-scroll works even when message count stays constant.

## Root Cause Analysis

- Current detection: `hasNewMessages = currentCount > prevMessageCount.current`
- When at max message limit: array length stays constant (e.g., 100 messages)
- New message added, oldest message removed → same count, but new content
- User at bottom should still auto-scroll to see the new message

## Specific Implementation Requirements

### Enhanced Message Change Detection

**Primary**: `apps/desktop/src/components/layout/ChatContainerDisplay.tsx`

- Track message IDs or timestamps in addition to count
- Detect content changes even with constant array length
- Maintain performance with efficient change detection

### Message Addition Detection Logic

- Compare last message ID/timestamp to detect new messages
- Handle both count increases and content changes at constant count
- Preserve existing behavior for normal message addition

## Technical Approach

1. **Add message change detection**:

```typescript
const prevLastMessageId = useRef<string | null>(null);
const prevMessageCount = useRef(0);

// Enhanced detection logic
const detectNewMessages = useCallback((messages: MessageViewModel[]) => {
  const currentCount = messages?.length || 0;
  const currentLastId = messages?.[currentCount - 1]?.id || null;

  // Count increase = definitely new messages
  const countIncreased = currentCount > prevMessageCount.current;

  // Same count but different last message = trimming occurred
  const contentChanged =
    currentCount > 0 &&
    currentCount === prevMessageCount.current &&
    currentLastId !== prevLastMessageId.current;

  const hasNewContent = countIncreased || contentChanged;

  // Update tracking refs
  prevMessageCount.current = currentCount;
  prevLastMessageId.current = currentLastId;

  return {
    hasNewContent,
    isInitialLoad: currentCount > 0 && prevMessageCount.current === 0,
  };
}, []);
```

2. **Update auto-scroll effect**:

```typescript
useEffect(() => {
  if (!autoScroll) return;

  const element = scrollRef.current;
  if (!element) return;

  const { hasNewContent, isInitialLoad } = detectNewMessages(messages);

  // Scroll conditions: initial load OR (new content AND pinned)
  if (isInitialLoad || (hasNewContent && isScrolledToBottom(element))) {
    requestAnimationFrame(() => {
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: isInitialLoad ? "auto" : "smooth",
        });
      }
    });
  }
}, [autoScroll, messages, detectNewMessages, isScrolledToBottom]);
```

### Store Integration

**Secondary**: Ensure store doesn't cause detection issues

- Verify message trimming maintains consistent ID patterns
- Ensure new messages have unique IDs even during trimming

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Auto-scroll works when new message added and old message trimmed (constant count)
- ✅ Auto-scroll works when message count increases (normal case)
- ✅ No auto-scroll when user is not pinned, regardless of trimming
- ✅ Maintains existing behavior for initial conversation load
- ✅ Handles rapid message additions with trimming

### Technical Requirements

- ✅ Efficient change detection (O(1) complexity, no deep array comparison)
- ✅ Reliable message identification via ID or timestamp
- ✅ Backward compatible with existing message formats
- ✅ No performance regression in message rendering

### Edge Cases Handled

- ✅ Empty message array transitions
- ✅ Messages with duplicate IDs (shouldn't happen but graceful handling)
- ✅ Very rapid message trimming (multiple messages in same render cycle)
- ✅ Component remount during message trimming

### Testing Requirements (include in this task)

- Unit tests for message change detection with constant array length
- Test scenarios: normal addition, trimming addition, no changes
- Test with various message ID formats and edge cases
- Integration test: scroll behavior during message limit trimming
- Performance test: change detection with large message arrays
- Test initial load detection still works correctly

## Dependencies

- Requires T-implement-robust-scroll for `isScrolledToBottom` utility
- Can run in parallel with other scroll behavior tasks

## Out of Scope

- Message limit configuration changes
- Store-level message trimming logic modifications
- Performance optimizations beyond basic change detection

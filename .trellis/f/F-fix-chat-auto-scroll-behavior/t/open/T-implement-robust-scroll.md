---
id: T-implement-robust-scroll
title: Implement robust scroll position detection with synchronous fallback
status: open
priority: high
parent: F-fix-chat-auto-scroll-behavior
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-05T19:25:31.529Z
updated: 2025-09-05T19:25:31.529Z
---

# Implement Robust Scroll Position Detection with Synchronous Fallback

## Context

The current ChatContainerDisplay component relies solely on IntersectionObserver for pinned-to-bottom detection, which can have timing issues during rapid message updates. This task implements a primary scroll math detection method with IntersectionObserver as an enhancement.

## Specific Implementation Requirements

### Primary Scroll Math Detection

- Implement synchronous pinned detection using `scrollHeight - scrollTop - clientHeight <= 100`
- Create helper function `isScrolledToBottom(element: HTMLElement, threshold = 100): boolean`
- Use this as the primary method for all auto-scroll decisions

### Enhanced IntersectionObserver Integration

- Keep existing IntersectionObserver as a performance optimization
- Use observer results to update a cache, but always verify with scroll math before scroll actions
- Handle observer failures gracefully by falling back to scroll math only

### File Modifications

**Primary**: `apps/desktop/src/components/layout/ChatContainerDisplay.tsx`

- Add `isScrolledToBottom` utility function
- Modify existing scroll detection logic in useEffect (lines 88-115)
- Update IntersectionObserver callback to work as cache update rather than primary source

## Technical Approach

1. **Add utility function**:

```typescript
const isScrolledToBottom = useCallback(
  (element: HTMLElement, threshold = 100): boolean => {
    return (
      element.scrollHeight - element.scrollTop - element.clientHeight <=
      threshold
    );
  },
  [],
);
```

2. **Update auto-scroll decision logic**:

- Replace `shouldScrollToBottom.current` checks with real-time `isScrolledToBottom()` calls
- Keep `shouldScrollToBottom.current` as a cache for performance, updated by IntersectionObserver

3. **Maintain backward compatibility**:

- Keep existing props and behavior unchanged
- Ensure smooth scrolling behavior is preserved

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Pinned detection works immediately without waiting for IntersectionObserver
- ✅ Detection accuracy: within 100px of bottom registers as "pinned"
- ✅ Handles rapid message additions without flicker
- ✅ Works correctly even if IntersectionObserver fails or is delayed

### Technical Requirements

- ✅ Scroll math calculation: `scrollHeight - scrollTop - clientHeight <= threshold`
- ✅ Function completes in <5ms for performance
- ✅ No breaking changes to existing ChatContainerDisplay props
- ✅ IntersectionObserver still provides performance benefits when available

### Testing Requirements (include in this task)

- Unit tests for `isScrolledToBottom` utility function with various scroll positions
- Test scenarios: at bottom (0px), near bottom (50px), far from bottom (500px)
- Test with different container sizes and scroll heights
- Test edge case where scrollHeight equals clientHeight (no scroll needed)

## Dependencies

None - this is foundational work needed by other scroll-related tasks

## Out of Scope

- Message addition detection (handled by separate task)
- Store-level conversation refresh handling (separate task)
- User message scroll triggering (separate task)

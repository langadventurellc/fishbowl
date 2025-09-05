---
id: T-implement-robust-scroll
title: Implement robust scroll position detection with synchronous fallback
status: done
priority: high
parent: F-fix-chat-auto-scroll-behavior
prerequisites: []
affectedFiles:
  apps/desktop/src/utils/isScrolledToBottom.ts: Created new utility function for
    synchronous scroll position detection using scroll math with configurable
    threshold (default 100px)
  apps/desktop/src/utils/index.ts: Added barrel export for isScrolledToBottom utility function
  apps/desktop/src/utils/__tests__/isScrolledToBottom.test.ts:
    Added comprehensive unit tests with 12 test cases covering default/custom
    thresholds, edge cases, and boundary conditions
  apps/desktop/src/components/layout/ChatContainerDisplay.tsx:
    Modified to use scroll math as primary pinned detection method. Updated
    handleScroll to use isScrolledToBottom synchronously. Enhanced
    IntersectionObserver to work as cache/verification rather than primary
    source. Added real-time scroll math fallback in auto-scroll logic.
log:
  - Implemented robust scroll position detection with synchronous fallback using
    scroll math as the primary method. Created isScrolledToBottom utility
    function that provides reliable, immediate scroll position detection without
    relying on IntersectionObserver timing. Enhanced ChatContainerDisplay to use
    scroll math (scrollHeight - scrollTop - clientHeight <= 100) as the primary
    detection method, with IntersectionObserver serving as a performance cache.
    Added comprehensive test coverage with 12 test cases covering default/custom
    thresholds, edge cases, and boundary conditions. All quality checks pass
    (lint, format, type-check) and tests pass with 100% success rate.
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

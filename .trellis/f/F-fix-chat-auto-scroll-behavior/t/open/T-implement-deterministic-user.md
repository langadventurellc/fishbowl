---
id: T-implement-deterministic-user
title: Implement deterministic user message auto-scroll
status: open
priority: high
parent: F-fix-chat-auto-scroll-behavior
prerequisites:
  - T-implement-robust-scroll
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-05T19:26:22.566Z
updated: 2025-09-05T19:26:22.566Z
---

# Implement Deterministic User Message Auto-Scroll

## Context

User messages currently fail to auto-scroll when the user is pinned to bottom due to timing issues between message addition and pinned state detection. This task implements imperative scroll control for user messages to ensure reliable auto-scroll behavior.

## Root Cause Analysis

- User message flow: `sendUserMessage()` -> message added to array -> auto-scroll decision
- Pinned detection can flicker during the message addition process
- Current reactive approach relies on useEffect watching message array changes
- Need deterministic control: if user was pinned when they sent message, scroll after message is added

## Specific Implementation Requirements

### ChatContainerDisplay Enhancements

**Primary**: `apps/desktop/src/components/layout/ChatContainerDisplay.tsx`

- Expose imperative `scrollToBottom()` method via forwardRef or callback prop
- Add method to check and scroll: `scrollToBottomIfPinned()`
- Maintain existing reactive scrolling as fallback

### MessageInputContainer Integration

**Primary**: `apps/desktop/src/components/input/MessageInputContainer.tsx`

- Capture pinned state before sending message
- Call imperative scroll after successful message send if user was pinned
- Coordinate with existing `sendUserMessage()` flow

## Technical Approach

1. **Add imperative scroll methods to ChatContainerDisplay**:

```typescript
const scrollToBottom = useCallback((behavior: "auto" | "smooth" = "smooth") => {
  if (scrollRef.current) {
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior,
    });
  }
}, []);

const scrollToBottomIfPinned = useCallback(
  (threshold = 100) => {
    if (scrollRef.current && isScrolledToBottom(scrollRef.current, threshold)) {
      scrollToBottom();
      return true; // scrolled
    }
    return false; // not scrolled
  },
  [scrollToBottom, isScrolledToBottom],
);
```

2. **Expose methods via callback prop**:

```typescript
// Add to ChatContainerDisplayProps
onScrollMethods?: (methods: { scrollToBottomIfPinned: () => boolean }) => void;

// Call in useEffect
useEffect(() => {
  onScrollMethods?.({ scrollToBottomIfPinned });
}, [onScrollMethods, scrollToBottomIfPinned]);
```

3. **Use in MessageInputContainer**:

```typescript
const scrollMethodsRef = useRef<{ scrollToBottomIfPinned: () => boolean }>();

const handleSendMessage = async () => {
  // ... existing validation ...

  try {
    await sendUserMessage(content.trim() || undefined);

    // Deterministic scroll after successful send
    scrollMethodsRef.current?.scrollToBottomIfPinned();

    // ... existing cleanup ...
  } catch {
    // ... existing error handling ...
  }
};
```

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ User message auto-scrolls when user is pinned to bottom (within 100px) before sending
- ✅ User message does NOT auto-scroll when user is scrolled up before sending
- ✅ Scroll occurs after message appears in UI (not before)
- ✅ Uses smooth scrolling behavior for better UX
- ✅ Works consistently regardless of message processing speed

### Technical Requirements

- ✅ Imperative scroll method exposed by ChatContainerDisplay
- ✅ Scroll decision made at send time based on current pinned state
- ✅ No interference with existing reactive scroll logic (maintains as fallback)
- ✅ No breaking changes to existing component APIs

### Edge Cases Handled

- ✅ Rapid user message sending (multiple messages before first scroll completes)
- ✅ Message send failures (no scroll occurs if send failed)
- ✅ Component unmount during message send process
- ✅ Container height changes during message send

### Testing Requirements (include in this task)

- Unit tests for imperative scroll methods in ChatContainerDisplay
- Test scroll method exposure via callback prop
- Test MessageInputContainer integration with scroll methods
- Test user message send scenarios: pinned vs not pinned
- Test rapid user message sending doesn't cause scroll conflicts
- Test message send failure scenarios (no unwanted scrolling)

## Dependencies

- Requires T-implement-robust-scroll for `isScrolledToBottom` utility

## Out of Scope

- Agent message scrolling (handled by separate task)
- Message trimming scenarios (separate task)
- Complex user interaction edge cases beyond basic pinned/not-pinned

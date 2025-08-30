---
id: T-implement-auto-scroll
title: Implement auto-scroll behavior with position preservation
status: open
priority: medium
parent: F-chat-display-integration
prerequisites:
  - T-connect-chatcontainerdisplay
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-30T05:46:04.120Z
updated: 2025-08-30T05:46:04.120Z
---

# Implement Auto-scroll Behavior

## Context

Add intelligent auto-scrolling to ChatContainerDisplay that scrolls to bottom for new messages while preserving user scroll position when they've manually scrolled up to read message history.

## Specific Implementation Requirements

### Location

- **Primary File**: `apps/desktop/src/components/layout/ChatContainerDisplay.tsx`
- **Integration**: Update MainContentPanelDisplay to pass scroll handlers if needed

### Technical Approach

1. **Add scroll position tracking**:

   ```typescript
   const scrollRef = useRef<HTMLDivElement>(null);
   const [isNearBottom, setIsNearBottom] = useState(true);
   ```

2. **Implement scroll detection**:
   - Use intersection observer or scroll event to detect when user is near bottom
   - Consider "near bottom" as within 100px of scroll bottom
   - Update `isNearBottom` state based on scroll position

3. **Add auto-scroll on new messages**:
   - Monitor changes to `messages` array length
   - Auto-scroll to bottom only when `isNearBottom` is true
   - Use smooth scrolling: `scrollRef.current?.scrollTo({ top: scrollHeight, behavior: 'smooth' })`

4. **Handle scroll position preservation**:
   - When user scrolls up manually, set `isNearBottom` to false
   - Don't auto-scroll when user is reading message history
   - Reset `isNearBottom` to true when user manually scrolls to bottom

### Detailed Acceptance Criteria

**Auto-scroll Behavior:**

- ✅ Automatically scrolls to bottom when new messages arrive (if user at bottom)
- ✅ Uses smooth scrolling animation (not instant jumps)
- ✅ Preserves scroll position when user has scrolled up to read history
- ✅ Auto-scroll triggers only when user is within 100px of bottom
- ✅ Handles rapid successive message additions smoothly

**Manual Scroll Handling:**

- ✅ Detects when user manually scrolls away from bottom
- ✅ Stops auto-scrolling while user is reading message history
- ✅ Resumes auto-scrolling when user returns to bottom
- ✅ Works correctly with keyboard navigation (Page Up/Down, arrows)

**Edge Cases:**

- ✅ Handles empty message list gracefully (no unnecessary scrolling)
- ✅ Works correctly when component mounts with existing messages
- ✅ Handles window resize while maintaining appropriate scroll behavior
- ✅ Performs well with large message lists (100+ messages)

**Performance:**

- ✅ Scroll detection doesn't cause excessive re-renders
- ✅ Smooth animations don't block UI interactions
- ✅ Memory cleanup on component unmount

### Implementation Pattern

```typescript
// Add to ChatContainerDisplay component
const scrollRef = useRef<HTMLDivElement>(null);
const [isNearBottom, setIsNearBottom] = useState(true);
const prevMessageCount = useRef(messages?.length || 0);

// Scroll detection
const handleScroll = useCallback(() => {
  const element = scrollRef.current;
  if (!element) return;

  const { scrollTop, scrollHeight, clientHeight } = element;
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
  setIsNearBottom(isAtBottom);
}, []);

// Auto-scroll on new messages
useEffect(() => {
  const currentCount = messages?.length || 0;
  if (currentCount > prevMessageCount.current && isNearBottom) {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
  prevMessageCount.current = currentCount;
}, [messages, isNearBottom]);
```

### Testing Requirements

- Unit tests for scroll position detection accuracy
- Unit tests for auto-scroll triggering on new messages
- Unit tests for scroll preservation when user scrolled up
- Integration tests with message loading and display
- Performance tests with large message lists

### Dependencies

- Requires T-connect-chatcontainerdisplay (messages integration) to be completed
- Uses existing ChatContainerDisplay structure and MessageItem rendering

### Out of Scope

- Scroll-to-bottom button UI (can be added later if needed)
- Virtualization for large message lists (only needed if performance issues)
- Custom scrollbar styling
- Scroll position persistence across app sessions

### Security Considerations

- No security implications for scroll behavior
- Ensure scroll event handlers don't expose sensitive data
- Proper cleanup prevents memory leaks

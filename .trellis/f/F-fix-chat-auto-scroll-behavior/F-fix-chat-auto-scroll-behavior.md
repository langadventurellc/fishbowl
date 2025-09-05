---
id: F-fix-chat-auto-scroll-behavior
title: Fix Chat Auto-Scroll Behavior
status: in-progress
priority: medium
parent: none
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
    source. Added real-time scroll math fallback in auto-scroll logic.;
    Implemented scrollToBottom and scrollToBottomIfPinned imperative methods,
    exposed via onScrollMethods callback
  packages/ui-shared/src/types/chat/ChatContainerDisplayProps.ts:
    Added onScrollMethods callback prop to expose imperative scroll methods for
    deterministic scrolling
  packages/ui-shared/src/types/chat/MessageInputContainerProps.ts:
    Added scrollMethods prop to receive scroll methods for user message
    auto-scroll integration
  apps/desktop/src/components/input/MessageInputContainer.tsx:
    Integrated scroll methods to call scrollToBottomIfPinned after successful
    user message send for deterministic auto-scroll
  apps/desktop/src/components/layout/MainContentPanelDisplay.tsx:
    Wired scroll methods between ChatContainerDisplay and MessageInputContainer
    using callback prop pattern
  apps/desktop/src/components/layout/__tests__/ChatContainerDisplay.test.tsx: Added comprehensive unit tests for imperative scroll methods functionality
  apps/desktop/src/components/input/__tests__/MessageInputContainer.test.tsx: Added tests for scroll methods integration in message input workflow
  apps/desktop/src/components/layout/__tests__/ChatContainerDisplay.scroll-methods.test.tsx: Added focused unit tests for scroll method business logic
log: []
schema: v1.0
childrenIds:
  - T-handle-message-trimming-edge
  - T-implement-deterministic-user
  - T-preserve-scroll-state-during
  - T-implement-robust-scroll
created: 2025-09-05T19:15:41.555Z
updated: 2025-09-05T19:15:41.555Z
---

# Fix Chat Auto-Scroll Behavior

## Purpose and Functionality

Fix inconsistent auto-scrolling behavior in the chat container where:

- Agent messages incorrectly scroll to bottom regardless of user's scroll position
- User messages fail to auto-scroll when user is pinned to bottom
- Both user and agent messages should follow the same behavior: auto-scroll only when user is already at the bottom

## Key Components to Implement

### 1. Robust Scroll Position Detection

- Reliable "pinned to bottom" detection using scroll math as primary method
- IntersectionObserver as enhancement, not dependency
- Handle edge cases like message trimming at max limit

### 2. Scroll State Preservation During Refreshes

- Prevent scroll state reset when `activeMessages` temporarily clears during agent refresh
- Maintain pinned state across conversation refresh operations
- Avoid forcing initial-load scroll behavior on transient empty states

### 3. Deterministic User Message Scroll

- Imperative scroll trigger for user messages when pinned
- Clear detection of new message additions even at constant message count (trimming scenario)

## Detailed Acceptance Criteria

### Functional Behavior

- **User Message Auto-Scroll**: When user is scrolled to bottom (within 100px), adding a user message MUST auto-scroll to show the new message
- **Agent Message Auto-Scroll**: When user is scrolled to bottom (within 100px), adding an agent message MUST auto-scroll to show the new message
- **No Unwanted Scrolling**: When user is NOT at bottom, neither user nor agent messages should trigger auto-scroll
- **Message Trimming Edge Case**: When messages are trimmed at max limit but new message is appended (constant length), auto-scroll should still occur if user is pinned
- **Scroll Position Memory**: User's scroll position should be preserved during agent conversation refreshes
- **Smooth Scrolling**: Auto-scroll should use smooth behavior for non-initial loads

### Technical Requirements

- **Pinned Detection**: Primary method using `scrollHeight - scrollTop - clientHeight <= threshold`
- **State Preservation**: Avoid resetting pinned state during transient empty message arrays
- **Refresh Handling**: Prevent `refreshActiveConversation()` from triggering unwanted initial-load scroll

## Implementation Guidance

### Technical Approach

1. **Robust Pinned Detection**: Use scroll math (`scrollHeight - scrollTop - clientHeight <= 100`) as primary detection method
2. **Preserve Scroll State**: Avoid clearing `activeMessages` to `[]` during refresh, or ignore pinned reset on transient emptiness
3. **Deterministic User Scroll**: Expose imperative `scrollToBottom()` method and call on successful user send if pinned
4. **Message Addition Detection**: Handle both length increase and constant-length scenarios (trimming)

### Key Files to Modify

- `apps/desktop/src/components/layout/ChatContainerDisplay.tsx` - Core scroll logic and pinned detection
- `packages/ui-shared/src/stores/conversation/useConversationStore.ts` - Preserve message list during refresh
- `apps/desktop/src/hooks/chat/useChatEventIntegration.ts` - Agent refresh handling

### Architecture Patterns

- Keep UI-specific scroll behavior in UI layer (ChatContainerDisplay)
- Minimal shared store changes - avoid UI coupling in cross-platform packages
- Atomic message list updates - swap when new data ready, don't clear to empty

## Testing Requirements

### Core Test Scenarios

1. **User at bottom, types message** → should auto-scroll
2. **User at bottom, agent responds** → should auto-scroll
3. **User scrolled up, types message** → should NOT auto-scroll
4. **User scrolled up, agent responds** → should NOT auto-scroll
5. **Message trimming at max limit while pinned** → should auto-scroll
6. **Agent refresh while user scrolled up** → should preserve scroll position

### Implementation Tests

- Pinned detection accuracy with scroll math
- Scroll state preservation during conversation refresh
- Message addition detection with constant array length

## Root Cause Analysis Context

### Agent Message Issue

- `refreshActiveConversation()` temporarily clears `activeMessages` to `[]`
- This resets pinned state and triggers initial-load scroll behavior in ChatContainerDisplay
- **Fix**: Preserve message list until new data ready, then swap atomically

### User Message Issue

- Pinned detection can flicker during rapid updates
- Message addition detection fails when messages are trimmed at maximum limit
- **Fix**: Use reliable scroll math for pinned detection, detect additions beyond just length changes

## Success Metrics

- Zero unwanted scroll events when user is not at bottom
- 100% auto-scroll reliability when user is at bottom
- Consistent behavior between user and agent message flows
- Proper handling of message trimming edge cases

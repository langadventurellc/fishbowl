---
id: T-enhance-conversation
title: Enhance conversation progression trigger in subscribeToAgentUpdates
status: open
priority: high
parent: F-round-robin-behavior
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T23:55:38.435Z
updated: 2025-09-03T23:55:38.435Z
---

# Enhance Conversation Progression Trigger

## Context

The Round Robin mode requires automatic agent rotation after each agent completes a response. The current implementation has a basic trigger but needs enhancement to handle edge cases and ensure proper timing.

## Technical Approach

Update the `subscribeToAgentUpdates` method in `useConversationStore.ts` to properly trigger `handleConversationProgression` when `event.status === "complete"` in Round Robin mode.

## Detailed Requirements

### Event Handling Enhancement

- Enhance the existing trigger in `subscribeToAgentUpdates`
- Ensure progression only occurs in Round Robin mode using `getActiveChatMode()`
- Add proper timing delay (100ms) to ensure response is fully processed
- Add error handling to prevent app crashes from rotation failures
- Maintain callback processing for external event handlers

### Implementation Details

```typescript
// Enhanced agent update event handling in subscribeToAgentUpdates
const handleAgentUpdate = (event: AgentUpdateEvent) => {
  // ... existing event handling

  // Trigger progression for completed agent responses
  if (event.status === "complete") {
    const activeChatMode = get().getActiveChatMode();
    if (activeChatMode === "round-robin") {
      // Small delay to ensure response is fully processed
      setTimeout(() => {
        get().handleConversationProgression();
      }, 100);
    }
  }

  if (callback) callback(event);
};
```

### Error Handling

- Wrap progression trigger in try-catch blocks
- Log errors without crashing the application
- Ensure user experience remains smooth even if rotation fails
- Maintain existing callback functionality

## Acceptance Criteria

- [ ] Automatic rotation triggers after agent completes response (`event.status === "complete"`)
- [ ] Only triggers in Round Robin mode, not Manual mode
- [ ] 100ms delay ensures response processing completion
- [ ] Error handling prevents app crashes from rotation failures
- [ ] External event callbacks continue to work properly
- [ ] No impact on existing event subscription functionality

## Files to Modify

- `packages/ui-shared/src/stores/conversation/useConversationStore.ts` - Enhance handleAgentUpdate function

## Testing Requirements

- Unit tests for event filtering (complete vs non-complete status)
- Unit tests for mode-specific triggering (Round Robin only)
- Unit tests for error handling and recovery
- Unit tests for callback preservation
- Integration tests for actual agent progression

## Dependencies

- Requires existing `handleConversationProgression` method
- Requires existing `getActiveChatMode` method
- Must maintain compatibility with existing event subscription patterns

## Out of Scope

- Changes to the core handleConversationProgression logic
- Modifications to manual mode behavior
- UI feedback for progression events

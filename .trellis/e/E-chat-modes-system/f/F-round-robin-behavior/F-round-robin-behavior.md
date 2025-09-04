---
id: F-round-robin-behavior
title: Round Robin Behavior Implementation
status: done
priority: medium
parent: E-chat-modes-system
prerequisites:
  - F-state-management-integration
  - F-chat-mode-selector-component
affectedFiles:
  packages/ui-shared/src/stores/conversation/useConversationStore.ts:
    Enhanced subscribeToAgentUpdates method with Round Robin mode filtering and
    error handling. Added getActiveChatMode() check before triggering
    progression and wrapped handleConversationProgression() in try-catch block
    with console.error logging.; No changes needed - setChatMode method (lines
    264-305) already enhanced with Round Robin enforcement and
    enforceRoundRobinInvariant helper (lines 312-337) fully implemented;
    Enhanced edge case handling in handleConversationProgression with
    comprehensive logging, race condition protection, and error recovery.
    Integrated Round Robin agent removal logic in removeAgent method for
    automatic next agent selection. Added handleProgressionRecovery method for
    invalid state detection and recovery. Fixed race condition in
    subscribeToAgentUpdates event handling.
  packages/ui-shared/src/stores/conversation/__tests__/conversationProgression.test.ts:
    Added comprehensive test coverage for enhanced progression functionality
    including mode filtering tests, error handling validation, and callback
    preservation verification. Updated existing tests to work with immediate
    progression calls.
  packages/ui-shared/src/stores/conversation/__tests__/setChatMode.test.ts:
    No changes needed - comprehensive test coverage already exists with 12
    passing tests covering all scenarios including successful updates, Round
    Robin enforcement, error handling, and edge cases
  packages/ui-shared/src/chat-modes/RoundRobinChatMode.ts: Added comprehensive
    debugging logging throughout all methods. Implemented handleAgentRemoved
    method for proper agent state management during removal with support for
    single agent, no agents, and multiple agents scenarios. Added
    validateInvariant method for proactive Round Robin state validation with
    detailed logging.
  packages/ui-shared/src/types/chat-modes/ChatModeHandler.ts: Extended interface
    with optional handleAgentRemoved method for agent removal handling. Added
    comprehensive JSDoc documentation with usage examples showing Manual mode
    no-op behavior and Round Robin automatic selection.
  packages/ui-shared/src/chat-modes/ManualChatMode.ts: Implemented no-op
    handleAgentRemoved method for interface consistency. Added comprehensive
    JSDoc documentation explaining Manual mode preserves user control during
    agent removal.
  packages/ui-shared/src/stores/conversation/ConversationStoreActions.ts:
    Added handleProgressionRecovery method to interface for error recovery
    capabilities with invalid state detection and logging support.
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-enhance-agent-addition
  - T-enhance-conversation
  - T-implement-comprehensive-edge
  - T-implement-mode-switching
  - T-implement-robust-error
created: 2025-09-03T18:36:51.257Z
updated: 2025-09-03T18:36:51.257Z
---

# Round Robin Behavior Implementation Feature

## Overview

Implement the complete Round Robin chat mode behavior including automatic agent rotation, manual override handling, and edge case management. This feature brings together all the foundational components to deliver the full Round Robin user experience.

## Functionality

### Automatic Agent Rotation

- Implement post-response agent rotation using `event.status === "complete"` in Round Robin mode
- Ensure proper rotation order based on display_order and added_at
- Handle single agent scenarios without unnecessary state changes
- Integrate with existing agent response event system

### Manual Override Behavior

- Support user manual toggling of agents in Round Robin mode
- Implement proper state transitions when users override rotation
- Maintain Round Robin invariants after manual changes
- Provide clear user feedback for override actions

### Edge Case Handling

- Single agent conversations (no rotation flicker)
- Empty agent lists and error recovery
- Agent removal during active rotation
- Conversation mode switching with immediate enforcement

## Acceptance Criteria

### Automatic Rotation Logic

- [ ] **Post-Response Rotation**: After any agent completes a response (using `event.status === "complete"`), automatically rotate to next agent
- [ ] **Rotation Order**: Uses `display_order` then `added_at` timestamp for deterministic sequencing
- [ ] **Wrap-around**: After last agent, rotation returns to first agent in sequence
- [ ] **Single Agent No-op**: When only one agent exists, no disable/enable flicker occurs
- [ ] **Empty List Handling**: Gracefully handles conversations with no agents
- [ ] **Naming Consistency**: All rotation logic uses 'round-robin' consistently

### Manual Override Behavior

- [ ] **Disable Current**: User can disable currently enabled agent, leaving no agents enabled
- [ ] **Enable Different**: User can enable different agent, automatically disabling current enabled agent
- [ ] **State Consistency**: Manual changes maintain Round Robin single-enabled invariant
- [ ] **Visual Feedback**: UI clearly shows which agent is currently enabled
- [ ] **Override Persistence**: Manual overrides don't interfere with subsequent automatic rotation

### Mode Switching Enforcement

- [ ] **Immediate Enforcement**: Switching to Round Robin immediately enforces single-enabled invariant
- [ ] **First Enabled Selection**: When multiple agents enabled, keeps first by display_order/added_at
- [ ] **State Preservation**: Switching to Manual preserves current agent enabled states
- [ ] **Internal Helper**: Mode enforcement handled by internal store helper method

### Agent Addition Integration

- [ ] **First Agent Auto-Enable**: First agent added to empty Round Robin conversation automatically enabled
- [ ] **Subsequent Agents Disabled**: Additional agents added in disabled state
- [ ] **Preserve Current**: Adding agents doesn't change currently enabled agent
- [ ] **Order Integration**: New agents properly integrated into rotation sequence

### Error Handling and Recovery

- [ ] **Service Failures**: Failed agent state updates handled gracefully with rollback
- [ ] **Race Conditions**: Concurrent operations handled safely with existing request token pattern
- [ ] **Invalid States**: Detection and recovery from invalid agent configurations
- [ ] **Network Issues**: Retry logic and offline behavior for agent state changes

### Testing Requirements

- [ ] **End-to-End Tests**: Complete Round Robin workflows from conversation creation to multi-agent rotation
- [ ] **Edge Case Tests**: Single agent, empty conversations, agent removal scenarios
- [ ] **Manual Override Tests**: All user override scenarios and state transitions
- [ ] **Integration Tests**: Mode switching with immediate enforcement
- [ ] **Performance Tests**: Rotation performance with large agent counts

## Implementation Guidance

### Rotation Logic Implementation

```typescript
// Enhanced Round Robin handler with proper edge case handling
export class RoundRobinChatMode implements ChatModeHandler {
  readonly name = "round-robin";

  handleConversationProgression(agents: ConversationAgent[]): ChatModeIntent {
    // Handle edge cases first
    if (agents.length <= 1) {
      return { toEnable: [], toDisable: [] }; // No rotation needed
    }

    const enabledAgents = agents.filter((a) => a.enabled);
    if (enabledAgents.length === 0) {
      return { toEnable: [], toDisable: [] }; // No agent to rotate from
    }

    // Sort agents by rotation order
    const sortedAgents = this.getSortedAgents(agents);
    const currentIndex = sortedAgents.findIndex((a) => a.enabled);

    if (currentIndex === -1) return { toEnable: [], toDisable: [] };

    // Calculate next agent in rotation
    const nextIndex = (currentIndex + 1) % sortedAgents.length;

    return {
      toEnable: [sortedAgents[nextIndex].id],
      toDisable: [sortedAgents[currentIndex].id],
    };
  }

  private getSortedAgents(agents: ConversationAgent[]): ConversationAgent[] {
    return agents.sort((a, b) => {
      // Primary sort: display_order
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }

      // Secondary sort: added_at timestamp
      return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
    });
  }
}
```

### Mode Switching Enforcement

```typescript
// Store method for enforcing Round Robin invariant (internal/private)
enforceRoundRobinInvariant: async () => {
  const { activeConversationAgents } = get();
  const enabledAgents = activeConversationAgents.filter((a) => a.enabled);

  if (enabledAgents.length <= 1) return; // Already compliant

  // Keep first enabled agent by rotation order
  const sortedAgents = activeConversationAgents.sort(
    (a, b) =>
      a.display_order - b.display_order ||
      new Date(a.added_at).getTime() - new Date(b.added_at).getTime(),
  );
  const firstEnabled = sortedAgents.find((a) => a.enabled);

  if (!firstEnabled) return;

  // Disable all others
  const intent: ChatModeIntent = {
    toEnable: [firstEnabled.id],
    toDisable: enabledAgents
      .filter((a) => a.id !== firstEnabled.id)
      .map((a) => a.id),
  };

  await get().processAgentIntent(intent);
};
```

### Event Integration

```typescript
// Enhanced agent update event handling
subscribeToAgentUpdates: (callback?: (event: AgentUpdateEvent) => void) => {
  const handleAgentUpdate = (event: AgentUpdateEvent) => {
    // ... existing event handling

    // Trigger progression for completed agent responses using status === "complete"
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

  // ... rest of subscription logic
};
```

### Files to Modify

- `packages/ui-shared/src/chat-modes/RoundRobinChatMode.ts`
- `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

### Security Considerations

- **State Validation**: Validate agent states before applying rotation changes
- **Concurrent Access**: Handle multiple users modifying same conversation safely
- **Rate Limiting**: Prevent excessive rotation requests from overwhelming system
- **Error Boundaries**: Isolate Round Robin errors to prevent app crashes

### Performance Requirements

- **Rotation Speed**: Agent rotation completes within 100ms
- **Large Agent Lists**: Efficient handling of conversations with 50+ agents
- **Memory Usage**: No memory leaks from rotation timers or event handlers
- **CPU Usage**: Sorting and rotation algorithms remain efficient

### User Experience Considerations

- **Visual Feedback**: Clear indication of current enabled agent during rotation
- **Smooth Transitions**: Agent state changes appear smooth and intentional
- **Predictable Behavior**: Users can predict which agent will respond next
- **Override Clarity**: Manual overrides are clearly distinguished from automatic rotation

### Error Handling Pattern

```typescript
// Robust error handling for rotation
handleConversationProgression: async () => {
  try {
    const activeChatMode = get().getActiveChatMode();
    if (activeChatMode !== "round-robin") return;

    const { activeConversationAgents } = get();
    const chatModeHandler = createChatModeHandler(activeChatMode);
    const intent = chatModeHandler.handleConversationProgression(
      activeConversationAgents,
    );

    await get().processAgentIntent(intent);
  } catch (error) {
    console.error("Round Robin progression failed:", error);
    // Don't crash the app, just log the error
  }
};
```

## Dependencies

- `F-state-management-integration` (requires conversation progression handling and `getActiveChatMode()`)
- `F-chat-mode-selector-component` (requires UI for mode switching)

## Success Metrics

- [ ] Round Robin rotation works correctly in all conversation scenarios using 'round-robin'
- [ ] Manual overrides function properly without breaking automatic rotation
- [ ] Mode switching immediately enforces correct agent states
- [ ] Event integration uses `event.status === "complete"` correctly
- [ ] Edge cases handled gracefully without user-visible errors
- [ ] Performance requirements met for typical and large agent counts

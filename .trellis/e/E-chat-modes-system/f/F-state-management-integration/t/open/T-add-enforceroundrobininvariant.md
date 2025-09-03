---
id: T-add-enforceroundrobininvariant
title: Add enforceRoundRobinInvariant helper method
status: open
priority: medium
parent: F-state-management-integration
prerequisites:
  - T-add-chat-mode-delegation-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T21:14:16.556Z
updated: 2025-09-03T21:14:16.556Z
---

# Add enforceRoundRobinInvariant Helper Method

## Context

Implement a private helper method that ensures only one agent is enabled when switching to Round Robin mode. This method will handle the immediate enforcement of the single-enabled invariant when users switch from Manual to Round Robin mode.

## Detailed Requirements

### Implementation Details

Add `enforceRoundRobinInvariant()` private helper method that:

- Checks current enabled agent count and enforces single-enabled rule
- Uses deterministic ordering (display_order then added_at) to select which agent remains enabled
- Disables all other enabled agents while keeping the first one by rotation order
- Uses existing processAgentIntent() for consistent state updates
- Handles edge cases (no enabled agents, single enabled agent already)

### Technical Approach

```typescript
// Private helper for enforcing Round Robin invariant
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
},
```

### Files to Modify

- `packages/ui-shared/src/stores/conversation/useConversationStore.ts`

## Acceptance Criteria

- [ ] **Method Implementation**: enforceRoundRobinInvariant() method added as private helper
- [ ] **Single-Enabled Rule**: Ensures only one agent remains enabled after execution
- [ ] **Deterministic Selection**: Uses display_order then added_at for consistent agent selection
- [ ] **Intent Processing**: Uses processAgentIntent() for state updates
- [ ] **Edge Case Handling**: Handles no enabled agents, single enabled agent scenarios
- [ ] **Early Return**: Returns early when already compliant (0-1 enabled agents)
- [ ] **Integration**: Called by setChatMode() when switching to Round Robin
- [ ] **Unit Tests**: Tests for various agent configurations and edge cases
- [ ] **Performance**: Efficient sorting and filtering for typical agent counts

## Testing Requirements

Write comprehensive tests covering:

- Multiple enabled agents: disables all but first by rotation order
- Single enabled agent: no changes (early return)
- No enabled agents: no changes (early return)
- Deterministic selection with various display_order and added_at combinations
- Integration with processAgentIntent() for state updates
- Error handling and recovery scenarios

## Dependencies

- Requires processAgentIntent() helper method (T-add-chat-mode-delegation-to)
- Uses existing ChatModeIntent interface and ConversationAgent type
- Integrates with setChatMode() action (T-implement-setchatmode-action)

## Implementation Guidance

### Agent Sorting Logic

Use the same deterministic ordering as the RoundRobinChatMode handler:

1. Primary sort: `display_order` (ascending)
2. Secondary sort: `added_at` timestamp (ascending)
3. Find first enabled agent from sorted array
4. Keep that agent enabled, disable all others

### Intent Pattern

Create intent object with:

- `toEnable`: Array containing the ID of the agent to keep enabled
- `toDisable`: Array containing IDs of all other currently enabled agents

This ensures consistent behavior with other chat mode operations.

### Edge Case Behavior

- **0 enabled agents**: No action needed, return early
- **1 enabled agent**: Already compliant, return early
- **2+ enabled agents**: Apply single-enabled invariant

## Out of Scope

- Do not modify existing agent sorting or ordering logic elsewhere
- Do not implement UI feedback for enforcement actions
- Do not change the underlying chat mode handler behavior
- Do not add configuration options for different enforcement strategies

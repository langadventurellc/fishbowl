---
id: T-implement-mode-switching
title: Implement mode switching enforcement with immediate Round Robin invariant
status: done
priority: high
parent: F-round-robin-behavior
prerequisites:
  - T-enhance-conversation
affectedFiles:
  packages/ui-shared/src/stores/conversation/useConversationStore.ts:
    No changes needed - setChatMode method (lines 264-305) already enhanced with
    Round Robin enforcement and enforceRoundRobinInvariant helper (lines
    312-337) fully implemented
  packages/ui-shared/src/stores/conversation/__tests__/setChatMode.test.ts:
    No changes needed - comprehensive test coverage already exists with 12
    passing tests covering all scenarios including successful updates, Round
    Robin enforcement, error handling, and edge cases
log:
  - "Task T-implement-mode-switching was already fully implemented and completed
    in the codebase. Verified the existing implementation meets all
    requirements: setChatMode method properly enforces Round Robin invariant
    when switching modes, all test cases are passing (12/12), and quality checks
    are green. The implementation includes proper agent sorting by display_order
    and added_at, edge case handling, and comprehensive error handling as
    specified in the acceptance criteria."
schema: v1.0
childrenIds: []
created: 2025-09-03T23:55:59.513Z
updated: 2025-09-03T23:55:59.513Z
---

# Implement Mode Switching Enforcement

## Context

When users switch to Round Robin mode, the system must immediately enforce the single-enabled agent invariant. If multiple agents are currently enabled, only the first agent (by display_order then added_at) should remain enabled.

## Technical Approach

Enhance the existing `setChatMode` method in `useConversationStore.ts` to call the `enforceRoundRobinInvariant` helper method when switching to Round Robin mode.

## Detailed Requirements

### Enhanced setChatMode Method

- Update `setChatMode` to call `enforceRoundRobinInvariant()` after successful Round Robin mode switch
- Ensure enforcement only happens when switching TO Round Robin mode
- Maintain existing error handling and loading states
- Preserve Manual mode behavior (no enforcement needed)

### Optimized enforceRoundRobinInvariant Helper

- Keep the existing efficient implementation that checks if enforcement is needed
- Ensure proper agent sorting by display_order then added_at
- Use existing `processAgentIntent` method for state updates
- Handle edge cases (no agents, single agent, all disabled)

### Implementation Details

```typescript
setChatMode: async (chatMode: "manual" | "round-robin") => {
  try {
    // ... existing implementation

    // After successful mode change, enforce Round Robin invariant
    if (chatMode === "round-robin") {
      await get().enforceRoundRobinInvariant();
    }
  } catch (error) {
    // ... existing error handling
  }
};
```

### Agent Selection Logic

- Select first enabled agent by display_order (ascending)
- Use added_at timestamp as tiebreaker (ascending)
- Keep selected agent enabled, disable all others
- Handle case where no agents are currently enabled (no changes needed)

## Acceptance Criteria

- [ ] Switching to Round Robin immediately enforces single-enabled invariant
- [ ] First enabled agent by display_order/added_at remains enabled
- [ ] All other enabled agents become disabled
- [ ] Manual mode switching preserves current agent states
- [ ] No enforcement when already in Round Robin with compliant state
- [ ] Edge cases handled gracefully (no agents, single agent)
- [ ] Existing error handling and loading states preserved

## Files to Modify

- `packages/ui-shared/src/stores/conversation/useConversationStore.ts` - Enhance setChatMode method

## Testing Requirements

- Unit tests for Round Robin mode switching with enforcement
- Unit tests for Manual mode switching (no enforcement)
- Unit tests for edge cases (empty, single agent, all disabled)
- Unit tests for already-compliant states (no unnecessary changes)
- Unit tests for error handling during enforcement
- Integration tests with actual agent state updates

## Dependencies

- Requires existing `enforceRoundRobinInvariant` helper method
- Requires existing `processAgentIntent` method
- Requires existing `setChatMode` base implementation

## Out of Scope

- UI feedback for enforcement actions
- Batch updates for multiple mode switches
- Undo functionality for mode changes

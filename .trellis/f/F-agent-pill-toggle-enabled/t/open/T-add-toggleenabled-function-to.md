---
id: T-add-toggleenabled-function-to
title: Add toggleEnabled function to useConversationAgents hook
status: open
priority: medium
parent: F-agent-pill-toggle-enabled
prerequisites:
  - T-add-update-handler-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T03:58:48.900Z
updated: 2025-08-29T03:58:48.900Z
---

# Add toggleEnabled function to useConversationAgents hook

## Context

Extend the `useConversationAgents` hook to include a `toggleEnabled` function that allows toggling the enabled state of conversation agents via the new UPDATE IPC channel.

## Technical Approach

1. Add `toggleEnabled` function that calls the new UPDATE IPC endpoint
2. Follow existing patterns from `addAgent` and `removeAgent` functions
3. Use optimistic updates with refetch pattern for consistency
4. Include proper error handling

## Specific Implementation Requirements

### Function Signature

```typescript
const toggleEnabled = useCallback(
  async (conversationAgentId: string) => {
    // Implementation here
  },
  [conversationId, fetchConversationAgents],
);
```

### Implementation Details

- Get current agent state to determine current enabled value
- Call `window.electronAPI.conversationAgent.update()` with toggled enabled state
- Use refetch pattern like existing functions for state consistency
- Handle errors by setting error state
- Include proper TypeScript typing

### Hook Return Value

- Add `toggleEnabled` to the returned object from the hook
- Update `UseConversationAgentsResult` interface if needed

## Acceptance Criteria

- [ ] `toggleEnabled` function added to useConversationAgents hook
- [ ] Function toggles enabled state correctly
- [ ] Uses existing refetch pattern for state consistency
- [ ] Includes proper error handling and loading states
- [ ] TypeScript types updated appropriately
- [ ] Unit tests verify function behavior
- [ ] Follows existing code patterns and conventions

## Files to Modify

- `apps/desktop/src/hooks/conversationAgents/useConversationAgents.ts`
- Update `UseConversationAgentsResult` type if needed

## Dependencies

- Prerequisite: UPDATE IPC handler must be implemented
- Requires `window.electronAPI.conversationAgent.update` method to exist

## Testing Requirements

- Unit tests for toggleEnabled function
- Test optimistic update and refetch behavior
- Test error handling scenarios
- Mock IPC calls appropriately

## Out of Scope

- Do not modify the component usage yet
- Do not implement UI changes

---
id: T-update-renderer-event
title: Update renderer event handlers and tests for enhanced AgentUpdateEvent
status: open
priority: medium
parent: F-enhanced-ipc-event-integration
prerequisites:
  - T-update-preload-type
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T05:44:32.075Z
updated: 2025-09-01T05:44:32.075Z
---

## Purpose

Update renderer-side event handlers and associated tests to properly handle the enhanced AgentUpdateEvent structure with conversationId field, ensuring existing event processing logic continues to work seamlessly.

## Context

Renderer components and services that consume AgentUpdateEvents through `window.electronAPI.chat.onAgentUpdate` need to be updated to handle the new conversationId field. This includes both production code and test files that mock or validate event handling.

## Implementation Requirements

### Files to Investigate and Update

1. **Search for existing event consumers**:
   - Find all files that use `onAgentUpdate` or handle `AgentUpdateEvent`
   - Look for components, hooks, or services that process these events
   - Identify any hardcoded event structure expectations

2. **Update event handling logic**:
   - Ensure event handlers can process the new conversationId field
   - Update any destructuring or property access that assumes old structure
   - Verify no code breaks with the additional field

3. **Update test files**:
   - Update mock AgentUpdateEvent objects to include conversationId
   - Fix any test assertions that validate event structure
   - Add test cases for conversationId field handling if relevant

### Specific Search Patterns

Use these patterns to find affected files in the renderer:

- Files importing or referencing `AgentUpdateEvent`
- Files calling `window.electronAPI.chat.onAgentUpdate`
- Test files mocking agent update events
- Components using chat-related event handling

### Example Handler Update

```typescript
// BEFORE
const handleAgentUpdate = (event: AgentUpdateEvent) => {
  const { conversationAgentId, status, messageId } = event;
  // Process without conversationId
};

// AFTER
const handleAgentUpdate = (event: AgentUpdateEvent) => {
  const { conversationId, conversationAgentId, status, messageId } = event;
  // Can now use conversationId for direct filtering
};
```

## Acceptance Criteria

- [ ] All renderer-side AgentUpdateEvent consumers identified and catalogued
- [ ] Event handlers updated to handle enhanced AgentUpdateEvent structure
- [ ] No breaking changes to existing event processing logic
- [ ] Test mocks updated to include conversationId field
- [ ] All renderer-side tests pass with enhanced event structure
- [ ] Event consumers can optionally use conversationId for filtering (if beneficial)

## Search Strategy

1. **Codebase search**: Use grep/ripgrep to find AgentUpdateEvent references in renderer code
2. **File pattern analysis**: Search for `onAgentUpdate` method calls
3. **Test file review**: Examine test files that create mock events
4. **Component scanning**: Check React components that might handle chat events

## Testing Requirements

- [ ] All existing event handling tests pass
- [ ] Mock events include required conversationId field
- [ ] Event consumer components handle enhanced structure correctly
- [ ] No TypeScript compilation errors from enhanced event type
- [ ] Event processing behavior unchanged (except for optional conversationId usage)

## Out of Scope

- Implementation of new conversationId-based filtering logic (that's handled in conversation store integration)
- Changes to main process event emission (handled in separate task)
- Architectural changes to event handling patterns

## Technical Notes

- Focus on maintaining backward compatibility while supporting enhanced structure
- Most event handlers should work unchanged since conversationId is an additional field
- Look for any code that validates event structure or uses Object.keys() type checks
- TypeScript should help identify most compatibility issues

## Dependencies

- Requires: T-update-preload-type (preload types must support enhanced events first)

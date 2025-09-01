---
id: T-update-event-emission-to
title: Update event emission to include conversationId in payload
status: open
priority: high
parent: F-enhanced-ipc-event-integration
prerequisites:
  - T-add-conversationid-field-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T05:43:19.505Z
updated: 2025-09-01T05:43:19.505Z
---

## Purpose

Update the `createEventEmitter` function in chat handlers to include `conversationId` in the AgentUpdateEvent payload when emitting agent update events to all renderer processes.

## Context

The `createEventEmitter` function at `apps/desktop/src/electron/chatHandlers.ts:32-58` currently constructs AgentUpdateEvent payloads without the conversationId field. The conversationId is already available in the function scope as a parameter, so it just needs to be included in the event payload.

## Implementation Requirements

### File to Update

- **Location**: `apps/desktop/src/electron/chatHandlers.ts`
- **Target function**: `createEventEmitter` (lines 32-58)
- **Current payload construction**: Lines 34-42

### Specific Changes

1. **Update AgentUpdateEvent construction** (lines 34-42):

   ```typescript
   const agentUpdateEvent: AgentUpdateEvent = {
     conversationId, // ADD THIS LINE - use conversationId parameter from function scope
     conversationAgentId: eventData.conversationAgentId,
     status: eventData.status,
     messageId: eventData.messageId,
     error: eventData.error,
     agentName: eventData.agentName,
     errorType: eventData.errorType,
     retryable: eventData.retryable,
   };
   ```

2. **Update debug logging** (lines 44-50):
   - The conversationId is already being logged correctly
   - No changes needed to logging logic

3. **Event emission**:
   - No changes needed to webContents.send() call (line 54)
   - Existing event emission pattern works correctly

## Acceptance Criteria

- [ ] AgentUpdateEvent payload includes `conversationId` field using the function parameter
- [ ] All existing fields remain in the payload unchanged
- [ ] Event emission to all renderer processes continues working
- [ ] Debug logging continues to show conversationId (already works)
- [ ] No breaking changes to event emission pattern

## Technical Notes

- The `conversationId` parameter is already available in the `createEventEmitter` function scope
- No additional data fetching or reverse lookups needed
- Existing event emission pattern (`webContents.getAllWebContents().forEach()`) continues unchanged

## Out of Scope

- Changes to event consumption (handled in separate tasks)
- Changes to preload type definitions (handled in separate task)
- Modifications to debug logging (already logs conversationId correctly)

## Testing Requirements

Include unit tests that verify:

- Enhanced AgentUpdateEvent includes conversationId field
- Event payload matches enhanced interface structure
- Event emission to renderer processes includes conversationId
- Existing event fields remain unchanged

## Dependencies

- Requires: T-add-conversationid-field-to (AgentUpdateEvent interface enhancement)

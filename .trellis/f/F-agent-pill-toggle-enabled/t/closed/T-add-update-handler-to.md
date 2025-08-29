---
id: T-add-update-handler-to
title: Add update handler to conversation agent IPC handlers
status: done
priority: medium
parent: F-agent-pill-toggle-enabled
prerequisites:
  - T-create-conversation-agent
affectedFiles:
  apps/desktop/src/electron/conversationAgentHandlers.ts:
    Added UPDATE handler to
    setupConversationAgentHandlers function, following existing patterns for
    error handling and logging, and exported the function
  apps/desktop/src/shared/ipc/index.ts: Added exports for
    ConversationAgentUpdateRequest and ConversationAgentUpdateResponse types to
    make them available for import in handlers
log:
  - Implemented UPDATE handler in conversation agent IPC handlers to support
    updating conversation agent properties, particularly the enabled state.
    Added the handler following existing code patterns with proper error
    handling, logging, and serialization. Updated IPC exports to include the new
    request/response types. All quality checks pass including linting,
    formatting, and type checking.
schema: v1.0
childrenIds: []
created: 2025-08-29T03:58:33.434Z
updated: 2025-08-29T03:58:33.434Z
---

# Add update handler to conversation agent IPC handlers

## Context

Add the UPDATE IPC handler to `setupConversationAgentHandlers` function to support updating conversation agent properties, specifically the enabled state.

## Technical Approach

1. Add new `ipcMain.handle` call for `CONVERSATION_AGENT_CHANNELS.UPDATE`
2. Follow existing error handling patterns from ADD/REMOVE handlers
3. Use existing repository's `update` method
4. Include proper logging and error serialization

## Specific Implementation Requirements

### Handler Implementation

- Accept `ConversationAgentUpdateRequest` parameter
- Return `ConversationAgentUpdateResponse`
- Call `mainServices.conversationAgentsRepository.update(id, input)`
- Include debug logging for input parameters and success
- Include error logging and serialization using existing patterns

### Error Handling

- Catch and serialize errors using `serializeError` helper
- Return proper success/failure response structure
- Log errors with appropriate context information

## Acceptance Criteria

- [ ] UPDATE handler added to `setupConversationAgentHandlers`
- [ ] Handler accepts correct request type and returns correct response type
- [ ] Uses existing repository update method correctly
- [ ] Includes proper error handling and logging
- [ ] Follows existing code patterns and conventions
- [ ] Unit tests verify handler functionality

## Files to Modify

- `apps/desktop/src/electron/conversationAgentHandlers.ts`

## Dependencies

- Prerequisite: Request/response types must exist
- Uses existing repository update method
- Follows patterns from existing handlers (ADD, REMOVE)

## Testing Requirements

- Unit tests to verify handler processes requests correctly
- Test error scenarios and proper error responses
- Test successful update scenarios
- Verify logging output

## Out of Scope

- Do not modify the repository update method
- Do not modify other handlers

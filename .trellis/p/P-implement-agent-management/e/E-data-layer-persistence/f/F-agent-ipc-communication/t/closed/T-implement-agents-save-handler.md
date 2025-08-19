---
id: T-implement-agents-save-handler
title: Implement agents save handler with validation
status: done
priority: high
parent: F-agent-ipc-communication
prerequisites:
  - T-implement-ipc-channel
affectedFiles:
  apps/desktop/src/electron/agentsHandlers.ts: Added save handler implementation
    with AgentsSaveRequest validation, repository integration, and error
    handling
  apps/desktop/src/electron/__tests__/agentsHandlers.test.ts:
    Added comprehensive
    test coverage for save handler including success, validation errors,
    repository failures, and edge cases
log:
  - Implemented agents save handler with validation following
    personalitiesHandlers pattern. Added save handler with proper error
    handling, logging, and comprehensive test coverage. All quality checks and
    tests pass successfully.
schema: v1.0
childrenIds: []
created: 2025-08-19T05:41:49.505Z
updated: 2025-08-19T05:41:49.505Z
---

## Context

Implement the save handler for agent IPC operations, enabling the renderer process to persist agent data through the main process repository. Includes proper request validation and error handling following personalitiesHandlers patterns.

## Implementation Requirements

### Save Handler Implementation

- Add save handler to `apps/desktop/src/electron/agentsHandlers.ts`
- Use `ipcMain.handle(AGENTS_CHANNELS.SAVE, ...)` pattern
- Accept `AgentsSaveRequest` with agent data validation
- Call `agentsRepositoryManager.get().saveAgents()` for persistence
- Return `AgentsSaveResponse` with success/error status

### Request Data Validation

- Validate request data structure before processing
- Ensure agent data matches expected schema
- Prevent invalid data from reaching repository layer
- Provide clear validation error messages
- Handle malformed request gracefully

### Error Handling & Rollback

- Comprehensive try/catch around save operations
- Use serializeError utility for cross-process communication
- Proper error logging with operation context
- No partial saves - maintain data integrity
- Clear error propagation to renderer process

### Logging Integration

- Debug logs for save handler invocations with data summaries
- Info logs for successful save operations
- Error logs with detailed error objects
- Consistent logging format with other handlers
- No sensitive data in log messages

## Technical Approach

1. **Handler structure**: Follow exact pattern from personalitiesHandlers save operation
2. **Input validation**: Validate AgentsSaveRequest structure and content
3. **Repository call**: Invoke saveAgents with validated data
4. **Error management**: Catch and serialize all repository errors
5. **Response consistency**: Return well-structured AgentsSaveResponse

## Acceptance Criteria

- ✅ Save handler registered with correct IPC channel
- ✅ Accepts AgentsSaveRequest with proper validation
- ✅ Calls agentsRepositoryManager.get().saveAgents()
- ✅ Returns AgentsSaveResponse with success/error structure
- ✅ Validates request data before saving
- ✅ Proper error handling and rollback support
- ✅ Comprehensive logging for all operation stages

## Testing Requirements

- ✅ Unit test: valid request data saves successfully
- ✅ Unit test: invalid request data returns validation error
- ✅ Unit test: repository failure returns serialized error
- ✅ Unit test: proper logging occurs for success and failure cases
- ✅ Unit test: response structure matches AgentsSaveResponse type
- ✅ Unit test: error rollback behavior maintains data integrity
- ✅ Mock agentsRepositoryManager for controlled testing scenarios

## Files to Create/Modify

- `apps/desktop/src/electron/agentsHandlers.ts` - Add save handler
- Test file for save handler validation
- Type imports as needed

## Dependencies

- T-implement-ipc-channel (for channel constants and types)
- AgentsRepository implementation from F-agent-repository-file-storage
- Existing serializeError utility
- Logger infrastructure
- Request validation utilities

## Security Considerations

- Validate all data received from renderer process
- Sanitize agent data before persistence
- Prevent path traversal in any file operations
- No execution of user-provided code or data
- Safe error serialization without sensitive data exposure

---
id: T-implement-agents-reset
title: Implement agents reset handler with confirmation
status: done
priority: medium
parent: F-agent-ipc-communication
prerequisites:
  - T-implement-ipc-channel
affectedFiles:
  apps/desktop/src/electron/agentsHandlers.ts: Added reset handler following
    personalitiesHandlers pattern, with AgentsResetResponse import, reset IPC
    handler registration, and comprehensive error handling with confirmation
    logging
  apps/desktop/src/electron/__tests__/agentsHandlers.test.ts: Added
    AgentsResetResponse import, updated mock repository with resetAgents method,
    updated setup test to verify reset handler registration, and added
    comprehensive reset handler test suite covering success, error, and
    repository initialization failure scenarios
log:
  - Implemented agents reset handler with confirmation logging and comprehensive
    error handling. Added reset handler to agentsHandlers.ts following exact
    pattern from personalitiesHandlers, including proper IPC channel
    registration, atomic operation handling, error serialization for
    cross-process communication, and comprehensive test coverage. Handler calls
    agentsRepositoryManager.get().resetAgents() and returns AgentsResetResponse
    with success/error status. All tests pass with 100% coverage of new
    functionality.
schema: v1.0
childrenIds: []
created: 2025-08-19T05:42:06.901Z
updated: 2025-08-19T05:42:06.901Z
---

## Context

Implement the reset handler for agent IPC operations, enabling the renderer process to restore agents to default state through the main process repository. Includes proper confirmation logging and error handling.

## Implementation Requirements

### Reset Handler Implementation

- Add reset handler to `apps/desktop/src/electron/agentsHandlers.ts`
- Use `ipcMain.handle(AGENTS_CHANNELS.RESET, ...)` pattern
- Call `agentsRepositoryManager.get().resetAgents()` for default restoration
- Return `AgentsResetResponse` with success/error status
- Follow exact pattern from personalitiesHandlers reset operation

### Confirmation & Logging

- Info-level confirmation logging for reset operations
- Clear log messages indicating reset completion
- Error logging for reset failures with context
- No sensitive data in log messages
- Operation tracking from start to completion

### Error Handling

- Comprehensive try/catch around reset operations
- Use serializeError utility for cross-process error communication
- Handle reset failures gracefully without partial state
- Clear error propagation to renderer process
- Proper error context preservation

### Safety Considerations

- Handle reset operation atomically
- Ensure clean fallback on reset failure
- No partial resets that leave system in invalid state
- Proper error recovery and reporting

## Technical Approach

1. **Handler pattern**: Copy exact structure from personalitiesHandlers reset
2. **Repository integration**: Call resetAgents method with proper error handling
3. **Atomic operation**: Ensure reset completes fully or fails cleanly
4. **Response structure**: Return consistent AgentsResetResponse format
5. **Logging strategy**: Comprehensive operation tracking with confirmations

## Acceptance Criteria

- ✅ Reset handler registered with correct IPC channel
- ✅ Calls agentsRepositoryManager.get().resetAgents()
- ✅ Returns AgentsResetResponse with proper structure
- ✅ Confirmation logging for reset operations
- ✅ Handles reset failures gracefully
- ✅ Error serialization for cross-process communication
- ✅ Atomic reset operation (success or failure, no partial state)

## Testing Requirements

- ✅ Unit test: successful reset operation returns success response
- ✅ Unit test: repository reset failure returns serialized error
- ✅ Unit test: proper confirmation logging occurs
- ✅ Unit test: response structure matches AgentsResetResponse type
- ✅ Unit test: error handling preserves operation context
- ✅ Unit test: atomic operation behavior (no partial resets)
- ✅ Mock agentsRepositoryManager for controlled testing

## Files to Create/Modify

- `apps/desktop/src/electron/agentsHandlers.ts` - Add reset handler
- Test file for reset handler validation
- Type imports as needed

## Dependencies

- T-implement-ipc-channel (for channel constants and types)
- AgentsRepository implementation from F-agent-repository-file-storage
- Existing serializeError utility
- Logger infrastructure

## Security Considerations

- Validate reset operation authorization
- No sensitive data exposure during reset
- Safe error serialization for cross-process communication
- Prevent unauthorized reset operations
- Clear audit trail for reset operations through logging

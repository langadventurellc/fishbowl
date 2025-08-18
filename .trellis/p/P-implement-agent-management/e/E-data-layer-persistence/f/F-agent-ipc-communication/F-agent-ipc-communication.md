---
id: F-agent-ipc-communication
title: Agent IPC Communication
status: open
priority: medium
parent: E-data-layer-persistence
prerequisites:
  - F-agent-store-implementation
  - F-agent-repository-file-storage
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-18T23:05:52.032Z
updated: 2025-08-18T23:05:52.032Z
---

## Purpose and Functionality

Implement IPC (Inter-Process Communication) handlers for agent operations between Electron's main and renderer processes, following the exact patterns from personalitiesHandlers. Enables secure communication for agent CRUD operations.

## Key Components to Implement

### IPC Handlers

- Agent load handler for retrieving saved agents
- Agent save handler for persisting agent data
- Agent reset handler for restoring defaults
- Error serialization for cross-process communication

### IPC Channels & Types

- Channel constants for type-safe communication
- Request/response type definitions
- Integration with existing IPC infrastructure
- Preload script registration

### Repository Integration

- Connect handlers to AgentsRepository
- Proper error handling and logging
- Repository manager integration
- Thread-safe operation handling

## Detailed Acceptance Criteria

### IPC Channel Constants

- ✅ `AGENTS_CHANNELS` object in `apps/desktop/src/shared/ipc/index.ts`
- ✅ Contains LOAD, SAVE, RESET channel identifiers
- ✅ Follows exact pattern from PERSONALITIES_CHANNELS
- ✅ Exported through existing IPC barrel file

### IPC Type Definitions

- ✅ `AgentsLoadResponse` type for load operation results
- ✅ `AgentsSaveRequest` type for save operation input
- ✅ `AgentsSaveResponse` type for save operation results
- ✅ `AgentsResetResponse` type for reset operation results
- ✅ All types follow exact pattern from personalities IPC types

### Handler Implementation

- ✅ `setupAgentsHandlers()` function in `apps/desktop/src/electron/agentsHandlers.ts`
- ✅ Load handler: `ipcMain.handle(AGENTS_CHANNELS.LOAD, ...)`
- ✅ Save handler: `ipcMain.handle(AGENTS_CHANNELS.SAVE, ...)`
- ✅ Reset handler: `ipcMain.handle(AGENTS_CHANNELS.RESET, ...)`
- ✅ Follows exact pattern from personalitiesHandlers.ts

### Load Handler

- ✅ Calls agentsRepositoryManager.get().loadAgents()
- ✅ Returns AgentsLoadResponse with success/error status
- ✅ Proper error serialization for renderer process
- ✅ Debug logging for operation tracking
- ✅ Handles repository errors gracefully

### Save Handler

- ✅ Accepts AgentsSaveRequest with agent data
- ✅ Calls agentsRepositoryManager.get().saveAgents()
- ✅ Returns AgentsSaveResponse with success/error status
- ✅ Validates request data before saving
- ✅ Proper error handling and rollback

### Reset Handler

- ✅ Calls agentsRepositoryManager.get().resetAgents()
- ✅ Returns AgentsResetResponse with success/error status
- ✅ Confirmation logging for reset operations
- ✅ Handles reset failures gracefully

### Error Serialization

- ✅ Uses existing serializeError utility
- ✅ Preserves error messages and context
- ✅ Safe for cross-process communication
- ✅ No sensitive data in error responses

### Preload Script Integration

- ✅ Agent IPC methods added to electronAPI object
- ✅ `electronAPI.agents.load()` method
- ✅ `electronAPI.agents.save()` method
- ✅ `electronAPI.agents.reset()` method
- ✅ Type definitions in electron.d.ts

### Main Process Integration

- ✅ setupAgentsHandlers() called in main.ts
- ✅ Handlers registered before app ready event
- ✅ Proper cleanup on app quit
- ✅ Integration with existing handler setup pattern

### Logging Integration

- ✅ Uses createLoggerSync with "agentsHandlers" context
- ✅ Debug logs for handler invocations
- ✅ Error logs with proper error objects
- ✅ Info logs for successful operations
- ✅ Consistent log format with other handlers

## Implementation Guidance

### Technical Approach

- Copy personalitiesHandlers.ts structure exactly
- Replace "personalities" with "agents" throughout
- Maintain identical error handling patterns
- Use same logging patterns and message formats

### Handler Patterns

- Use async/await for all repository operations
- Wrap operations in try/catch blocks
- Return consistent response objects
- Log operation start and completion

### Error Handling

- Catch all repository errors
- Use serializeError for cross-process safety
- Preserve error context for debugging
- Return user-friendly error messages

## Testing Requirements

### Handler Tests

- ✅ Test load handler with successful repository operation
- ✅ Test load handler with repository failure
- ✅ Test save handler with valid request data
- ✅ Test save handler with invalid request data
- ✅ Test save handler with repository failure
- ✅ Test reset handler success and failure cases

### IPC Integration Tests

- ✅ Test end-to-end communication from renderer to main
- ✅ Test error serialization across process boundary
- ✅ Test concurrent IPC request handling
- ✅ Test IPC timeout scenarios

### Repository Integration Tests

- ✅ Test handlers use repository manager correctly
- ✅ Test proper repository method invocations
- ✅ Test error propagation from repository to IPC
- ✅ Test data transformation in request/response cycle

### Type Safety Tests

- ✅ Test IPC type definitions compile correctly
- ✅ Test request/response type compatibility
- ✅ Test preload script type integration
- ✅ Test electron.d.ts type definitions

## Security Considerations

### Process Isolation

- Validate all data received from renderer process
- Use type-safe IPC channel registration
- Prevent code injection through IPC messages
- Limit IPC access to authorized operations only

### Data Validation

- Validate request data against schemas
- Sanitize agent data before persistence
- Prevent path traversal in file operations
- No execution of user-provided code

### Error Information

- Serialize errors safely for cross-process communication
- No sensitive file paths in error messages
- Limited error details to prevent information disclosure

## Performance Requirements

### IPC Performance

- Handler operations complete in < 500ms
- Efficient data serialization across process boundary
- Minimal memory usage for IPC messages
- No blocking of main process event loop

### Concurrent Operations

- Handle multiple concurrent IPC requests
- Repository operations are thread-safe
- No race conditions in handler execution
- Proper async operation management

## Dependencies

- F-agent-store-implementation (for store integration in renderer)
- F-agent-repository-file-storage (for repository operations)
- Existing IPC infrastructure and utilities

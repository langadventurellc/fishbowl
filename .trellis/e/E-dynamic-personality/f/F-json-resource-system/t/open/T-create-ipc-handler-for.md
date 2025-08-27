---
id: T-create-ipc-handler-for
title: Create IPC handler for personality definitions
status: open
priority: medium
parent: F-json-resource-system
prerequisites:
  - T-implement-first-run-copy
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T15:42:03.057Z
updated: 2025-08-27T15:42:03.057Z
---

# Create IPC handler for personality definitions

## Context

Create the IPC communication layer that exposes personality definitions from the main process to the renderer process. This follows the existing IPC patterns in the application and provides a single endpoint for fetching parsed definitions.

## Implementation Requirements

### IPC Handler Implementation

- Add `ipcMain.handle('personality:get-definitions')` handler
- Return parsed definitions or structured error from the desktop service
- Implement handler in a dedicated module `apps/desktop/src/electron/handlers/personalityDefinitionsHandlers.ts`
- Handle both success and error cases with proper response types

### Response Types

- Create request/response types following existing IPC patterns
- Define success response with personality definitions
- Define error response with structured error information
- Export types for use by renderer proxy

### Handler Registration

- Register IPC handler in main process startup (in `main.ts`)
- Keep this separate from persistence handlers (do not modify `personalitiesHandlers.ts`)
- Ensure proper error serialization across IPC boundary

### Files to Create/Modify

- `apps/desktop/src/shared/ipc/personalityDefinitions/getDefinitionsRequest.ts`
- `apps/desktop/src/shared/ipc/personalityDefinitions/getDefinitionsResponse.ts`
- `apps/desktop/src/electron/handlers/personalityDefinitionsHandlers.ts` - Implement + export registration function
- Unit tests for IPC handler

### Technical Approach

1. Follow existing IPC patterns in the personalities directory
2. Use the desktop personality definitions service
3. Handle async operations properly in IPC context
4. Serialize errors safely across process boundary
5. Register handler during main process initialization

## Acceptance Criteria

- [ ] IPC handler returns parsed definitions or structured error
- [ ] Handler follows existing IPC patterns and conventions
- [ ] Request/response types properly defined and exported
- [ ] Error serialization works correctly across IPC boundary
- [ ] Handler registered during main process startup
- [ ] Malformed JSON results in structured error; UI can disable dynamic form
- [ ] No application crashes due to IPC communication failures

## Testing Requirements

### Unit Tests

- IPC handler registration and invocation
- Success response with valid definitions
- Error response handling for various failure modes
- Error serialization across IPC boundary
- Integration with desktop service

## Security Considerations

- Sanitize error messages to avoid exposing sensitive file system paths
- Validate IPC requests to prevent abuse
- Ensure error responses don't leak internal implementation details

## Dependencies

- Requires first-run copy mechanism from T-implement-first-run-copy
- Existing IPC infrastructure and patterns
- Error serialization utilities

## Out of Scope

- Renderer proxy implementation (separate task)
- UI integration (separate task)
- Caching in renderer process (separate task)

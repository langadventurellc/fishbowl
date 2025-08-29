---
id: F-messages-ipc-bridge
title: Messages IPC Bridge
status: in-progress
priority: medium
parent: E-message-system-foundation
prerequisites: []
affectedFiles:
  apps/desktop/src/shared/ipc/messagesConstants.ts:
    Created IPC channel constants
    for messages operations with MESSAGES_CHANNELS object and
    MessagesChannelType union type
  apps/desktop/src/shared/ipc/messages/listRequest.ts:
    Created MessagesListRequest
    interface for retrieving messages by conversationId
  apps/desktop/src/shared/ipc/messages/listResponse.ts: Created MessagesListResponse interface extending IPCResponse<Message[]>
  apps/desktop/src/shared/ipc/messages/createRequest.ts: Created MessagesCreateRequest interface accepting CreateMessageInput
  apps/desktop/src/shared/ipc/messages/createResponse.ts: Created MessagesCreateResponse interface extending IPCResponse<Message>
  apps/desktop/src/shared/ipc/messages/updateInclusionRequest.ts:
    Created MessagesUpdateInclusionRequest interface for updating message
    inclusion flags
  apps/desktop/src/shared/ipc/messages/updateInclusionResponse.ts:
    Created MessagesUpdateInclusionResponse interface extending
    IPCResponse<Message>
  apps/desktop/src/shared/ipc/messages/index.ts: Created barrel file exporting all messages request/response types
  apps/desktop/src/shared/ipc/index.ts: Added messages constants, request types,
    and response types exports to main IPC index
log: []
schema: v1.0
childrenIds:
  - T-create-messages-ipc-channel
  - T-extend-preload-interface-with
  - T-implement-messages-ipc
created: 2025-08-29T16:57:35.088Z
updated: 2025-08-29T16:57:35.088Z
---

# Messages IPC Bridge

## Purpose and Functionality

Implement the Inter-Process Communication (IPC) bridge that enables secure communication between the Electron renderer process (UI) and main process (database access) for message operations. This provides the critical security boundary ensuring renderer cannot directly access the database.

## Key Components to Implement

### Main Process Handlers (Electron)

- Location: `apps/desktop/src/electron/messagesHandlers.ts` (match `conversationsHandlers.ts` pattern)
- Handlers:
  - `messages.list`: Retrieve all messages for a conversation
  - `messages.create`: Create new user or system messages
  - `messages.updateInclusion`: Update message inclusion flags for context control
- Full TypeScript contracts between renderer and main
- Direct integration with existing MessageRepository

### Preload Exposure (centralized)

- Location: `apps/desktop/src/electron/preload.ts`
- Safe renderer access via `window.electronAPI.messages`
- Type-safe interface exposure following existing patterns
- Security validation and error handling
- Integration with centralized preload architecture

### IPC Type Definitions

- Add `apps/desktop/src/shared/ipc/messagesConstants.ts` with `MESSAGES_CHANNELS`
- Add request/response types under `apps/desktop/src/shared/ipc/messages/`
- Re-export from `apps/desktop/src/shared/ipc/index.ts`
- Follow conversations/conversationAgents typing patterns

## Detailed Acceptance Criteria

### Main Process Handler Requirements

**GIVEN** IPC requests from renderer process
**WHEN** message operations are invoked
**THEN** the system should:

#### messages.list Handler

- Accept `conversationId: string` parameter
- Return `Promise<Message[]>` with all messages for conversation
- Sort messages by `created_at ASC, id ASC` using SQL ORDER BY for stability
- Handle invalid conversationId with clear error message
- Use existing `MessageRepository.getByConversation(conversationId)`
- Include proper error logging with conversation context
- Return empty array for conversations with no messages

#### messages.create Handler

- Accept `CreateMessageInput` with `conversation_id`, `role`, `content`, optional `conversation_agent_id`
- Validate all required fields before database operation
- Return `Promise<Message>` with created message including generated ID
- Use existing `MessageRepository.create()` method
- Handle validation errors (empty content, invalid conversation_id)
- Include proper error logging with input context
- Defaults applied by repository: `included=true` (when not provided), `created_at=now()`

#### messages.updateInclusion Handler

- Accept `id: string, included: boolean` parameters
- Return `Promise<Message>` with updated message
- Use existing MessageRepository.updateInclusion() method
- Handle invalid message ID with clear error message
- Include proper error logging with message context
- Validate message exists before attempting update

### Preload Interface Requirements

**GIVEN** renderer process needs to access message operations
**WHEN** using `window.electronAPI.messages` interface
**THEN** it should:

- Expose typed `{ list, create, updateInclusion }` interface in centralized `preload.ts`
- Follow exact patterns from existing `electronAPI.conversations` and `electronAPI.conversationAgent`
- Extend `apps/desktop/src/types/electron.d.ts` with messages API surface
- Handle IPC errors and convert to user-friendly messages
- Perform minimal guard checks (presence/primitive types) before invoking IPC; rely on repository for schema validation
- Provide consistent error format across all operations

### Security Boundary Requirements

**GIVEN** the need for secure database access
**WHEN** handling message operations
**THEN** the system should:

- Enforce complete isolation - no direct database access from renderer
- Validate all inputs to prevent injection attacks
- Sanitize error messages to avoid exposing internal details
- Use proper IPC channels following existing security patterns
- Handle malformed requests gracefully without crashes
- Log security violations for monitoring

### Type Safety Requirements

**GIVEN** cross-process communication
**WHEN** defining interfaces and types
**THEN** it should:

- Provide complete TypeScript coverage across IPC boundary
- Define clear input/output interfaces for all operations
- Handle optional parameters and default values consistently
- Include proper error type definitions
- Validate runtime types match compile-time expectations
- Export types for use in renderer hooks

## Implementation Guidance

### File Structure

```
apps/desktop/src/electron/
├── messagesHandlers.ts             # Register messages:list/create/updateInclusion handlers
├── conversationsHandlers.ts        # Reference for pattern consistency (existing)
├── preload.ts                      # Extend to expose electronAPI.messages
└── handlers/                       # Other existing handler modules

apps/desktop/src/shared/ipc/
├── messagesConstants.ts            # Channel constants (MESSAGES_CHANNELS)
└── messages/                       # Messages request/response types (list/create/updateInclusion)

apps/desktop/src/types/
└── electron.d.ts                   # Extend ElectronAPI with messages API
```

### Pattern Consistency

- Follow exact patterns from existing conversations/conversationAgent IPC implementations
- Use same error handling and logging approach as existing handlers
- Integrate with centralized preload architecture and contextBridge
- Follow established TypeScript interface naming conventions
- Use existing `MessageRepository` methods without modifications

### Error Handling Strategy

- Convert database errors to user-friendly messages
- Log detailed errors server-side for debugging
- Return consistent envelope: `{ success: boolean, data?, error? }`
- Provide specific error messages for validation failures
- Map domain errors to standardized error codes (e.g., `VALIDATION_ERROR`, `NOT_FOUND`) via existing `serializeError`

### Integration Points

- Use `MessageRepository` from `@fishbowl-ai/shared`
- Wire `messagesRepository` in `apps/desktop/src/main/services/MainProcessServices.ts` (or construct within handler module for MVP, then promote)
- Register `setupMessagesIpcHandlers(services)` from `apps/desktop/src/electron/main.ts` alongside existing handler setup functions
- Extend `apps/desktop/src/electron/preload.ts` to expose `electronAPI.messages`
- Extend `apps/desktop/src/types/electron.d.ts` to add `messages` API surface
- Follow established IPC security patterns

## Testing Requirements

### Main Process Handler Tests

- Unit tests for all three handlers using mock MessageRepository
- Integration tests with real MessageRepository and test database
- Error scenario testing: invalid inputs, database failures, network issues
- Performance testing: large message lists, concurrent requests
- Security testing: malformed inputs, injection attempts

### Preload Interface Tests

- Mock IPC communication and verify proper parameter passing
- Test error handling and user-friendly error messages
- Verify TypeScript interfaces match runtime behavior
- Test integration with existing preload architecture

### End-to-End IPC Tests

- Full renderer → preload → main → database → response flow
- Test all message operations with real data
- Verify proper error propagation across process boundary
- Performance testing under load

## Security Considerations

### Database Access Control

- Absolute isolation: renderer process cannot access database directly
- All database operations must go through main process handlers
- Validate conversation ownership and permissions
- Sanitize all inputs to prevent SQL injection
- Log all database operations for audit trail

### Input Validation

- Perform minimal guards in preload (presence/primitive type checks)
- Perform schema validation and business rules in repository layer using shared Zod schemas
- Sanitize user content before database storage
- Check conversation_id references exist and are accessible (repository)
- Validate message roles against allowed values (repository)

### Error Information Disclosure

- Never expose database connection details in errors
- Sanitize file paths and internal system information
- Provide helpful but not revealing error messages
- Log sensitive details server-side only
- Handle edge cases without exposing internals

## Performance Requirements

- **Response Time**: All message operations complete within 100ms locally
- **Throughput**: Support concurrent requests from multiple conversations
- **Memory Usage**: Efficient handling of large message lists (100+ messages)
- **Database Queries**: Use optimized SQL with proper indexing
- **IPC Overhead**: Minimize data transfer across process boundary

## Dependencies

- Requires existing MessageRepository in shared package
- Depends on established Electron main/preload/renderer architecture
- Uses existing IPC patterns and security implementation
- Integrates with logging infrastructure from shared package

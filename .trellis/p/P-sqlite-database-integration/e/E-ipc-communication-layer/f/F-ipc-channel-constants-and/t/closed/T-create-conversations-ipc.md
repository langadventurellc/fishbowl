---
id: T-create-conversations-ipc
title: Create conversations IPC constants file
status: done
priority: high
parent: F-ipc-channel-constants-and
prerequisites: []
affectedFiles:
  apps/desktop/src/shared/ipc/conversationsConstants.ts: Main constants file with CONVERSATION_CHANNELS and ConversationsChannelType
  apps/desktop/src/shared/ipc/conversations/createRequest.ts: Request type for conversation creation with optional title
  apps/desktop/src/shared/ipc/conversations/listRequest.ts: Request type for listing conversations (empty object)
  apps/desktop/src/shared/ipc/conversations/getRequest.ts: Request type for retrieving specific conversation by ID
  apps/desktop/src/shared/ipc/conversations/updateRequest.ts: Request type for updating conversation with UpdateConversationInput
  apps/desktop/src/shared/ipc/conversations/deleteRequest.ts: Request type for deleting conversation by ID
  apps/desktop/src/shared/ipc/conversations/createResponse.ts: Response type for conversation creation extending IPCResponse<Conversation>
  apps/desktop/src/shared/ipc/conversations/listResponse.ts: Response type for conversation listing extending IPCResponse<Conversation[]>
  apps/desktop/src/shared/ipc/conversations/getResponse.ts: Response type for
    conversation retrieval extending IPCResponse<Conversation | null>
  apps/desktop/src/shared/ipc/conversations/updateResponse.ts: Response type for conversation updates extending IPCResponse<Conversation>
  apps/desktop/src/shared/ipc/conversations/deleteResponse.ts: Response type for conversation deletion extending IPCResponse<boolean>
  apps/desktop/src/shared/ipc/__tests__/conversationsIPC.test.ts:
    Comprehensive unit tests covering constants, types, exports, and error
    handling
  apps/desktop/src/shared/ipc/index.ts: Added exports for all conversation constants and types to barrel file
log:
  - Successfully created the complete conversations IPC constants and types
    infrastructure following established patterns. Implemented all 5 channels
    (CREATE, LIST, GET, UPDATE, DELETE) with proper request/response types using
    discriminated unions. All files follow the one-export-per-file rule and
    maintain consistency with existing IPC patterns. Comprehensive test coverage
    ensures type safety and validates channel constants. All quality checks pass
    with no errors.
schema: v1.0
childrenIds: []
created: 2025-08-24T00:02:57.709Z
updated: 2025-08-24T00:02:57.709Z
---

# Create conversations IPC constants file

## Context

Create the foundational IPC channel constants file for conversation operations, following the established pattern from existing handlers like agents and llmModels. This file defines the contract between main and renderer processes.

**Reference Implementation**: Follow the exact pattern from `apps/desktop/src/shared/ipc/agentsConstants.ts`

## Implementation Requirements

### 1. Create File Structure

- Create `apps/desktop/src/shared/ipc/conversationsConstants.ts`
- Follow naming and export patterns from existing IPC constants

### 2. Channel Constants

- Define `CONVERSATION_CHANNELS` object with properties:
  - `CREATE`: "conversations:create"
  - `LIST`: "conversations:list"
  - `GET`: "conversations:get"
  - `UPDATE`: "conversations:update"
  - `DELETE`: "conversations:delete"
- Export as `const` assertion for type inference

### 3. Channel Type

- Export `ConversationsChannelType` as union type of channel values
- Use `typeof CONVERSATION_CHANNELS[keyof typeof CONVERSATION_CHANNELS]` pattern

### 4. Request/Response Types

- `ConversationsCreateRequest`: `{ title?: string }`
- `ConversationsListRequest`: `{}` (empty object)
- `ConversationsGetRequest`: `{ id: string }`
- `ConversationsUpdateRequest`: `{ id: string; updates: UpdateConversationInput }`
- `ConversationsDeleteRequest`: `{ id: string }`

### 5. Response Types (Discriminated Unions)

- `ConversationsCreateResponse`: Success with Conversation | Error
- `ConversationsListResponse`: Success with Conversation[] | Error
- `ConversationsGetResponse`: Success with Conversation | null | Error
- `ConversationsUpdateResponse`: Success with Conversation | Error
- `ConversationsDeleteResponse`: Success with boolean | Error

## Detailed Acceptance Criteria

- [ ] File created at correct path following existing pattern
- [ ] All 5 channels defined with correct naming convention
- [ ] ConversationsChannelType exported and properly typed
- [ ] All request types match repository method signatures
- [ ] All response types use discriminated unions (success: true/false)
- [ ] Success responses include strongly typed data property
- [ ] Error responses include SerializedError type
- [ ] JSDoc comments for all exports
- [ ] Const assertion on CONVERSATION_CHANNELS object

## Dependencies

- Import `Conversation`, `UpdateConversationInput` from `@fishbowl-ai/shared`
- Import `SerializedError` type from existing error utilities
- Reference patterns from `agentsConstants.ts`

## Testing Requirements

- Unit tests verifying:
  - Channel constant values are correct
  - No duplicate channel names
  - Type exports are accessible
  - Request/response types compile correctly
  - ConversationsChannelType includes all channels

## Technical Notes

Use exact same file structure and patterns as existing IPC constants to maintain consistency:

- Header comments explaining purpose
- Const assertions for type safety
- Proper TypeScript module exports
- JSDoc documentation

## Security Considerations

- Request types must be serializable (no functions, classes)
- No sensitive data in type definitions
- Error responses sanitized through SerializedError type

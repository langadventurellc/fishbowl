---
id: T-create-conversations-ipc
title: Create conversations IPC constants file
status: open
priority: high
parent: F-ipc-channel-constants-and
prerequisites: []
affectedFiles: {}
log: []
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

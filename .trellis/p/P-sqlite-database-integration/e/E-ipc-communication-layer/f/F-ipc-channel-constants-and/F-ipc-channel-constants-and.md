---
id: F-ipc-channel-constants-and
title: IPC Channel Constants and Types
status: done
priority: medium
parent: E-ipc-communication-layer
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
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-add-conversations-types-to
  - T-create-conversations-ipc
created: 2025-08-23T21:24:06.320Z
updated: 2025-08-23T21:24:06.320Z
---

# IPC Channel Constants and Types

## Purpose and Functionality

Create the foundational IPC channel definitions and TypeScript types for conversation operations. This establishes the contract between the main and renderer processes for all conversation-related communication.

## Key Components to Implement

### 1. Channel Constants File (`conversationsConstants.ts`)

- Define CONVERSATION_CHANNELS object with all channel names
- Follow naming pattern: "conversations:operation" (e.g., "conversations:create")
- Export channel type union for type safety

### 2. Request/Response Types

- ConversationsCreateRequest/Response
- ConversationsListRequest/Response
- ConversationsGetRequest/Response
- ConversationsUpdateRequest/Response
- ConversationsDeleteRequest/Response

### 3. Error Response Format

- Standardized error structure for IPC transport
- Serializable error details
- User-friendly error messages

## Detailed Acceptance Criteria

### Channel Definitions

- [ ] Create `apps/desktop/src/shared/ipc/conversationsConstants.ts`
- [ ] Define CONVERSATION_CHANNELS with CREATE, LIST, GET, UPDATE, DELETE channels
- [ ] Export ConversationsChannelType union type
- [ ] Follow exact naming convention from existing patterns (agents, llmModels, etc.)

### Type Definitions

- [ ] Request types match ConversationsRepository method signatures
- [ ] Response types use discriminated unions (success: true/false)
- [ ] Success responses include typed data property
- [ ] Error responses include serialized error details
- [ ] All types exported through barrel file

### Integration

- [ ] Types importable from shared/ipc index
- [ ] Compatible with existing serializeError utility
- [ ] Types align with Conversation interface from shared package

## Technical Requirements

### Type Structure Pattern

```typescript
// Request - minimal, matches repository input
export interface ConversationsCreateRequest {
  title?: string;
}

// Response - discriminated union
export type ConversationsCreateResponse =
  | { success: true; data: Conversation }
  | { success: false; error: SerializedError };
```

### Channel Naming Convention

- Use colon separator: "conversations:operation"
- Lowercase operation names
- Match repository method names where applicable

## Dependencies

- Conversation types from @fishbowl-ai/shared
- SerializedError type from existing error utilities

## Testing Requirements

- [ ] Unit tests for type exports and constants
- [ ] Verify channel constant values are unique
- [ ] Test type compatibility with repository interfaces
- [ ] Ensure types compile without errors

## Implementation Guidance

Follow the exact pattern from `agentsConstants.ts` and other existing IPC constant files. This ensures consistency across the codebase and makes the code immediately familiar to other developers.

## Security Considerations

- Request types should never include sensitive data
- Response types must sanitize any error messages that might expose system information
- All types must be serializable for IPC transport (no functions, classes, etc.)

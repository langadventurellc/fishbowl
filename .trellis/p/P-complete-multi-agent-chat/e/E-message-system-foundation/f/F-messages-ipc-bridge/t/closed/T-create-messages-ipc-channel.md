---
id: T-create-messages-ipc-channel
title: Create messages IPC channel constants and type definitions
status: done
priority: high
parent: F-messages-ipc-bridge
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
log:
  - Successfully implemented messages IPC channel constants and type definitions
    following existing patterns from conversations module. Created
    MESSAGES_CHANNELS with LIST, CREATE, and UPDATE_INCLUSION operations.
    Implemented complete request/response type structure with proper TypeScript
    interfaces extending IPCResponse. All types are properly integrated into
    main IPC index for seamless import. Followed "one export per file" rule and
    maintained consistency with established patterns. All quality checks pass
    with clean lint, format, and TypeScript compilation.
schema: v1.0
childrenIds: []
created: 2025-08-29T17:42:46.592Z
updated: 2025-08-29T17:42:46.592Z
---

# Create Messages IPC Channel Constants and Type Definitions

## Context and Background

This task establishes the foundational IPC type definitions and channel constants for the Messages IPC Bridge feature. The implementation follows existing patterns from conversations and other IPC modules in the codebase.

### Related Issues

- **Parent Feature**: F-messages-ipc-bridge (Messages IPC Bridge)
- **Epic**: E-message-system-foundation (Message System Foundation)
- **Project**: P-complete-multi-agent-chat (Complete Multi-Agent Chat)

### Reference Patterns

Follow exact patterns established in:

- `apps/desktop/src/shared/ipc/conversationsConstants.ts` - Channel constant structure
- `apps/desktop/src/shared/ipc/conversations/` - Request/response type patterns
- `apps/desktop/src/shared/ipc/index.ts` - Export patterns

## Detailed Implementation Requirements

### 1. Create Messages Channel Constants

**File**: `apps/desktop/src/shared/ipc/messagesConstants.ts`

```typescript
export const MESSAGES_CHANNELS = {
  LIST: "messages:list",
  CREATE: "messages:create",
  UPDATE_INCLUSION: "messages:updateInclusion",
} as const;

export type MessagesChannelType =
  (typeof MESSAGES_CHANNELS)[keyof typeof MESSAGES_CHANNELS];
```

### 2. Create Messages Request/Response Types Directory

**Directory**: `apps/desktop/src/shared/ipc/messages/`

Create the following type definition files:

#### List Messages Types (`list.ts`)

```typescript
import { Message } from "@fishbowl-ai/shared";
import { BaseResponse } from "../base";

export interface MessagesListRequest {
  conversationId: string;
}

export interface MessagesListResponse extends BaseResponse {
  data?: Message[];
}
```

#### Create Message Types (`create.ts`)

```typescript
import { CreateMessageInput, Message } from "@fishbowl-ai/shared";
import { BaseResponse } from "../base";

export interface MessagesCreateRequest {
  input: CreateMessageInput;
}

export interface MessagesCreateResponse extends BaseResponse {
  data?: Message;
}
```

#### Update Message Inclusion Types (`updateInclusion.ts`)

```typescript
import { Message } from "@fishbowl-ai/shared";
import { BaseResponse } from "../base";

export interface MessagesUpdateInclusionRequest {
  id: string;
  included: boolean;
}

export interface MessagesUpdateInclusionResponse extends BaseResponse {
  data?: Message;
}
```

#### Index File (`index.ts`)

```typescript
export * from "./list";
export * from "./create";
export * from "./updateInclusion";
```

### 3. Update Main IPC Index Export

**File**: `apps/desktop/src/shared/ipc/index.ts`

Add messages exports following existing patterns:

```typescript
// Messages
export * from "./messages";
export * from "./messagesConstants";
```

## Technical Requirements

### Type Safety

- All interfaces must extend `BaseResponse` from existing IPC patterns
- Use exact types from `@fishbowl-ai/shared` package (Message, CreateMessageInput)
- Follow established naming conventions: `Messages[Operation]Request/Response`
- Include proper TypeScript exports and re-exports

### Pattern Consistency

- Channel names follow `"messages:[operation]"` format
- Request interfaces contain input parameters
- Response interfaces extend BaseResponse with optional data field
- Directory structure mirrors existing IPC modules (conversations/, etc.)

### Integration Points

- Must integrate with existing `BaseResponse` interface
- Import shared types from `@fishbowl-ai/shared` package
- Follow export patterns from other IPC modules

## Acceptance Criteria

### Channel Constants

- [x] `MESSAGES_CHANNELS` constant object with LIST, CREATE, UPDATE_INCLUSION
- [x] `MessagesChannelType` union type exported
- [x] Follows exact pattern from conversationsConstants.ts

### Request/Response Types

- [x] `MessagesListRequest` with conversationId parameter
- [x] `MessagesCreateRequest` with CreateMessageInput
- [x] `MessagesUpdateInclusionRequest` with id and included parameters
- [x] All response types extend BaseResponse with proper data field
- [x] Proper directory structure and index exports

### Integration

- [x] All types exported from main ipc/index.ts
- [x] Clean imports using shared package types
- [x] TypeScript compilation without errors
- [x] Follows established IPC typing patterns exactly

## Testing Requirements

### Type Validation

- Write unit tests in `__tests__/messagesConstants.test.ts`
- Test channel constant values match expected strings
- Verify TypeScript compilation of all interfaces
- Test import/export chains work correctly

### Integration Testing

- Verify types can be imported from main IPC index
- Test compatibility with existing BaseResponse interface
- Validate shared package type imports work correctly

## Dependencies

- Requires existing `BaseResponse` interface from IPC base types
- Depends on `Message` and `CreateMessageInput` types from `@fishbowl-ai/shared`
- Must be completed before main process handlers can be implemented

## Out of Scope

- No IPC handler implementations (separate task)
- No preload interface exposure (separate task)
- No testing of actual message operations (only type definitions)
- No database operations or business logic

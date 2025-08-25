---
id: T-create-ipc-requestresponse
title: Create IPC request/response types for conversation agents
status: open
priority: high
parent: F-ipc-integration-for
prerequisites:
  - T-integrate-conversationagentsre
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T06:05:26.714Z
updated: 2025-08-25T06:05:26.714Z
---

# Create IPC Request/Response Types for Conversation Agents

## Context

Create TypeScript interfaces and channel constants for IPC communication between renderer and main processes for conversation agent operations. This follows the established patterns from conversations, settings, and other IPC implementations.

## Implementation Requirements

### Files to Create/Update

#### 1. Channel Constants (`apps/desktop/src/shared/ipc/channels.ts`)

Add conversation agent channels following the existing pattern:

```typescript
export const CONVERSATION_AGENT_CHANNELS = {
  GET_BY_CONVERSATION: "conversationAgent:getByConversation",
  ADD: "conversationAgent:add",
  REMOVE: "conversationAgent:remove",
  LIST: "conversationAgent:list", // For debugging
} as const;
```

#### 2. Request Types (`apps/desktop/src/shared/ipc/requests/conversationAgentRequests.ts`)

Create request interfaces following existing patterns:

```typescript
import {
  AddAgentToConversationInput,
  RemoveAgentFromConversationInput,
} from "@fishbowl-ai/shared";

export interface ConversationAgentGetByConversationRequest {
  conversationId: string;
}

export interface ConversationAgentAddRequest
  extends AddAgentToConversationInput {}

export interface ConversationAgentRemoveRequest
  extends RemoveAgentFromConversationInput {}

export interface ConversationAgentListRequest {
  // For debugging - no specific params needed
}
```

#### 3. Response Types (`apps/desktop/src/shared/ipc/responses/conversationAgentResponses.ts`)

Create response interfaces using existing IPC response pattern:

```typescript
import { ConversationAgent } from "@fishbowl-ai/shared";
import { BaseIPCResponse } from "../BaseIPCResponse";

export interface ConversationAgentGetByConversationResponse
  extends BaseIPCResponse {
  data?: ConversationAgent[];
}

export interface ConversationAgentAddResponse extends BaseIPCResponse {
  data?: ConversationAgent;
}

export interface ConversationAgentRemoveResponse extends BaseIPCResponse {
  data?: boolean;
}

export interface ConversationAgentListResponse extends BaseIPCResponse {
  data?: ConversationAgent[];
}
```

#### 4. Update Index Files

- Add exports to `apps/desktop/src/shared/ipc/requests/index.ts`
- Add exports to `apps/desktop/src/shared/ipc/responses/index.ts`
- Update main channels export in `apps/desktop/src/shared/ipc/channels.ts`

## Technical Requirements

### Type Safety

- All request/response types properly typed with TypeScript
- Extend existing base interfaces where applicable
- Import types from shared package (`@fishbowl-ai/shared`)

### Channel Naming

- Follow established convention: `conversationAgent:action`
- Use consistent naming with existing channels
- Avoid conflicts with other IPC channels

### Response Format

- Use established `{ success: boolean, data?: T, error?: SerializedError }` pattern
- Extend `BaseIPCResponse` interface
- Handle both success and error scenarios

## Acceptance Criteria

- ✅ Channel constants created with consistent naming convention
- ✅ Request types created for all required operations
- ✅ Response types created following BaseIPCResponse pattern
- ✅ Index files updated with proper exports
- ✅ TypeScript compilation succeeds without errors
- ✅ Types properly import from shared package
- ✅ No naming conflicts with existing IPC channels

## Testing Requirements

### Unit Tests

Create test file `apps/desktop/src/shared/ipc/__tests__/conversationAgentTypes.test.ts`:

- Verify type exports are available
- Test channel constant values
- Validate request/response type structure
- Ensure proper inheritance from base types

### Type Validation

- Import/export statements work correctly
- TypeScript compiler accepts all type definitions
- IntelliSense provides proper autocomplete

## Implementation Notes

### Reference Files

- **Channels**: Follow pattern in `apps/desktop/src/shared/ipc/channels.ts` for CONVERSATION_CHANNELS
- **Requests**: Follow pattern in `apps/desktop/src/shared/ipc/requests/conversationsRequests.ts`
- **Responses**: Follow pattern in `apps/desktop/src/shared/ipc/responses/conversationsResponses.ts`

### Dependencies

- `@fishbowl-ai/shared` types (ConversationAgent, input types)
- Existing IPC infrastructure and BaseIPCResponse
- Established channel naming patterns

### File Structure

```
apps/desktop/src/shared/ipc/
├── channels.ts (update)
├── requests/
│   ├── conversationAgentRequests.ts (create)
│   └── index.ts (update)
└── responses/
    ├── conversationAgentResponses.ts (create)
    └── index.ts (update)
```

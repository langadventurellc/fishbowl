---
id: T-define-ipc-constants-and
title: Define IPC constants and types for conversationAgent channels
status: open
priority: medium
parent: F-service-layer-and-ipc
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T05:17:37.595Z
updated: 2025-08-25T05:17:37.595Z
---

# Define IPC constants and types for conversationAgent channels

## Context

Define the IPC channel constants and TypeScript types for conversationAgent operations following the established IPC patterns used by conversations, settings, and other subsystems.

## Reference Implementation Patterns

- **Channel Constants**: Follow `CONVERSATION_CHANNELS` pattern in `conversationsConstants.ts`
- **Type Definitions**: Follow request/response patterns in `conversationsTypes.ts`
- **Error Handling**: Use `SerializedError` type for consistent error transport
- **Barrel Exports**: Follow existing IPC export patterns in `index.ts`

## Technical Approach

Create IPC infrastructure files following the established naming and organization patterns used by other subsystems in the desktop app.

## Implementation Requirements

### 1. Channel Constants Definition

**File**: `apps/desktop/src/shared/ipc/conversationAgentConstants.ts`

```typescript
/**
 * IPC channel constants for conversation agent operations.
 *
 * Following the established pattern of using namespace:action format
 * for clear channel organization and avoiding naming conflicts.
 */
export const CONVERSATION_AGENT_CHANNELS = {
  GET_BY_CONVERSATION: "conversationAgent:getByConversation",
  ADD: "conversationAgent:add",
  REMOVE: "conversationAgent:remove",
} as const;

/**
 * Type for conversation agent channel names.
 */
export type ConversationAgentChannel =
  (typeof CONVERSATION_AGENT_CHANNELS)[keyof typeof CONVERSATION_AGENT_CHANNELS];
```

### 2. IPC Request/Response Types

**File**: `apps/desktop/src/shared/ipc/conversationAgentTypes.ts`

```typescript
import type { ConversationAgentViewModel } from "@fishbowl-ai/ui-shared";
import type { SerializedError } from "./errorTypes";

// Base IPC response pattern
interface BaseResponse {
  success: boolean;
  error?: SerializedError;
}

// Request types
export interface ConversationAgentGetByConversationRequest {
  conversationId: string;
}

export interface ConversationAgentAddRequest {
  conversationId: string;
  agentId: string;
  displayOrder?: number;
}

export interface ConversationAgentRemoveRequest {
  conversationId: string;
  agentId: string;
}

// Response types
export interface ConversationAgentGetByConversationResponse
  extends BaseResponse {
  data?: ConversationAgentViewModel[];
}

export interface ConversationAgentAddResponse extends BaseResponse {
  data?: ConversationAgentViewModel;
}

export interface ConversationAgentRemoveResponse extends BaseResponse {
  data?: boolean; // Success indicator
}
```

### 3. Barrel Export Integration

**Update**: `apps/desktop/src/shared/ipc/index.ts`

Add exports for conversation agent IPC infrastructure:

```typescript
// Existing exports...

// Conversation Agent IPC
export { CONVERSATION_AGENT_CHANNELS } from "./conversationAgentConstants";
export type { ConversationAgentChannel } from "./conversationAgentConstants";
export type {
  ConversationAgentGetByConversationRequest,
  ConversationAgentAddRequest,
  ConversationAgentRemoveRequest,
  ConversationAgentGetByConversationResponse,
  ConversationAgentAddResponse,
  ConversationAgentRemoveResponse,
} from "./conversationAgentTypes";
```

### 4. Type Safety and Validation

**Request Validation**:

- Use existing validation patterns for ID format checking
- Follow string length and content validation patterns
- Ensure displayOrder is non-negative integer when provided

**Response Typing**:

- Consistent with existing response patterns using `BaseResponse`
- Proper optional data fields based on success/failure scenarios
- SerializedError integration for consistent error transport

### Testing Requirements

**Unit Tests in same task**:

**File**: `apps/desktop/src/shared/ipc/__tests__/conversationAgentIPC.test.ts`

```typescript
import {
  CONVERSATION_AGENT_CHANNELS,
  type ConversationAgentChannel,
} from "../conversationAgentConstants";
import type {
  ConversationAgentGetByConversationRequest,
  ConversationAgentAddRequest,
  ConversationAgentRemoveRequest,
  // ... response types
} from "../conversationAgentTypes";

describe("ConversationAgent IPC Constants", () => {
  test("should define all required channel constants", () => {
    expect(CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION).toBe(
      "conversationAgent:getByConversation",
    );
    expect(CONVERSATION_AGENT_CHANNELS.ADD).toBe("conversationAgent:add");
    expect(CONVERSATION_AGENT_CHANNELS.REMOVE).toBe("conversationAgent:remove");
  });

  test("should have consistent channel naming pattern", () => {
    const values = Object.values(CONVERSATION_AGENT_CHANNELS);
    values.forEach((channel) => {
      expect(channel).toMatch(/^conversationAgent:[a-zA-Z]+$/);
    });
  });
});

describe("ConversationAgent IPC Types", () => {
  test("request types should have required properties", () => {
    // Type compilation tests and validation
  });

  test("response types should extend BaseResponse", () => {
    // Response type validation tests
  });
});
```

## Implementation Patterns

### Channel Naming Convention

- **Namespace**: `conversationAgent:` (consistent with feature naming)
- **Actions**: Descriptive verbs matching business operations
- **Consistency**: Follow patterns used by other subsystems

### Type Definitions

- **Request Types**: Input parameters with proper validation types
- **Response Types**: Extend BaseResponse for consistent error handling
- **Data Types**: Use existing shared types from ui-shared package
- **Import Organization**: Clear separation of shared vs. desktop-specific types

## Dependencies

- ConversationAgentViewModel from ui-shared package (already implemented)
- SerializedError type from existing IPC infrastructure
- Existing IPC patterns and base response types

## Acceptance Criteria

- [ ] CONVERSATION_AGENT_CHANNELS constants defined with consistent naming
- [ ] All request types defined with proper TypeScript interfaces
- [ ] All response types extend BaseResponse pattern
- [ ] Channel names follow namespace:action convention
- [ ] Types use existing shared types (ConversationAgentViewModel)
- [ ] Barrel exports updated in IPC index.ts
- [ ] Unit tests validate channel constants and naming patterns
- [ ] Type tests ensure proper interface definitions
- [ ] Documentation explains channel organization and usage

## Implementation Notes

- Channel names use `conversationAgent:` prefix to match the feature context
- This task creates the IPC contract that both handlers and preload will use
- Types must be consistent with the ConversationAgentService interface
- Following established patterns ensures consistency with other IPC subsystems

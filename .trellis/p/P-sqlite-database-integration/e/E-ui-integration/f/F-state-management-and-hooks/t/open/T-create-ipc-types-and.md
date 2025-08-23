---
id: T-create-ipc-types-and
title: Create IPC types and conversation channels
status: open
priority: high
parent: F-state-management-and-hooks
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T20:30:08.142Z
updated: 2025-08-23T20:30:08.142Z
---

# Create IPC Types and Conversation Channels

## Context

This task establishes the TypeScript type definitions and channel constants needed for IPC communication between the renderer and main process for conversation operations. This follows the existing patterns established in the codebase for settings, LLM configs, and other IPC communications.

**Related Issues:**

- Feature: F-state-management-and-hooks
- Epic: E-ui-integration
- Project: P-sqlite-database-integration

**Reference Implementation:**

- Existing IPC types in `apps/desktop/src/types/`
- Channel patterns in preload.ts (settings, llmConfig, etc.)
- Shared conversation types in `packages/shared/src/types/conversations/`

## Detailed Implementation Requirements

### File Creation

1. **IPC Types File**
   Create `apps/desktop/src/types/ipc/conversations.ts`:

```typescript
import type {
  Conversation,
  CreateConversationInput,
  ConversationResult,
} from "@fishbowl-ai/shared";

// Request/Response types following existing patterns
export interface ConversationCreateRequest {
  input?: CreateConversationInput;
}

export interface ConversationCreateResponse {
  success: boolean;
  data?: Conversation;
  error?: {
    message: string;
    code?: string;
    context?: Record<string, unknown>;
  };
}

// Future extensibility for other conversation operations
export interface ConversationReadRequest {
  id: string;
}

export interface ConversationReadResponse {
  success: boolean;
  data?: Conversation;
  error?: {
    message: string;
    code?: string;
    context?: Record<string, unknown>;
  };
}

export interface ConversationListRequest {
  limit?: number;
  offset?: number;
}

export interface ConversationListResponse {
  success: boolean;
  data?: Conversation[];
  error?: {
    message: string;
    code?: string;
    context?: Record<string, unknown>;
  };
}
```

2. **Channel Constants File**
   Create `apps/desktop/src/electron/channels/conversationsChannels.ts`:

```typescript
export const CONVERSATION_CHANNELS = {
  CREATE: "conversations:create",
  READ: "conversations:read",
  LIST: "conversations:list",
  UPDATE: "conversations:update",
  DELETE: "conversations:delete",
} as const;

export type ConversationChannel =
  (typeof CONVERSATION_CHANNELS)[keyof typeof CONVERSATION_CHANNELS];
```

3. **Index Barrel Export**
   Update `apps/desktop/src/types/ipc/index.ts` (create if doesn't exist):

```typescript
export * from "./conversations";
// Export other IPC types here
```

### Type Design Requirements

1. **Consistency with Existing Patterns**
   - Follow the request/response pattern used in settings and LLM config
   - Use the same error structure across all IPC communications
   - Maintain backward compatibility with existing IPC infrastructure

2. **Error Handling Structure**
   - `message`: User-friendly error message
   - `code`: Machine-readable error code (optional)
   - `context`: Additional debugging information (optional)

3. **Request/Response Pairing**
   - Each operation has corresponding request and response types
   - Response types always include success boolean
   - Data and error are mutually exclusive in responses

### Channel Naming Convention

Follow existing pattern from the codebase:

- Format: `{entity}:{operation}`
- Examples: `conversations:create`, `conversations:read`
- Consistent with `settings:load`, `llmConfig:create`, etc.

### Integration Requirements

1. **Import Paths**
   - Use proper TypeScript import types for shared package
   - Maintain clean separation between IPC and business logic types
   - Export everything needed for preload script integration

2. **Future Extensibility**
   - Design supports full CRUD operations
   - Structure allows for additional conversation operations
   - Consistent with existing IPC patterns for easy extension

## Detailed Acceptance Criteria

### File Structure

- [ ] `apps/desktop/src/types/ipc/conversations.ts` created with complete type definitions
- [ ] `apps/desktop/src/electron/channels/conversationsChannels.ts` created with channel constants
- [ ] Barrel export in `apps/desktop/src/types/ipc/index.ts` updated
- [ ] All imports resolve correctly with TypeScript

### Type Definitions

- [ ] ConversationCreateRequest and ConversationCreateResponse defined
- [ ] Error structure matches existing IPC patterns
- [ ] Request/response types properly typed with shared package types
- [ ] Future CRUD operations outlined with placeholder types
- [ ] All types export correctly for external use

### Channel Constants

- [ ] CONVERSATION_CHANNELS object with all operation constants
- [ ] Channel naming follows existing convention
- [ ] ConversationChannel type union created for type safety
- [ ] Constants are properly typed as const assertions

### TypeScript Compliance

- [ ] No TypeScript errors in any new files
- [ ] Proper import/export statements using type imports where appropriate
- [ ] Shared package types imported correctly
- [ ] All types are properly documented with JSDoc

### Documentation

- [ ] JSDoc comments for all public interfaces
- [ ] Clear examples of how to use the types
- [ ] Comments explaining the relationship to existing patterns
- [ ] Future extensibility documented

### Testing Requirements

**Unit Tests** (include in same task):

- [ ] Types compile correctly with TypeScript
- [ ] Import/export statements work correctly
- [ ] Channel constants have correct string values
- [ ] Error structure matches expected patterns
- [ ] Integration with shared package types works

Test file: `apps/desktop/src/types/ipc/__tests__/conversations.test.ts`

## Technical Approach

### Step-by-Step Implementation

1. **Analyze Existing Patterns**
   - Review existing IPC type patterns in the codebase
   - Understand error handling structure used
   - Study channel naming conventions

2. **Create Type Definitions**

   ```typescript
   // Start with basic create operation types
   export interface ConversationCreateRequest {
     input?: CreateConversationInput;
   }
   ```

3. **Define Error Structure**

   ```typescript
   interface IPCError {
     message: string;
     code?: string;
     context?: Record<string, unknown>;
   }
   ```

4. **Create Channel Constants**

   ```typescript
   export const CONVERSATION_CHANNELS = {
     CREATE: "conversations:create",
     // ... other operations
   } as const;
   ```

5. **Add JSDoc Documentation**
   - Document all interfaces and their purpose
   - Provide usage examples
   - Explain relationship to shared types

6. **Create Tests**
   - Test type compilation
   - Verify imports work correctly
   - Test channel constant values
   - Validate error structure

### Import Strategy

Use proper TypeScript import types:

```typescript
import type {
  Conversation,
  CreateConversationInput,
} from "@fishbowl-ai/shared";
```

### Error Handling Pattern

Match existing pattern from settings/LLM config:

```typescript
export interface ConversationCreateResponse {
  success: boolean;
  data?: Conversation;
  error?: IPCError;
}
```

## Definition of Done

- IPC types file created with complete type definitions
- Channel constants file created following existing patterns
- Barrel exports properly configured
- All TypeScript compilation passes
- JSDoc documentation complete
- Unit tests written and passing
- Types ready for integration in preload script
- Channel constants ready for IPC handler registration
- Future extensibility properly planned and documented

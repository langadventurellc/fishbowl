---
id: T-extend-preload-script-with
title: Extend preload script with conversations API
status: open
priority: high
parent: F-state-management-and-hooks
prerequisites:
  - T-create-ipc-types-and
  - T-create-conversation-ipc
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T20:31:21.502Z
updated: 2025-08-23T20:31:21.502Z
---

# Extend Preload Script with Conversations API

## Context

This task extends the existing preload script to expose the conversations API to the renderer process, following the established patterns for settings, LLM configs, and other APIs. The implementation needs to integrate seamlessly with the existing window.api structure.

**Related Issues:**

- Feature: F-state-management-and-hooks
- Epic: E-ui-integration
- Project: P-sqlite-database-integration
- Depends on: T-create-ipc-types-and, T-create-conversation-ipc

**Reference Implementation:**

- Existing preload.ts at `apps/desktop/src/electron/preload.ts`
- Settings API implementation pattern
- LLM config API implementation pattern
- Error handling patterns in existing APIs

## Detailed Implementation Requirements

### File Modification

Extend `apps/desktop/src/electron/preload.ts`:

1. **Add Type Imports**

   ```typescript
   import type {
     ConversationCreateRequest,
     ConversationCreateResponse,
   } from "../types/ipc/conversations";
   import { CONVERSATION_CHANNELS } from "./channels/conversationsChannels";
   import type {
     Conversation,
     CreateConversationInput,
   } from "@fishbowl-ai/shared";
   ```

2. **Extend ElectronAPI Interface**
   Add conversations property to existing ElectronAPI interface:

   ```typescript
   interface ElectronAPI {
     // ... existing properties
     conversations: {
       create: (input?: CreateConversationInput) => Promise<Conversation>;
       // Future: add other CRUD operations
     };
   }
   ```

3. **Implement Conversations API**
   Add to the electronAPI object:

   ```typescript
   conversations: {
     create: async (input?: CreateConversationInput): Promise<Conversation> => {
       try {
         const request: ConversationCreateRequest = { input };
         const response = (await ipcRenderer.invoke(
           CONVERSATION_CHANNELS.CREATE,
           request,
         )) as ConversationCreateResponse;

         if (!response.success) {
           throw new Error(
             response.error?.message || "Failed to create conversation",
           );
         }

         return response.data!;
       } catch (error) {
         logger.error(
           "Error creating conversation:",
           error instanceof Error ? error : new Error(String(error)),
         );
         throw error instanceof Error
           ? error
           : new Error("Failed to communicate with main process");
       }
     };
   }
   ```

### API Design Requirements

1. **Consistency with Existing APIs**
   - Follow the same error handling pattern as settings/LLM config APIs
   - Use consistent logging approach
   - Maintain the same promise-based async API style
   - Return clean, typed responses

2. **Error Handling Strategy**
   - Catch IPC communication errors
   - Re-throw with user-friendly messages
   - Log detailed errors for debugging
   - Preserve original error types where possible
   - Handle both success/error response formats

3. **Type Safety**
   - Use proper TypeScript types throughout
   - Ensure request/response types match IPC handler expectations
   - Provide clean API surface with shared package types
   - Type assertions only where necessary and safe

### Integration with Existing Code

1. **Window API Extension**
   - Add conversations property to existing electronAPI object
   - Maintain alphabetical ordering if used
   - Follow existing property structure and naming

2. **Logger Integration**
   - Use existing logger instance from preload script
   - Follow same logging patterns as other API methods
   - Include appropriate context in error logs

3. **Error Message Consistency**
   - Use similar error messages as existing APIs
   - Maintain consistent tone and style
   - Provide actionable feedback where possible

## Detailed Acceptance Criteria

### API Implementation

- [ ] conversations.create method added to window.api
- [ ] Method accepts optional CreateConversationInput parameter
- [ ] Method returns Promise<Conversation>
- [ ] IPC communication works with main process handler
- [ ] Request/response types properly used

### Error Handling

- [ ] IPC errors caught and re-thrown with user-friendly messages
- [ ] Detailed errors logged for debugging
- [ ] Error handling consistent with existing API methods
- [ ] Both communication and application errors handled
- [ ] Error types preserved where possible

### Type Safety

- [ ] All imports use proper TypeScript type imports
- [ ] ElectronAPI interface extended correctly
- [ ] Request and response types match IPC handler
- [ ] No TypeScript compilation errors
- [ ] Clean API surface exposed to renderer

### Integration

- [ ] New API integrates seamlessly with existing window.api
- [ ] No breaking changes to existing functionality
- [ ] Logging follows existing patterns
- [ ] Code style consistent with existing preload code

### Testing Requirements

**Unit Tests** (include in same task):

- [ ] API method properly exposed on window.api
- [ ] Successful conversation creation works end-to-end
- [ ] Error scenarios handled correctly
- [ ] IPC communication mocked and tested
- [ ] Type safety verified through compilation
- [ ] Logging behavior tested

Test file: `apps/desktop/src/electron/__tests__/preload.conversations.test.ts`

## Technical Approach

### Step-by-Step Implementation

1. **Add Type Imports**

   ```typescript
   import type {
     Conversation,
     CreateConversationInput,
   } from "@fishbowl-ai/shared";
   import type {
     ConversationCreateRequest,
     ConversationCreateResponse,
   } from "../types/ipc/conversations";
   import { CONVERSATION_CHANNELS } from "./channels/conversationsChannels";
   ```

2. **Extend Interface Definition**

   ```typescript
   interface ElectronAPI {
     // existing properties...
     conversations: {
       create: (input?: CreateConversationInput) => Promise<Conversation>;
     };
   }
   ```

3. **Implement API Method**

   ```typescript
   conversations: {
     create: async (input?: CreateConversationInput): Promise<Conversation> => {
       try {
         const request: ConversationCreateRequest = { input };
         const response = (await ipcRenderer.invoke(
           CONVERSATION_CHANNELS.CREATE,
           request,
         )) as ConversationCreateResponse;

         if (!response.success) {
           throw new Error(
             response.error?.message || "Failed to create conversation",
           );
         }

         return response.data!;
       } catch (error) {
         logger.error(
           "Error creating conversation:",
           error instanceof Error ? error : new Error(String(error)),
         );
         throw error instanceof Error
           ? error
           : new Error("Failed to communicate with main process");
       }
     };
   }
   ```

4. **Test Implementation**
   - Mock ipcRenderer.invoke for testing
   - Test success and error scenarios
   - Verify type safety and integration

### Error Handling Pattern

Follow existing pattern from settings API:

```typescript
try {
  const response = await ipcRenderer.invoke(channel, request);
  if (!response.success) {
    throw new Error(response.error?.message || "Operation failed");
  }
  return response.data!;
} catch (error) {
  logger.error(
    "Error in operation:",
    error instanceof Error ? error : new Error(String(error)),
  );
  throw error instanceof Error
    ? error
    : new Error("Failed to communicate with main process");
}
```

### Future Extensibility

Plan for additional CRUD operations:

```typescript
conversations: {
  create: (input?: CreateConversationInput) => Promise<Conversation>;
  // Future methods:
  // read: (id: string) => Promise<Conversation | null>;
  // list: (options?: ListOptions) => Promise<Conversation[]>;
  // update: (id: string, updates: UpdateConversationInput) => Promise<Conversation>;
  // delete: (id: string) => Promise<void>;
}
```

## Definition of Done

- conversations.create method added to window.api
- Method properly typed and integrated with existing preload code
- IPC communication working with main process handler
- Error handling consistent with existing API patterns
- Type safety maintained throughout implementation
- Unit tests written and passing
- No breaking changes to existing functionality
- API ready for use in React hooks
- Documentation updated with usage examples

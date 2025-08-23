---
id: T-create-conversation-ipc
title: Create conversation IPC handler in main process
status: open
priority: high
parent: F-state-management-and-hooks
prerequisites:
  - T-create-ipc-types-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T20:30:45.753Z
updated: 2025-08-23T20:30:45.753Z
---

# Create Conversation IPC Handler in Main Process

## Context

This task implements the IPC handler in the Electron main process that receives conversation creation requests from the renderer process and delegates them to the ConversationsRepository. This follows the established pattern used for settings, LLM configs, and other IPC handlers in the codebase.

**Related Issues:**

- Feature: F-state-management-and-hooks
- Epic: E-ui-integration
- Project: P-sqlite-database-integration
- Depends on: T-create-ipc-types-and

**Reference Implementation:**

- Existing handlers in `apps/desktop/src/electron/handlers/`
- Settings handler pattern in the main process
- LLM config handler patterns
- MainProcessServices integration in `apps/desktop/src/main/services/MainProcessServices.ts`

## Detailed Implementation Requirements

### File Creation

Create `apps/desktop/src/electron/handlers/conversationsHandler.ts`:

```typescript
import { ipcMain } from "electron";
import type {
  ConversationCreateRequest,
  ConversationCreateResponse,
} from "../../types/ipc/conversations";
import { CONVERSATION_CHANNELS } from "../channels/conversationsChannels";
import type { MainProcessServices } from "../../main/services/MainProcessServices";
import { logger } from "@fishbowl-ai/shared";

export class ConversationsHandler {
  constructor(private services: MainProcessServices) {}

  registerHandlers(): void {
    this.registerCreateHandler();
    // Future: register other CRUD handlers
  }

  private registerCreateHandler(): void {
    ipcMain.handle(
      CONVERSATION_CHANNELS.CREATE,
      async (
        event,
        request: ConversationCreateRequest,
      ): Promise<ConversationCreateResponse> => {
        try {
          // Implementation details below
        } catch (error) {
          // Error handling below
        }
      },
    );
  }

  unregisterHandlers(): void {
    ipcMain.removeAllListeners(CONVERSATION_CHANNELS.CREATE);
  }
}
```

### Handler Implementation Details

1. **Create Handler Logic**
   - Validate request structure
   - Extract input data (title, etc.)
   - Call ConversationsRepository through MainProcessServices
   - Handle success and error cases
   - Return properly formatted response

2. **Error Handling Strategy**
   - Catch and classify different error types
   - Convert database/repository errors to user-friendly messages
   - Maintain detailed logging for debugging
   - Preserve error context for troubleshooting

3. **Input Validation**
   - Validate request structure matches expected type
   - Sanitize input data if necessary
   - Handle optional title parameter
   - Reject invalid or malicious input

4. **Logging Integration**
   - Use existing logger from shared package
   - Log successful operations
   - Log errors with full context
   - Include request details for debugging

### Integration with MainProcessServices

1. **Service Access**
   - Access ConversationsRepository through services.getConversationsRepository()
   - Handle case where repository is not initialized
   - Maintain consistent error handling across services

2. **Dependency Injection**
   - Receive MainProcessServices instance in constructor
   - Follow existing handler pattern in codebase
   - Support testability through dependency injection

### Response Format Standardization

Follow existing IPC response patterns:

```typescript
// Success response
const successResponse: ConversationCreateResponse = {
  success: true,
  data: createdConversation,
};

// Error response
const errorResponse: ConversationCreateResponse = {
  success: false,
  error: {
    message: "User-friendly error message",
    code: "CONVERSATION_CREATE_FAILED",
    context: { originalError: error.message },
  },
};
```

## Detailed Acceptance Criteria

### Handler Registration

- [ ] ConversationsHandler class created following existing patterns
- [ ] CREATE handler registered with correct channel name
- [ ] Handler accepts ConversationCreateRequest type
- [ ] Handler returns ConversationCreateResponse type
- [ ] unregisterHandlers method properly removes listeners

### Request Processing

- [ ] Input validation rejects malformed requests
- [ ] Optional title parameter handled correctly
- [ ] ConversationsRepository called through MainProcessServices
- [ ] Repository responses properly converted to IPC format
- [ ] Error cases handled gracefully

### Error Handling

- [ ] Database errors converted to user-friendly messages
- [ ] Network/connection errors handled appropriately
- [ ] Validation errors provide actionable feedback
- [ ] Unknown errors logged with full context
- [ ] Error responses follow standard format

### Service Integration

- [ ] MainProcessServices dependency injected correctly
- [ ] ConversationsRepository accessed through services
- [ ] Error handling for uninitialized services
- [ ] Follows existing service integration patterns

### Logging and Monitoring

- [ ] Successful operations logged at info level
- [ ] Errors logged at error level with full context
- [ ] Request details included in logs for debugging
- [ ] No sensitive data exposed in logs

### Testing Requirements

**Unit Tests** (include in same task):

- [ ] Handler registers and unregisters correctly
- [ ] Valid requests processed successfully
- [ ] Invalid requests rejected appropriately
- [ ] Error scenarios handled correctly
- [ ] Service integration works as expected
- [ ] Logging behavior verified

Test file: `apps/desktop/src/electron/handlers/__tests__/conversationsHandler.test.ts`

## Technical Approach

### Step-by-Step Implementation

1. **Create Handler Class Structure**

   ```typescript
   export class ConversationsHandler {
     constructor(private services: MainProcessServices) {}

     registerHandlers(): void {
       /* ... */
     }
     unregisterHandlers(): void {
       /* ... */
     }
   }
   ```

2. **Implement Create Handler**

   ```typescript
   private registerCreateHandler(): void {
     ipcMain.handle(CONVERSATION_CHANNELS.CREATE, async (event, request) => {
       // Validation, processing, response
     });
   }
   ```

3. **Add Input Validation**

   ```typescript
   private validateCreateRequest(request: ConversationCreateRequest): void {
     if (!request || typeof request !== 'object') {
       throw new Error('Invalid request format');
     }
     // Additional validation
   }
   ```

4. **Implement Repository Integration**

   ```typescript
   const repository = this.services.getConversationsRepository();
   const result = await repository.create(request.input || {});
   ```

5. **Add Error Handling**

   ```typescript
   try {
     // Handler logic
   } catch (error) {
     logger.error("Conversation creation failed", { error, request });
     return { success: false, error: this.formatError(error) };
   }
   ```

6. **Create Unit Tests**
   - Mock MainProcessServices and repository
   - Test success and error paths
   - Verify IPC registration/unregistration
   - Test input validation

### Error Classification

```typescript
private formatError(error: unknown): IPCError {
  if (error instanceof ConversationValidationError) {
    return {
      message: 'Invalid conversation data provided',
      code: 'VALIDATION_ERROR',
      context: { details: error.details }
    };
  }

  if (error instanceof DatabaseError) {
    return {
      message: 'Failed to save conversation',
      code: 'DATABASE_ERROR'
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}
```

### Registration in Main Process

This handler will be registered in the main process initialization, likely in `apps/desktop/src/electron/main.ts` or through MainProcessServices.

## Definition of Done

- ConversationsHandler class created following existing patterns
- CREATE handler implemented with proper validation and error handling
- Integration with MainProcessServices working correctly
- Error responses follow standardized format
- Logging implemented for debugging and monitoring
- Unit tests written and passing
- Handler ready for registration in main process
- Documentation complete with usage examples

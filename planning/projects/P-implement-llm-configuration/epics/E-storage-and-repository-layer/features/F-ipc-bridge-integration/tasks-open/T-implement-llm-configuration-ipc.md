---
kind: task
id: T-implement-llm-configuration-ipc
title: Implement LLM Configuration IPC Handlers with Repository Integration
status: open
priority: high
prerequisites:
  - T-create-ipc-channel-definitions
created: "2025-08-06T20:42:44.051671"
updated: "2025-08-06T20:42:44.051671"
schema_version: "1.1"
parent: F-ipc-bridge-integration
---

# Implement LLM Configuration IPC Handlers with Repository Integration

## Context

Implement IPC handlers in the main process for all LLM configuration CRUD operations, following the pattern established in `apps/desktop/src/electron/settingsHandlers.ts`. These handlers will provide secure, validated communication between renderer and main processes.

## Reference Implementation

- Study `apps/desktop/src/electron/settingsHandlers.ts` for the exact handler pattern
- Follow error serialization from `apps/desktop/src/electron/utils/errorSerialization.ts`
- Use repository pattern similar to `settingsRepositoryManager.get()`

## Detailed Requirements

### 1. Create Main Handler File

Create `apps/desktop/src/electron/llmConfigHandlers.ts` with the following structure:

```typescript
import { ipcMain } from "electron";
import { LLM_CONFIG_CHANNELS } from "../shared/ipc/index";
import { serializeError } from "./utils/errorSerialization";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "llmConfigHandlers" } },
});
```

### 2. Implement CRUD Handlers

Implement handlers for all operations following the existing pattern:

#### Create Handler

- Channel: `LLM_CONFIG_CHANNELS.CREATE`
- Input validation using Zod schemas from shared package
- Call repository.create() method
- Return standardized response format: `{ success: true, data }` or `{ success: false, error }`

#### Read Handler

- Channel: `LLM_CONFIG_CHANNELS.READ`
- Validate UUID format for ID parameter
- Call repository.read() method
- Handle not found cases gracefully

#### Update Handler

- Channel: `LLM_CONFIG_CHANNELS.UPDATE`
- Validate both ID and update data
- Call repository.update() method
- Return updated configuration data

#### Delete Handler

- Channel: `LLM_CONFIG_CHANNELS.DELETE`
- Validate UUID format for ID parameter
- Call repository.delete() method
- Handle cleanup of both secure and file storage

#### List Handler

- Channel: `LLM_CONFIG_CHANNELS.LIST`
- No input parameters required
- Call repository.list() method
- Return array of all configurations

### 3. Error Handling and Validation

Each handler must implement:

- Input validation using Zod schemas before repository calls
- Proper error catching and serialization using `serializeError()`
- Sanitized error messages (no API keys or sensitive data)
- Appropriate logging with debug/error levels

### 4. Repository Integration

- Import and use LlmConfigRepository when available (from prerequisite F-repository-pattern)
- Follow repository manager pattern like settings handlers
- Proper dependency injection for testability

## Handler Template Pattern

Each handler follows this structure:

```typescript
ipcMain.handle(
  LLM_CONFIG_CHANNELS.OPERATION,
  async (_event, request: RequestType): Promise<ResponseType> => {
    try {
      logger.debug("Operation starting", { operation: "..." });

      // Input validation
      const validatedInput = schema.parse(request);

      // Repository operation
      const repository = llmConfigRepositoryManager.get();
      const result = await repository.operation(validatedInput);

      logger.debug("Operation completed successfully");
      return { success: true, data: result };
    } catch (error) {
      logger.error("Operation failed", error as Error);
      return { success: false, error: serializeError(error) };
    }
  },
);
```

## Implementation Steps

1. **Create handler file** - Set up imports and logger following existing pattern
2. **Implement each CRUD handler** - One at a time, following the template pattern
3. **Add input validation** - Use Zod schemas from shared package for all inputs
4. **Implement error handling** - Catch all errors and serialize appropriately
5. **Add comprehensive logging** - Debug info for operations, errors for failures
6. **Write unit tests** - Test each handler with valid/invalid inputs and error scenarios

## Detailed Acceptance Criteria

### Handler Implementation

- ✅ All 5 CRUD handlers implemented (create, read, update, delete, list)
- ✅ Each handler uses correct channel from channel definitions
- ✅ All handlers follow the established async pattern with try/catch
- ✅ Proper TypeScript types for requests and responses

### Repository Integration

- ✅ Handlers integrate with LlmConfigRepository when available
- ✅ Repository calls are properly awaited
- ✅ Repository errors are caught and handled appropriately
- ✅ No direct storage access from handlers (repository abstraction maintained)

### Input Validation

- ✅ All handler inputs validated using Zod schemas before repository calls
- ✅ Invalid inputs return proper error responses
- ✅ UUID validation for ID parameters
- ✅ Required field validation for create/update operations

### Error Handling

- ✅ All errors caught and serialized using `serializeError()`
- ✅ No API keys or sensitive data in error messages
- ✅ Repository errors properly propagated to renderer
- ✅ Validation errors return meaningful messages

### Logging

- ✅ Debug logging for successful operations
- ✅ Error logging for failures with proper context
- ✅ Logger follows existing component naming pattern
- ✅ No sensitive data in log messages

### Unit Tests

- ✅ Tests for each handler with valid inputs
- ✅ Tests for invalid inputs and validation errors
- ✅ Tests for repository error scenarios
- ✅ Tests verify proper response format (success/error structure)
- ✅ Tests confirm error serialization works correctly

## Security Considerations

- Input validation prevents malicious data from reaching repository
- API keys never logged or exposed in error messages
- Error sanitization ensures no sensitive data leaks to renderer
- Repository abstraction maintains security boundaries

## Dependencies

- **T-create-ipc-channel-definitions**: Requires channel constants and types
- **F-repository-pattern**: Requires LlmConfigRepository implementation
- **Existing infrastructure**: serializeError, logger, ipcMain

## File Location

- Primary file: `apps/desktop/src/electron/llmConfigHandlers.ts`
- Unit tests: `apps/desktop/src/electron/__tests__/llmConfigHandlers.test.ts`

### Log

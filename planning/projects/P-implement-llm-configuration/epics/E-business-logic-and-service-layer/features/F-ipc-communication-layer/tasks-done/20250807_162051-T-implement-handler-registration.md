---
kind: task
id: T-implement-handler-registration
parent: F-ipc-communication-layer
status: done
title: Implement handler registration and main process integration
priority: high
prerequisites:
  - T-implement-ipc-handlers-for-llm
created: "2025-08-07T15:14:11.743211"
updated: "2025-08-07T16:09:15.156646"
schema_version: "1.1"
worktree: null
---

# Implement Handler Registration and Main Process Integration

## Context

Create the setup function that registers all LLM configuration IPC handlers with the main process and integrates with the application lifecycle. This includes service injection, handler registration, and proper initialization during app startup.

## Detailed Requirements

### 1. Handler Setup Function

Create a central setup function that registers all handlers:

```typescript
export function setupLlmConfigHandlers(
  ipcMain: IpcMain,
  service: LlmConfigService,
): void {
  // Register all CRUD operation handlers
  registerCreateHandler(ipcMain, service);
  registerReadHandler(ipcMain, service);
  registerUpdateHandler(ipcMain, service);
  registerDeleteHandler(ipcMain, service);
  registerListHandler(ipcMain, service);
  registerInitializeHandler(ipcMain, service);

  logger.info("LLM configuration IPC handlers registered successfully");
}
```

### 2. Main Process Integration

Integrate with app startup lifecycle:

```typescript
// In main process initialization
app.whenReady().then(() => {
  const llmConfigService = getLlmConfigService();
  setupLlmConfigHandlers(ipcMain, llmConfigService);

  // Initialize service after handlers are registered
  llmConfigService.initialize().catch((error) => {
    logger.error("Failed to initialize LLM config service", error);
  });
});
```

### 3. Service Lifecycle Management

- Register handlers before service initialization
- Ensure service is ready before handling requests
- Handle service initialization failures gracefully
- Support graceful shutdown and cleanup

### 4. Error Recovery

- Handle handler registration failures
- Provide fallback behavior for missing service
- Log registration status for debugging
- Support re-registration if needed

## Technical Implementation Steps

1. **Create setup function**:
   - Implement `setupLlmConfigHandlers` function
   - Register each handler with proper error handling
   - Add comprehensive logging for registration status

2. **Add service injection**:
   - Accept service instance as parameter
   - Validate service is properly initialized
   - Handle missing or invalid service gracefully

3. **Integrate with main process**:
   - Import setup function in main process initialization
   - Call setup during app startup sequence
   - Ensure proper order with other initialization steps

4. **Add lifecycle management**:
   - Initialize service after handlers are registered
   - Handle initialization failures without crashing app
   - Support cleanup on app shutdown if needed

## Handler Registration Pattern

Each handler should be registered individually with proper error boundaries:

```typescript
function registerCreateHandler(
  ipcMain: IpcMain,
  service: LlmConfigService,
): void {
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.CREATE,
    async (event, request: LlmConfigCreateRequest) => {
      try {
        validateCreateRequest(request);
        const config = await service.create(request.input);
        return createSuccessResponse(config);
      } catch (error) {
        logger.error("LLM config create failed", { error, request });
        return createErrorResponse(error);
      }
    },
  );
}
```

## Acceptance Criteria

- ✓ `setupLlmConfigHandlers` function registers all IPC handlers
- ✓ Service instance is properly injected into handlers
- ✓ Handler registration occurs during app startup
- ✓ Service initialization happens after handler registration
- ✓ Registration failures are logged and handled gracefully
- ✓ Service initialization failures don't crash the app
- ✓ All handlers are accessible from renderer process after setup
- ✓ Proper logging shows successful registration status

## Unit Testing Requirements

Create comprehensive unit tests covering:

1. **Setup function tests**:
   - Test successful handler registration
   - Test all handlers are registered with correct channels
   - Verify service injection works properly

2. **Integration tests**:
   - Test setup function integrates with ipcMain correctly
   - Test handler registration order and dependencies
   - Verify logging output for successful registration

3. **Error handling tests**:
   - Test missing service parameter handling
   - Test ipcMain registration failures
   - Verify error logging and recovery behavior

4. **Lifecycle tests**:
   - Test proper initialization sequence
   - Test service initialization error handling
   - Verify handlers work after setup completion

## Dependencies

- Requires IPC handlers from previous task
- Requires `LlmConfigService` from core service feature
- Uses Electron's `ipcMain` and `IpcMain` types
- Uses existing logger service from `@fishbowl-ai/shared`

## File Structure

```
apps/desktop/src/electron/
├── llmConfigHandlers.ts            # Main setup and registration
├── handlers/
│   ├── createHandler.ts            # Individual handler functions
│   ├── readHandler.ts
│   ├── updateHandler.ts
│   ├── deleteHandler.ts
│   ├── listHandler.ts
│   └── initializeHandler.ts
└── __tests__/
    └── llmConfigSetup.test.ts      # Setup and integration tests
```

## Integration Points

### Main Process Integration

- Import in main Electron process file
- Call during app.whenReady() lifecycle
- Integrate with existing service initialization patterns

### Service Integration

- Require LlmConfigService instance
- Handle service lifecycle properly
- Support service dependency injection

### Logging Integration

- Use existing logger service patterns
- Log registration success/failure
- Include debug information for troubleshooting

## Implementation Notes

- Follow existing patterns from settingsHandlers.ts setup
- Keep setup function simple and focused
- Use defensive programming for service validation
- Ensure setup is idempotent (safe to call multiple times)
- Consider handler registration order if dependencies exist

### Log

**2025-08-07T21:20:51.059896Z** - Successfully refactored LLM configuration IPC handler registration to use modular architecture with individual registration functions. Updated main process integration to register handlers before service initialization, improving error recovery and system reliability. All tests passing with enhanced validation and logging.

- filesChanged: ["apps/desktop/src/electron/handlers/llmConfigHandlers.ts", "apps/desktop/src/electron/main.ts", "apps/desktop/src/electron/__tests__/handlers/llmConfigHandlers.test.ts"]

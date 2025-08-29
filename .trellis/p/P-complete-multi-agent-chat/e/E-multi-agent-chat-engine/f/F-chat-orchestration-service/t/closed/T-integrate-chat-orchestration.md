---
id: T-integrate-chat-orchestration
title: Integrate chat orchestration into MainProcessServices with factory method
status: done
priority: low
parent: F-chat-orchestration-service
prerequisites:
  - T-create-mainprocesschatorchestr
affectedFiles: {}
log:
  - Chat orchestration service integration was already completed in
    MainProcessServices. Verified proper service property declaration,
    factory-based initialization with dependency injection, structured error
    handling and logging, and all quality checks pass. The service is properly
    accessible via mainServices.chatOrchestrationService following established
    service container patterns. IPC handler setup appears to be part of a
    separate task as setupChatHandlers function doesn't exist yet.
schema: v1.0
childrenIds: []
created: 2025-08-29T19:43:58.194Z
updated: 2025-08-29T19:43:58.194Z
---

# Integrate chat orchestration into MainProcessServices with factory method

## Context

Add the chat orchestration service to the existing `MainProcessServices` class and ensure it's properly initialized during app startup. This task integrates the service into the main process service container following established patterns.

## Technical Approach

Follow existing service integration patterns in `MainProcessServices`:

- Add service property to class definition
- Initialize in constructor with proper error handling
- Use factory pattern for complex dependency setup
- Follow initialization logging patterns

## Implementation Requirements

### MainProcessServices Updates (`apps/desktop/src/main/services/MainProcessServices.ts`)

Add service property:

```typescript
/**
 * Chat orchestration service for multi-agent message processing.
 */
readonly chatOrchestrationService: ChatOrchestrationService;
```

Add initialization in constructor:

```typescript
// Initialize chat orchestration service
try {
  this.chatOrchestrationService = ChatOrchestrationServiceFactory.create(this);
  this.logger.info("ChatOrchestrationService initialized successfully");
} catch (error) {
  this.logger.error(
    "Failed to initialize ChatOrchestrationService",
    error instanceof Error ? error : undefined,
  );
  throw new Error("ChatOrchestrationService initialization failed");
}
```

### Main Process Startup (`apps/desktop/src/main.ts`)

Ensure chat handlers are registered:

```typescript
import { setupChatHandlers } from "./electron/chatHandlers";

// Register chat handlers
setupChatHandlers(mainServices);
```

## Acceptance Criteria

### Service Integration

- **GIVEN** MainProcessServices instantiation during app startup
- **WHEN** creating service container
- **THEN** it should:
  - Successfully create `ChatOrchestrationService` instance using factory
  - Make service accessible via `mainServices.chatOrchestrationService`
  - Log successful initialization with component name
  - Handle factory creation errors gracefully with structured logging
  - Follow existing error handling patterns for service initialization

### Startup Registration

- **GIVEN** Electron main process startup
- **WHEN** setting up IPC handlers
- **THEN** it should:
  - Register chat IPC handlers using `setupChatHandlers(mainServices)`
  - Ensure handlers have access to initialized chat orchestration service
  - Handle handler setup errors gracefully
  - Log successful handler registration

### Error Handling

- **GIVEN** service initialization failures occur
- **WHEN** MainProcessServices constructor runs
- **THEN** it should:
  - Log detailed error information using structured logger
  - Throw descriptive error that prevents app startup
  - Follow existing error handling patterns from other service initializations
  - Never expose sensitive dependency details in error messages

## Implementation Files

Update these existing files:

1. `apps/desktop/src/main/services/MainProcessServices.ts` - Add service integration
2. `apps/desktop/src/main.ts` - Register chat handlers

## Dependencies

### Internal Dependencies

- `ChatOrchestrationService` (from prerequisite task)
- `ChatOrchestrationServiceFactory` (from prerequisite task)
- `setupChatHandlers` function (from IPC handlers task)
- Existing `MainProcessServices` patterns and utilities

### Service Dependencies

- All repository instances from existing `MainProcessServices`
- Logger instance for structured initialization logging

## Testing Requirements

### Unit Tests (`apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts`)

Add to existing test suite:

```typescript
describe("chat orchestration service integration", () => {
  it("should initialize chat orchestration service successfully");
  it("should provide accessible service instance");
  it("should handle initialization failures gracefully");
  it("should log initialization success and failures appropriately");
});
```

### Integration Tests

- Test service availability after MainProcessServices initialization
- Verify IPC handler registration during app startup
- Test error scenarios during service factory failures

## Performance Requirements

- Service initialization within existing MainProcessServices startup time budget
- No additional startup delay beyond necessary dependency creation
- Efficient factory pattern execution

## Security Considerations

### Initialization Security

- Proper error message sanitization during startup failures
- No sensitive dependency information exposed in logs
- Follow existing security patterns for service initialization

## Documentation Requirements

Add JSDoc documentation for:

- New service property in MainProcessServices
- Service initialization patterns for future reference

This task completes the integration of the chat orchestration service into the main process service container, making it available for IPC handler usage and ensuring proper application startup.

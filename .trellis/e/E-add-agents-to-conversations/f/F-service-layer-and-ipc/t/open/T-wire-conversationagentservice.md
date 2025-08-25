---
id: T-wire-conversationagentservice
title: Wire ConversationAgentService into MainProcessServices
status: open
priority: high
parent: F-service-layer-and-ipc
prerequisites:
  - T-create-conversationagentservic
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T04:37:37.291Z
updated: 2025-08-25T04:37:37.291Z
---

# Wire ConversationAgentService into MainProcessServices

## Context

Integrate the ConversationAgentService into the MainProcessServices class to make it available to IPC handlers and other parts of the application. Follow the established service registration patterns.

## Technical Approach

Follow the exact patterns used for existing services in MainProcessServices, including proper initialization order, error handling, and dependency injection.

## Implementation Requirements

### Service Property Addition

Add ConversationAgentService as a readonly property in MainProcessServices class:

```typescript
/**
 * Service for managing conversation-agent associations with business logic.
 */
readonly conversationAgentService: ConversationAgentService;
```

### Service Initialization in Constructor

Add service initialization in the MainProcessServices constructor, following the pattern used for other services:

```typescript
// Initialize conversation agent service
try {
  this.conversationAgentService = new ConversationAgentService(
    this.conversationAgentsRepository,
    this.logger,
  );

  this.logger.info("ConversationAgentService initialized successfully");
} catch (error) {
  this.logger.error(
    "Failed to initialize ConversationAgentService",
    error instanceof Error ? error : undefined,
  );
  throw new Error("ConversationAgentService initialization failed");
}
```

### ConversationAgentsRepository Integration

First, add the ConversationAgentsRepository as a readonly property and initialize it in the constructor:

```typescript
/**
 * Repository for managing conversation-agent associations.
 */
readonly conversationAgentsRepository: ConversationAgentsRepository;
```

Constructor initialization:

```typescript
// Initialize conversation agents repository
try {
  this.conversationAgentsRepository = new ConversationAgentsRepository(
    this.databaseBridge,
    this.cryptoUtils,
  );

  this.logger.info("ConversationAgentsRepository initialized successfully");
} catch (error) {
  this.logger.error(
    "Failed to initialize ConversationAgentsRepository",
    error instanceof Error ? error : undefined,
  );
  throw new Error("ConversationAgentsRepository initialization failed");
}
```

### Initialization Order

Ensure proper dependency order in constructor:

1. ConversationAgentsRepository (depends on databaseBridge, cryptoUtils)
2. ConversationAgentService (depends on ConversationAgentsRepository, logger)

Both should be initialized after the database bridge and crypto utils but before any dependent services.

### Service Access Methods

Add getter methods for accessing the services, following existing patterns:

```typescript
/**
 * Get the conversation agent service instance.
 *
 * @returns The conversation agent service
 * @throws Error if service not initialized
 */
getConversationAgentService(): ConversationAgentService {
  if (!this.conversationAgentService) {
    throw new Error("ConversationAgentService not initialized");
  }

  return this.conversationAgentService;
}

/**
 * Get the conversation agents repository instance.
 *
 * @returns The conversation agents repository
 * @throws Error if repository not initialized
 */
getConversationAgentsRepository(): ConversationAgentsRepository {
  if (!this.conversationAgentsRepository) {
    throw new Error("ConversationAgentsRepository not initialized");
  }

  return this.conversationAgentsRepository;
}
```

### Handler Registration Integration

Update the main process initialization to register the conversation agent handlers:

In the main.ts or wherever handlers are registered:

```typescript
// Import the handler setup function
import { setupConversationAgentHandlers } from "./conversationAgentHandlers";

// Register handlers
setupConversationAgentHandlers(mainProcessServices);
```

### Error Handling

Include proper error handling for service initialization:

- Try/catch blocks around each service initialization
- Meaningful error logging with context
- Throw descriptive errors that will help with debugging
- Follow the same error handling pattern as existing services

### Import Statements

Add necessary import statements at the top of MainProcessServices.ts:

```typescript
import { ConversationAgentService } from "@fishbowl-ai/shared";
import { ConversationAgentsRepository } from "@fishbowl-ai/shared";
```

## Unit Tests

Extend the existing MainProcessServices test suite to include:

- **Service initialization tests**:
  - Verify ConversationAgentsRepository is properly initialized
  - Verify ConversationAgentService is properly initialized
  - Test initialization order dependencies
- **Getter method tests**:
  - Test successful service access through getter methods
  - Test error throwing when services not initialized
- **Error handling tests**:
  - Test initialization failure scenarios
  - Verify proper error logging and re-throwing
- **Integration tests**:
  - Verify services are properly connected with their dependencies
  - Test that handler registration works correctly

Add tests to existing `apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts`.

## Dependencies

- ConversationAgentService (from previous task)
- ConversationAgentsRepository (already exists)
- Existing MainProcessServices infrastructure
- Database bridge and crypto utils dependencies

## Acceptance Criteria

- [ ] ConversationAgentsRepository property and initialization added
- [ ] ConversationAgentService property and initialization added
- [ ] Proper initialization order maintained
- [ ] Getter methods implemented with error handling
- [ ] Handler registration integrated in main process
- [ ] Comprehensive error handling with logging
- [ ] Import statements added for new services
- [ ] Unit tests cover all new functionality
- [ ] Services properly accessible to IPC handlers
- [ ] Initialization follows existing service patterns exactly

## File Structure

Updates to existing files:

- `apps/desktop/src/main/services/MainProcessServices.ts`
- `apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts`
- Main process initialization file (main.ts or similar)

## Implementation Notes

- The service initialization should happen in the constructor following dependency order
- Error handling must be consistent with existing service patterns
- The getter methods provide a clean API for accessing services
- Handler registration should be added to the main process initialization
- All logging should use structured logging with appropriate context
- Service dependencies must be properly injected through constructor parameters

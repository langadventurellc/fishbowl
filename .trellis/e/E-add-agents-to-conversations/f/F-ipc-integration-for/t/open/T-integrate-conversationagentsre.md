---
id: T-integrate-conversationagentsre
title: Integrate ConversationAgentsRepository into MainProcessServices
status: open
priority: high
parent: F-ipc-integration-for
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T06:05:01.772Z
updated: 2025-08-25T06:05:01.772Z
---

# Integrate ConversationAgentsRepository into MainProcessServices

## Context

The `ConversationAgentsRepository` is already implemented but needs to be integrated into the main process services architecture to enable IPC communication. This follows the exact pattern used for `ConversationsRepository` integration.

## Implementation Requirements

### Add Repository Property and Initialization

- **File**: `apps/desktop/src/main/services/MainProcessServices.ts`
- **Follow Pattern**: Lines 50 and 77-87 where `conversationsRepository` is declared and initialized
- **Location**: Add after existing `conversationsRepository` declaration

### Specific Changes Required

1. **Property Declaration** (add after line 50):

```typescript
/**
 * Repository for managing conversation agent persistence.
 */
readonly conversationAgentsRepository: ConversationAgentsRepositoryInterface;
```

2. **Constructor Initialization** (add after line 87 in constructor):

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

## Technical Requirements

### Import Statements

- Add import for `ConversationAgentsRepository` from `@fishbowl-ai/shared`
- Add import for `ConversationAgentsRepositoryInterface` if needed

### Error Handling

- Follow exact error handling pattern from conversations repository
- Log initialization success/failure consistently
- Throw descriptive error if initialization fails

### Dependency Injection

- Use same `databaseBridge` and `cryptoUtils` instances
- Maintain same initialization order and approach

## Acceptance Criteria

- ✅ Repository property added to MainProcessServices class
- ✅ Repository initialized in constructor with proper dependencies
- ✅ Error handling matches conversationsRepository pattern exactly
- ✅ Logging follows established patterns (info for success, error for failure)
- ✅ Import statements added for all required types
- ✅ TypeScript compilation succeeds without errors
- ✅ Repository accessible via `mainServices.conversationAgentsRepository`

## Testing Requirements

### Unit Tests

Write tests in the same file as existing MainProcessServices tests to verify:

- Repository is properly initialized during construction
- Error handling works when dependencies are invalid
- Repository instance is accessible after initialization
- Logging messages are generated correctly

### Integration Verification

- MainProcessServices constructor creates repository successfully
- Repository methods are callable via the service instance
- Database operations work through the integrated repository

## Implementation Notes

- **Reference File**: `apps/desktop/src/main/services/MainProcessServices.ts` lines 77-87
- **Pattern Source**: Follow `conversationsRepository` integration exactly
- **Dependencies**: Repository class already exists with full implementation
- **No breaking changes**: This is purely additive to existing service

## Dependencies

- ConversationAgentsRepository (already implemented)
- Existing MainProcessServices architecture
- Database and crypto utilities (already available)

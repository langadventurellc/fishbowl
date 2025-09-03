---
id: T-add-updateconversation-method
title: Add updateConversation method to ConversationService
status: done
priority: high
parent: F-service-layer-integration
prerequisites:
  - T-update-conversationsrepository-1
affectedFiles:
  packages/shared/src/services/conversations/ConversationService.ts:
    Added updateConversation method signature with comprehensive JSDoc
    documentation, supporting both title and chat_mode updates via
    UpdateConversationInput parameter
  packages/shared/src/services/conversations/__tests__/ConversationService.test.ts:
    Added comprehensive test coverage for updateConversation method including
    parameter validation, type safety checks, and interface compliance tests
  apps/desktop/src/renderer/services/ConversationIpcAdapter.ts:
    Implemented updateConversation method in IPC adapter with proper error
    handling and validation, following existing patterns for consistency
  apps/desktop/src/electron/__tests__/conversationsHandlers.test.ts:
    Added chat_mode field to mock conversation objects to maintain compatibility
    with updated Conversation type
  apps/desktop/src/electron/__tests__/preload.conversations.test.ts:
    Updated conversation mocks to include required chat_mode field for type
    compatibility
  apps/desktop/src/hooks/conversations/__tests__/useConversation.test.tsx: Fixed mock conversation object to include chat_mode field for type safety
  apps/desktop/src/hooks/conversations/__tests__/useCreateConversation.test.tsx:
    Added chat_mode field to mock conversation for compatibility with updated
    type definitions
  apps/desktop/src/hooks/conversations/__tests__/useUpdateConversation.test.tsx: Updated mock conversation to include required chat_mode field
  apps/desktop/src/shared/ipc/__tests__/conversationsIPC.test.ts:
    Fixed all conversation mock objects to include chat_mode field for type
    compliance across multiple test cases
log:
  - Successfully implemented updateConversation method in ConversationService
    interface and ConversationIpcAdapter. Added comprehensive tests for all
    update scenarios including chat_mode and title updates independently and
    combined. Fixed all desktop test files to include required chat_mode field.
    All quality checks pass with comprehensive test coverage.
schema: v1.0
childrenIds: []
created: 2025-09-03T19:51:01.771Z
updated: 2025-09-03T19:51:01.771Z
---

# Add updateConversation method to ConversationService

## Context

Add the `updateConversation(id, updates)` method to the `ConversationService` interface and its implementations to support chat_mode updates and other conversation field updates. This task implements the service layer changes needed for Service Layer Integration (F-service-layer-integration) in the Chat Modes System Epic (E-chat-modes-system).

This task depends on the repository layer updates being completed first to ensure the underlying data operations are available.

## Related Documentation

- Epic: E-chat-modes-system
- Feature: F-service-layer-integration
- Prerequisite: T-update-conversationsrepository-1 (ConversationsRepository CRUD updates)

## Technical Implementation

### Files to Modify

- `packages/shared/src/services/conversations/ConversationService.ts` - Interface definition
- `packages/shared/src/services/conversations/__tests__/ConversationService.test.ts` - Unit tests

### Service Interface Extension

Add the `updateConversation` method to the `ConversationService` interface:

```typescript
export interface ConversationService {
  // ... existing methods

  /**
   * Update conversation properties including chat_mode and title
   * @param id - Conversation UUID to update
   * @param updates - UpdateConversationInput with optional title and chat_mode fields
   * @returns Promise resolving to updated conversation with all fields
   */
  updateConversation(
    id: string,
    updates: UpdateConversationInput,
  ): Promise<Conversation>;
}
```

### Implementation Requirements

The `updateConversation` method must:

#### Input Validation

- Validate input using existing `updateConversationInputSchema` Zod schema
- Ensure conversation ID is a valid UUID format
- Validate updates parameter contains at least one field to update

#### Business Logic

- Support updating `chat_mode` field independently or with other fields
- Support updating `title` field independently or with other fields
- Support combined updates (both title and chat_mode in single operation)
- Maintain atomic update operations

#### Error Handling

- Throw descriptive errors for invalid chat_mode values
- Handle non-existent conversation IDs appropriately
- Propagate repository-layer errors with appropriate context
- Use consistent error types and messages

```typescript
// Example error handling approach
export class ConversationServiceError extends Error {
  constructor(
    message: string,
    public readonly operation: "create" | "update" | "delete",
    public readonly conversationId?: string,
  ) {
    super(message);
  }
}
```

#### Repository Integration

- Delegate to `ConversationsRepository.update()` method
- Pass validated input to repository layer
- Return updated conversation from repository

### Example Implementation Structure

```typescript
export class ConversationServiceImpl implements ConversationService {
  constructor(private repository: ConversationsRepository) {}

  async updateConversation(
    id: string,
    updates: UpdateConversationInput,
  ): Promise<Conversation> {
    // Input validation using existing schema
    const validatedUpdates = updateConversationInputSchema.parse(updates);

    try {
      // Delegate to repository layer
      return await this.repository.update(id, validatedUpdates);
    } catch (error) {
      throw new ConversationServiceError(
        `Failed to update conversation: ${error.message}`,
        "update",
        id,
      );
    }
  }

  // ... existing methods
}
```

## Acceptance Criteria

### Method Signature

- [ ] `updateConversation(id: string, updates: UpdateConversationInput): Promise<Conversation>` method added to ConversationService interface
- [ ] Method properly documented with JSDoc including parameter descriptions and return type
- [ ] Method signature follows existing service patterns and conventions

### Chat Mode Updates

- [ ] Can update chat_mode field independently (only chat_mode in updates)
- [ ] Can update chat_mode with other fields in single operation
- [ ] Supports all valid chat_mode values ('manual', 'round-robin')
- [ ] Updated conversation returned with correct chat_mode value

### Title Updates

- [ ] Can update title field independently (only title in updates)
- [ ] Can update title with chat_mode in single operation
- [ ] Title validation follows existing patterns
- [ ] Updated conversation returned with correct title value

### Validation

- [ ] Service validates input using existing `updateConversationInputSchema`
- [ ] Invalid chat_mode values rejected with descriptive errors
- [ ] Empty updates object handled appropriately
- [ ] Invalid conversation IDs result in appropriate error responses

### Error Handling

- [ ] Descriptive errors for invalid chat_mode values
- [ ] Appropriate errors for non-existent conversations
- [ ] Repository errors properly propagated with service-layer context
- [ ] Error types and messages are consistent with existing service patterns

### Transaction Safety

- [ ] Updates are atomic (all fields updated together or none)
- [ ] Concurrent modification handled appropriately
- [ ] Database consistency maintained across update operations

### Unit Testing

- [ ] Test cases for chat_mode-only updates
- [ ] Test cases for title-only updates
- [ ] Test cases for combined updates (title + chat_mode)
- [ ] Test cases for error scenarios (invalid inputs, non-existent conversations)
- [ ] Test cases for edge conditions and validation failures
- [ ] All tests follow existing service testing patterns

## Security Considerations

- **Input Validation**: Validate all inputs using existing Zod schemas before processing
- **Authorization**: Ensure users can only update their own conversations (if applicable to current architecture)
- **Data Integrity**: Validate conversation exists before attempting updates
- **SQL Injection Prevention**: Rely on repository layer parameterized queries

## Performance Requirements

- **Update Speed**: Conversation updates should complete within 100ms
- **Validation Performance**: Input validation should not add significant overhead
- **Memory Efficiency**: Minimal memory footprint for update operations

## Implementation Notes

### Existing Patterns to Follow

- Follow existing ConversationService method patterns
- Use existing error handling and validation approaches
- Maintain consistent logging and debugging patterns
- Follow existing transaction and concurrency patterns

### Dependencies Integration

- Use existing `UpdateConversationInput` type from shared types
- Use existing `updateConversationInputSchema` from shared schemas
- Integrate with updated `ConversationsRepository.update()` method
- Maintain compatibility with existing service implementations

### Error Handling Standards

- Use consistent error types across all service methods
- Provide specific error messages for different failure modes
- Include relevant context (conversation ID, operation type) in errors
- Follow existing error propagation patterns

## Testing Strategy

### Unit Tests Required

- Comprehensive testing of all update scenarios
- Input validation testing with invalid inputs
- Error condition testing (non-existent conversations, invalid data)
- Integration testing with repository layer
- Performance testing for update operations

### Integration Considerations

- Service method integrates properly with repository layer
- Error handling works correctly across service/repository boundary
- Input validation catches issues before reaching repository
- Updated conversations have correct field values

## Dependencies

- T-update-conversationsrepository-1: ConversationsRepository with chat_mode CRUD support
- UpdateConversationInput type with chat_mode field (from F-database-schema-and-core-types)
- updateConversationInputSchema validation (from F-database-schema-and-core-types)
- Conversation type with chat_mode field (from F-database-schema-and-core-types)

## Out of Scope

- IPC adapter implementation (handled in separate task)
- UI integration or client-side service usage
- Performance optimizations beyond maintaining current standards
- Additional service methods beyond updateConversation
- Complex business logic beyond basic field updates

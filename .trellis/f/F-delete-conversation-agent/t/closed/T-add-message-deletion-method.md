---
id: T-add-message-deletion-method
title: Add message deletion method to MessageRepository
status: done
priority: high
parent: F-delete-conversation-agent
prerequisites: []
affectedFiles:
  packages/shared/src/repositories/messages/MessageRepository.ts:
    Added deleteByConversationAgentId method with UUID validation, parameterized
    SQL DELETE query, error handling, and logging
  packages/shared/src/repositories/messages/__tests__/MessageRepository.test.ts:
    Added comprehensive unit test suite for deleteByConversationAgentId method
    and updated constructor test to include new method
log:
  - Successfully implemented deleteByConversationAgentId method in
    MessageRepository for bulk deletion of messages associated with a
    conversation agent. The method validates input using UUID v4 format,
    executes parameterized SQL DELETE query, returns count of deleted messages,
    and includes comprehensive error handling and logging. Added 11
    comprehensive unit tests covering success cases, validation, error handling,
    edge cases, and SQL injection prevention. All tests pass and code follows
    established repository patterns.
schema: v1.0
childrenIds: []
created: 2025-09-05T17:03:53.898Z
updated: 2025-09-05T17:03:53.898Z
---

# Add Message Deletion Method to MessageRepository

## Context

This task implements the backend capability to delete all messages associated with a conversation agent. This is required for the delete conversation agent feature where removing an agent must also remove all their messages from the database.

**Feature Reference**: F-delete-conversation-agent
**Related Files**: `packages/shared/src/repositories/messages/MessageRepository.ts`

## Detailed Implementation Requirements

### Primary Objective

Add a new `deleteByConversationAgentId(conversationAgentId: string)` method to the MessageRepository class that performs bulk deletion of messages associated with a specific conversation agent.

### Technical Approach

1. **Method Signature**:

   ```typescript
   async deleteByConversationAgentId(conversationAgentId: string): Promise<number>
   ```

2. **Implementation Steps**:
   - Validate the conversationAgentId parameter (UUID v4 format)
   - Execute SQL DELETE query with WHERE conversation_agent_id = ?
   - Return the count of deleted messages
   - Handle database errors appropriately
   - Log operation for debugging purposes

3. **SQL Query Pattern**:

   ```sql
   DELETE FROM messages WHERE conversation_agent_id = ?
   ```

4. **Error Handling**:
   - Wrap database errors in domain-specific error types
   - Log errors with appropriate context
   - Validate input parameter before query execution

### Detailed Acceptance Criteria

**Functional Requirements**:

- ✅ Method accepts conversationAgentId string parameter
- ✅ Validates conversationAgentId is valid UUID v4 format
- ✅ Deletes all messages where conversation_agent_id matches the parameter
- ✅ Returns number of messages deleted (integer)
- ✅ Handles case where no messages exist for the conversation agent (returns 0)
- ✅ Throws appropriate errors for invalid input or database failures

**Database Operations**:

- ✅ Uses parameterized query to prevent SQL injection
- ✅ Executes single DELETE statement for efficiency
- ✅ Maintains existing database transaction patterns
- ✅ Handles database constraint violations gracefully

**Error Handling**:

- ✅ Validates input parameter format before database operation
- ✅ Wraps database errors in MessageRepository error types
- ✅ Logs operations with appropriate logging level
- ✅ Returns meaningful error messages for troubleshooting

**Testing Requirements**:

- ✅ Unit test for successful deletion with valid conversationAgentId
- ✅ Unit test for deletion returning correct count
- ✅ Unit test for handling non-existent conversationAgentId (should return 0)
- ✅ Unit test for invalid conversationAgentId format (should throw validation error)
- ✅ Unit test for database error handling
- ✅ Unit test for SQL injection prevention (parameterized queries)

### Dependencies

- **Prerequisites**: None (foundational backend method)
- **Depends on**: Existing MessageRepository infrastructure, DatabaseBridge, logging utilities

### Implementation Notes

**Follow Existing Patterns**:

- Use the same error handling pattern as other MessageRepository methods
- Follow the existing logging approach with component context
- Use the established parameter validation patterns
- Maintain consistency with other bulk operation methods

**File Location**: `packages/shared/src/repositories/messages/MessageRepository.ts`

**Example Implementation Structure**:

```typescript
async deleteByConversationAgentId(conversationAgentId: string): Promise<number> {
  try {
    // 1. Validate input parameter
    // 2. Execute DELETE query with parameterized values
    // 3. Log operation results
    // 4. Return deleted count
  } catch (error) {
    // Handle and wrap errors appropriately
  }
}
```

### Security Considerations

- **Input Validation**: Verify conversationAgentId is valid UUID v4 format
- **SQL Injection Prevention**: Use parameterized queries exclusively
- **Authorization**: Method assumes caller has already verified permissions
- **Audit Logging**: Log deletion operations with appropriate detail level

### Out of Scope

- **UI Integration**: Will be handled by separate UI tasks
- **IPC Handlers**: Will be handled by IPC integration task
- **Service Layer Changes**: Will be handled by service integration task
- **End-to-end Testing**: Focus on unit tests for this repository method

## Success Metrics

- ✅ Method successfully deletes messages by conversation agent ID
- ✅ Returns accurate count of deleted messages
- ✅ Handles edge cases and errors gracefully
- ✅ Unit tests provide comprehensive coverage
- ✅ Follows established repository patterns and conventions

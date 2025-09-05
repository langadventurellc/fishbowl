---
id: T-update-ipc-handler-for
title: Update IPC handler for conversation agent deletion with message cleanup
status: done
priority: high
parent: F-delete-conversation-agent
prerequisites:
  - T-add-message-deletion-method
affectedFiles:
  apps/desktop/src/electron/conversationAgentHandlers.ts:
    Modified REMOVE handler
    to wrap deletion in database transaction, first calling
    MessageRepository.deleteByConversationAgentId() then
    ConversationAgentsRepository.delete(), with enhanced logging and error
    handling
  apps/desktop/src/electron/__tests__/conversationAgentHandlers.test.ts:
    Created comprehensive unit test suite with 14 test cases covering all IPC
    handlers, focusing on the updated REMOVE handler transaction behavior, error
    scenarios, and rollback cases
log:
  - "Updated IPC handler for conversation agent deletion to include atomic
    message cleanup using database transactions. The handler now performs a
    two-step deletion process: first deletes all messages associated with the
    conversation agent, then deletes the conversation agent itself. Added
    comprehensive unit test coverage with 14 test cases covering all success and
    failure scenarios including transaction rollbacks. All quality checks pass
    and tests run successfully."
schema: v1.0
childrenIds: []
created: 2025-09-05T17:04:21.903Z
updated: 2025-09-05T17:04:21.903Z
---

# Update IPC Handler for Conversation Agent Deletion with Message Cleanup

## Context

This task modifies the existing IPC handler for conversation agent removal to include deletion of all messages associated with the agent before removing the agent itself. This ensures complete cleanup when an agent is deleted from a conversation.

**Feature Reference**: F-delete-conversation-agent
**Prerequisites**: T-add-message-deletion-method (requires MessageRepository.deleteByConversationAgentId method)
**Related Files**: `apps/desktop/src/electron/conversationAgentHandlers.ts`

## Detailed Implementation Requirements

### Primary Objective

Modify the existing `remove` handler in conversationAgentHandlers.ts to perform a two-step deletion process: first delete all messages associated with the conversation agent, then delete the conversation agent itself.

### Current Implementation Analysis

The current `remove` handler likely accepts `{ conversation_id, agent_id }` and deletes the conversation agent directly. We need to enhance this to also delete messages.

### Technical Approach

1. **Enhanced Deletion Flow**:

   ```typescript
   async remove({ conversation_id, agent_id }) {
     // 1. Find conversation agent by conversation_id + agent_id
     // 2. Delete messages using conversation agent id
     // 3. Delete conversation agent
     // 4. Return success/failure
   }
   ```

2. **Implementation Steps**:
   - Import and inject MessageRepository into the handler
   - Find the ConversationAgent record to get the conversation_agent_id
   - Call MessageRepository.deleteByConversationAgentId() first
   - Then call existing ConversationAgentsRepository.delete()
   - Handle errors from both operations appropriately
   - Log the complete operation for debugging

3. **Error Handling**:
   - If message deletion fails, do not proceed with agent deletion
   - If agent deletion fails after successful message deletion, log the inconsistent state
   - Return appropriate error responses to the renderer process
   - Include detailed error information for troubleshooting

### Detailed Acceptance Criteria

**Functional Requirements**:

- ✅ Handler maintains existing IPC contract (accepts conversation_id and agent_id)
- ✅ Finds conversation agent record using conversation_id and agent_id
- ✅ Deletes all messages associated with the conversation agent ID first
- ✅ Deletes the conversation agent record second
- ✅ Returns success response when both operations complete successfully
- ✅ Returns appropriate error response if either operation fails

**Error Handling**:

- ✅ Prevents agent deletion if message deletion fails
- ✅ Logs detailed error information for both message and agent deletion failures
- ✅ Returns structured error responses with operation context
- ✅ Handles case where conversation agent is not found
- ✅ Handles database constraint violations gracefully

**Dependencies and Services**:

- ✅ Injects MessageRepository alongside existing ConversationAgentsRepository
- ✅ Maintains existing dependency injection pattern
- ✅ Uses existing logging infrastructure
- ✅ Follows established error response patterns

**Testing Requirements**:

- ✅ Unit test for successful two-step deletion (messages then agent)
- ✅ Unit test for message deletion failure (agent should not be deleted)
- ✅ Unit test for agent deletion failure after successful message deletion
- ✅ Unit test for conversation agent not found scenario
- ✅ Unit test for invalid input parameters
- ✅ Unit test verifying existing IPC contract maintained

### Implementation Notes

**Dependency Injection**:

- Add MessageRepository to the handler's constructor or dependency injection
- Maintain the existing ConversationAgentsRepository injection
- Follow the established service injection patterns

**Operation Order**:

- **Critical**: Messages must be deleted before the conversation agent
- This prevents foreign key constraint violations
- If message deletion fails, the conversation agent remains intact

**Logging Strategy**:

- Log the start of the two-step deletion process
- Log intermediate steps (message deletion count, agent deletion)
- Log completion or failure with appropriate context
- Use existing logging infrastructure and patterns

**File Location**: `apps/desktop/src/electron/conversationAgentHandlers.ts`

### Example Implementation Structure

```typescript
// Enhanced remove handler
async remove({ conversation_id, agent_id }) {
  try {
    // 1. Find conversation agent
    const conversationAgent = await this.conversationAgentsRepository.findByConversationAndAgent(
      conversation_id,
      agent_id
    );

    // 2. Delete messages first
    const deletedMessageCount = await this.messageRepository.deleteByConversationAgentId(
      conversationAgent.id
    );

    // 3. Delete conversation agent
    await this.conversationAgentsRepository.delete(conversationAgent.id);

    // 4. Log and return success
    this.logger.info('Agent and messages deleted', {
      conversationAgentId: conversationAgent.id,
      deletedMessages: deletedMessageCount
    });

    return { success: true, deletedMessages: deletedMessageCount };
  } catch (error) {
    // Handle and log errors appropriately
  }
}
```

### Security Considerations

- **Input Validation**: Validate conversation_id and agent_id parameters
- **Authorization**: Maintain existing permission checks (if any)
- **Database Integrity**: Ensure atomic operation handling
- **Error Information**: Avoid exposing sensitive database details in error responses

### Dependencies

- **Prerequisites**: T-add-message-deletion-method (MessageRepository.deleteByConversationAgentId)
- **Depends on**: Existing ConversationAgentsRepository, IPC infrastructure, logging utilities

### Out of Scope

- **UI Changes**: Will be handled by separate UI integration tasks
- **Service Layer Changes**: Will be handled by service integration task if needed
- **Database Schema Changes**: Using application-level deletion, not database CASCADE
- **Frontend Error Handling**: Will be handled by UI tasks

## Success Metrics

- ✅ IPC handler successfully deletes messages before deleting conversation agent
- ✅ Maintains existing IPC contract and response format
- ✅ Handles all error scenarios gracefully with appropriate logging
- ✅ Unit tests verify complete functionality and error handling
- ✅ Integration maintains compatibility with existing frontend calls

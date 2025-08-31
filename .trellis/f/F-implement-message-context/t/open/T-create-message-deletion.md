---
id: T-create-message-deletion
title: Create message deletion service and database operations
status: open
priority: high
parent: F-implement-message-context
prerequisites:
  - T-remove-regenerate-functionalit
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-31T19:27:15.485Z
updated: 2025-08-31T19:27:15.485Z
---

# Create Message Deletion Service and Database Operations

## Context

Create a message deletion service that handles removing messages from the database and provides proper error handling. This service will integrate with existing database services and follow the established patterns for database operations.

## Implementation Requirements

### 1. Extend Existing Message Database Service

**File**: Research and identify existing message database service, likely in `apps/desktop/src/main/services/` or similar

- Add `deleteMessage(messageId: string): Promise<void>` method to existing message service
- Use existing database connection and transaction patterns
- Ensure referential integrity when deleting messages
- Add proper SQL queries with parameter binding for security

### 2. Create Message Actions Service (Database Operations)

**File**: `packages/shared/src/services/messaging/MessageActionsService.ts` (extend from clipboard task)

- Add database bridge dependency injection alongside clipboard bridge
- Add `deleteMessage(messageId: string): Promise<void>` method
- Validate message ID format and existence before deletion
- Handle database transaction errors appropriately
- Provide meaningful error messages for different failure scenarios

### 3. Create Database Bridge Extension (if needed)

**File**: Extend existing `DatabaseBridge` interface if message deletion is not available

- Research existing message-related database operations
- Add message deletion methods if not present in current database abstraction
- Follow existing patterns for database operation interfaces

### 4. Create Confirmation Dialog Service

**File**: `packages/shared/src/services/ui/ConfirmationService.ts`

- Create interface for confirmation dialogs following bridge pattern
- Add `confirmDeletion(message: string): Promise<boolean>` method
- Support custom confirmation messages and button text
- Handle user cancellation vs confirmation appropriately

### 5. Update Database Error Handling

- Ensure proper error types are thrown for message deletion failures
- Handle foreign key constraints and referential integrity issues
- Provide user-friendly error messages for different database failure modes

## Technical Approach

1. **Database Integration**: Use existing database services and connection patterns
2. **Transaction Safety**: Wrap deletion operations in database transactions
3. **Validation**: Check message existence and ownership before deletion
4. **Error Classification**: Distinguish between validation errors, database errors, and system errors
5. **Referential Integrity**: Handle any message relationships (replies, references, etc.)

## Acceptance Criteria

- ✅ Message deletion method added to appropriate database service
- ✅ `MessageActionsService` extended with deletion functionality
- ✅ Message ID validation prevents invalid deletion attempts
- ✅ Database operations use proper transactions and error handling
- ✅ Confirmation service provides standard dialog interface
- ✅ All database operations include comprehensive unit tests
- ✅ Error scenarios provide meaningful user messages
- ✅ TypeScript compilation succeeds without errors
- ✅ Database integrity maintained after message deletion

## Testing Requirements

- Unit tests for message deletion database operations
- Unit tests for MessageActionsService deletion method with mocked database
- Unit tests for confirmation service with different dialog scenarios
- Unit tests for error scenarios (message not found, database errors, etc.)
- Unit tests for message ID validation with various input formats
- Integration tests for complete deletion workflow

## Dependencies

- Requires completion of regenerate removal task for clean interfaces
- Can run in parallel with clipboard service task

## Security Considerations

- **Authorization**: Ensure users can only delete messages they have permission to delete
- **SQL Injection**: Use parameterized queries for all database operations
- **Data Validation**: Validate message IDs to prevent malicious input
- **Audit Trail**: Consider logging message deletion operations for security auditing

## Performance Requirements

- Database deletion operations complete within 500ms
- Efficient SQL queries using proper indexes
- Minimize database lock time during deletion operations
- Handle bulk operations efficiently if needed in future

## Out of Scope

- Do not implement clipboard functionality in this task
- Do not modify UI components or event handlers
- Do not handle message relationship cascades beyond basic requirements

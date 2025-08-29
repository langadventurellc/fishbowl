---
id: T-create-messagerepository
title: Create MessageRepository integration tests with real database
status: open
priority: medium
parent: F-message-repository-integration
prerequisites:
  - T-validate-messagerepository
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T18:43:56.724Z
updated: 2025-08-29T18:43:56.724Z
---

# Create MessageRepository Integration Tests

## Context

While unit tests validate MessageRepository logic with mocked dependencies, integration tests are needed to verify actual database operations, transaction behavior, and real constraint enforcement. This ensures the repository works correctly with SQLite database operations.

## Implementation Requirements

### Integration Test Setup

Create new integration test file `packages/shared/src/repositories/messages/__tests__/MessageRepository.integration.test.ts`:

1. **Test Database Setup**
   - Use in-memory SQLite database for fast, isolated tests
   - Run actual database migrations to create proper schema
   - Set up real DatabaseBridge instance for authentic database operations
   - Clean database between tests for isolation

2. **Real Database Operations Testing**
   - Test actual SQL query execution with real database
   - Verify foreign key constraint enforcement works as expected
   - Test transaction rollback behavior on constraint violations
   - Validate actual database performance under typical load

### Comprehensive Integration Scenarios

1. **CRUD Operations with Real Database**
   - Create messages and verify database storage
   - Retrieve messages with proper ordering from actual database
   - Update inclusion flags with real SQL operations
   - Delete operations (if supported) with cascade effects

2. **Foreign Key Constraint Testing**
   - Test creation with non-existent conversation_id (should fail)
   - Test creation with invalid conversation_agent_id (should fail)
   - Verify constraint error messages match expected database responses
   - Test CASCADE delete behavior when conversation is removed

3. **Concurrent Access Testing**
   - Multiple simultaneous message creation operations
   - Concurrent read/write operations to same conversation
   - Database lock handling under concurrent access
   - Transaction isolation verification

4. **Data Integrity Validation**
   - Verify message ordering persists correctly in database
   - Test message content storage and retrieval accuracy
   - Validate timestamp handling with real database
   - Check boolean field storage (included flag) accuracy

## Detailed Acceptance Criteria

**GIVEN** real SQLite database with proper schema
**WHEN** MessageRepository operations are executed
**THEN** all database operations should succeed with actual data persistence

**GIVEN** message creation with valid conversation_id
**WHEN** create() is called with real database
**THEN** message should be stored and retrievable with correct field values

**GIVEN** foreign key constraint violation scenario
**WHEN** attempting to create message with non-existent conversation
**THEN** database should reject operation with proper SQLite constraint error

**GIVEN** multiple concurrent message operations
**WHEN** executed against real database simultaneously
**THEN** all valid operations should complete without data corruption

**GIVEN** conversation with multiple messages in database
**WHEN** getByConversation() retrieves from real database
**THEN** messages should be returned in stable chronological order

## Testing Requirements

- Set up real SQLite database for each test suite
- Use actual database migrations to ensure schema accuracy
- Test with realistic message data and content sizes
- Verify actual SQL query performance with real database
- Include cleanup and teardown for test isolation
- Test both success and failure scenarios with real database responses

## Technical Implementation

```typescript
// Integration test structure
describe("MessageRepository Integration", () => {
  let repository: MessageRepository;
  let databaseBridge: DatabaseBridge;
  let database: Database; // Real SQLite instance

  beforeEach(async () => {
    // Set up in-memory database
    // Run migrations
    // Initialize real dependencies
  });

  afterEach(async () => {
    // Clean up database
  });

  describe("Database Operations", () => {
    // Test actual database CRUD operations
  });

  describe("Foreign Key Constraints", () => {
    // Test real constraint enforcement
  });

  describe("Concurrent Access", () => {
    // Test real concurrent database access
  });
});
```

## Out of Scope

- Performance benchmarking (explicitly excluded)
- Database optimization testing
- Migration testing (covered by separate migration tasks)
- End-to-end UI testing (covered by other features)

## Dependencies

- Requires T-validate-messagerepository for enhanced error handling
- Uses existing database migration infrastructure
- Requires real DatabaseBridge implementation
- Builds on existing SQLite database setup patterns

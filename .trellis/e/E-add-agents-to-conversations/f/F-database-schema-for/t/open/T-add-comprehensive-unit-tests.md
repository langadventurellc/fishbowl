---
id: T-add-comprehensive-unit-tests
title: Add comprehensive unit tests for migration and repository
status: open
priority: medium
parent: F-database-schema-for
prerequisites:
  - T-implement-conversationagentsre
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T03:08:06.800Z
updated: 2025-08-25T03:08:06.800Z
---

# Add Comprehensive Unit Tests for Migration and Repository

## Context

Create a complete test suite for the ConversationAgentsRepository and validate the database migration functionality. This ensures the database schema and repository operations work correctly under all conditions, including edge cases and error scenarios.

**Related Issues:**

- Parent Feature: F-database-schema-for
- Parent Epic: E-add-agents-to-conversations
- Prerequisite: T-implement-conversationagentsre (repository implementation)

## Testing Strategy

### Test Structure Overview

```
packages/shared/src/repositories/conversationAgents/__tests__/
├── ConversationAgentsRepository.test.ts     # Main repository tests
├── exports.test.ts                          # Barrel export validation
└── integration/
    └── migration.test.ts                    # Migration validation tests
```

### Migration Testing

Create integration tests to validate the database migration:

```typescript
// packages/shared/src/repositories/conversationAgents/__tests__/integration/migration.test.ts

describe("ConversationAgents Migration", () => {
  let testDb: Database;

  beforeEach(async () => {
    // Setup in-memory SQLite database
    testDb = new Database(":memory:");
    // Run conversations table migration first (dependency)
    await runMigration(testDb, "001_create_conversations.sql");
  });

  describe("Migration 002 - conversation_agents table", () => {
    it("should create conversation_agents table with correct schema", async () => {
      await runMigration(testDb, "002_create_conversation_agents.sql");

      // Verify table exists
      const tables = await testDb
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='conversation_agents'",
        )
        .all();
      expect(tables).toHaveLength(1);

      // Verify column structure
      const tableInfo = await testDb
        .prepare("PRAGMA table_info(conversation_agents)")
        .all();
      expect(tableInfo).toMatchExpectedSchema();
    });

    it("should create required indexes", async () => {
      await runMigration(testDb, "002_create_conversation_agents.sql");

      // Verify indexes exist
      const indexes = await testDb
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='conversation_agents'",
        )
        .all();
      expect(indexes.map((i) => i.name)).toContain(
        "idx_conversation_agents_conversation",
      );
      expect(indexes.map((i) => i.name)).toContain(
        "idx_conversation_agents_agent",
      );
    });

    it("should enforce foreign key constraint with CASCADE DELETE", async () => {
      await runMigration(testDb, "002_create_conversation_agents.sql");

      // Create test conversation
      const conversationId = "test-conversation-id";
      await testDb
        .prepare("INSERT INTO conversations (id, title) VALUES (?, ?)")
        .run(conversationId, "Test");

      // Create conversation agent association
      await testDb
        .prepare(
          `
        INSERT INTO conversation_agents (id, conversation_id, agent_id) 
        VALUES (?, ?, ?)
      `,
        )
        .run("test-assoc-id", conversationId, "test-agent-id");

      // Delete conversation - should cascade delete
      await testDb
        .prepare("DELETE FROM conversations WHERE id = ?")
        .run(conversationId);

      // Verify cascade delete worked
      const remainingAssociations = await testDb
        .prepare("SELECT * FROM conversation_agents")
        .all();
      expect(remainingAssociations).toHaveLength(0);
    });

    it("should enforce unique constraint on conversation_id and agent_id pair", async () => {
      await runMigration(testDb, "002_create_conversation_agents.sql");

      // Create test conversation
      const conversationId = "test-conversation-id";
      await testDb
        .prepare("INSERT INTO conversations (id, title) VALUES (?, ?)")
        .run(conversationId, "Test");

      // Create first association
      await testDb
        .prepare(
          `
        INSERT INTO conversation_agents (id, conversation_id, agent_id) 
        VALUES (?, ?, ?)
      `,
        )
        .run("test-assoc-1", conversationId, "test-agent-id");

      // Attempt duplicate association - should fail
      await expect(
        testDb
          .prepare(
            `
          INSERT INTO conversation_agents (id, conversation_id, agent_id) 
          VALUES (?, ?, ?)
        `,
          )
          .run("test-assoc-2", conversationId, "test-agent-id"),
      ).rejects.toThrow(/UNIQUE constraint failed/);
    });
  });
});
```

## Repository Unit Tests

### Test Categories

Create comprehensive test coverage following ConversationsRepository test patterns:

**Core CRUD Operations:**

```typescript
describe("ConversationAgentsRepository", () => {
  let repository: ConversationAgentsRepository;
  let mockDatabaseBridge: jest.Mocked<DatabaseBridge>;
  let mockCryptoUtils: jest.Mocked<CryptoUtilsInterface>;

  beforeEach(() => {
    mockDatabaseBridge = createMockDatabaseBridge();
    mockCryptoUtils = createMockCryptoUtils();
    repository = new ConversationAgentsRepository(
      mockDatabaseBridge,
      mockCryptoUtils,
    );
  });

  describe("create", () => {
    it("should create conversation agent with generated ID and timestamp", async () => {
      const input: CreateConversationAgentInput = {
        conversationId: "conv-123",
        agentId: "agent-456",
        displayOrder: 0,
      };

      mockCryptoUtils.generateId.mockReturnValue("generated-id");
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        lastInsertRowid: 1,
      });
      mockDatabaseBridge.query.mockResolvedValue([mockConversationAgentRow]);

      const result = await repository.create(input);

      expect(result).toEqual(expectedConversationAgent);
      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expectedSQL,
        expectedParams,
      );
    });

    it("should throw validation error for invalid input", async () => {
      const invalidInput = { conversationId: "invalid", agentId: "" };

      await expect(repository.create(invalidInput)).rejects.toThrow(
        ConversationAgentValidationError,
      );
    });

    it("should handle database constraint violations", async () => {
      const input = createValidInput();
      mockDatabaseBridge.execute.mockRejectedValue(
        new Error("UNIQUE constraint failed"),
      );

      await expect(repository.create(input)).rejects.toThrow(
        "UNIQUE constraint failed",
      );
    });
  });

  describe("findByConversationId", () => {
    it("should return agents ordered by display_order and added_at", async () => {
      const conversationId = "conv-123";
      mockDatabaseBridge.query.mockResolvedValue(mockAgentRows);

      const result = await repository.findByConversationId(conversationId);

      expect(result).toEqual(expectedAgents);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        "SELECT * FROM conversation_agents WHERE conversation_id = ? ORDER BY display_order ASC, added_at ASC",
        [conversationId],
      );
    });

    it("should return empty array when no agents found", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      const result = await repository.findByConversationId("nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("existsAssociation", () => {
    it("should return true when association exists", async () => {
      mockDatabaseBridge.query.mockResolvedValue([{ "1": 1 }]);

      const result = await repository.existsAssociation(
        "conv-123",
        "agent-456",
      );

      expect(result).toBe(true);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        "SELECT 1 FROM conversation_agents WHERE conversation_id = ? AND agent_id = ? LIMIT 1",
        ["conv-123", "agent-456"],
      );
    });

    it("should return false when association does not exist", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      const result = await repository.existsAssociation(
        "conv-123",
        "agent-456",
      );

      expect(result).toBe(false);
    });
  });
});
```

### Error Handling Tests

```typescript
describe("error handling", () => {
  it("should handle database connection errors", async () => {
    mockDatabaseBridge.query.mockRejectedValue(
      new Error("Database connection failed"),
    );

    await expect(repository.get("test-id")).rejects.toThrow(
      "Database connection failed",
    );
  });

  it("should log errors with appropriate context", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockDatabaseBridge.execute.mockRejectedValue(new Error("Test error"));

    await expect(repository.create(validInput)).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Database error during create"),
      expect.any(Error),
    );
  });
});
```

### Transaction Tests

```typescript
describe("transaction operations", () => {
  it("should use transactions for bulk operations", async () => {
    const inputs = [createValidInput(), createValidInput()];

    mockDatabaseBridge.transaction.mockImplementation(async (callback) => {
      return await callback(mockDatabaseBridge);
    });

    await repository.bulkCreate(inputs);

    expect(mockDatabaseBridge.transaction).toHaveBeenCalled();
  });

  it("should rollback transaction on error", async () => {
    mockDatabaseBridge.transaction.mockRejectedValue(
      new Error("Transaction failed"),
    );

    await expect(repository.bulkCreate([validInput])).rejects.toThrow(
      "Transaction failed",
    );
  });
});
```

## Test Data Management

### Mock Data Factory

```typescript
// __tests__/testHelpers/mockData.ts
export const createMockConversationAgent = (
  overrides?: Partial<ConversationAgent>,
): ConversationAgent => ({
  id: "mock-id",
  conversationId: "mock-conversation-id",
  agentId: "mock-agent-id",
  addedAt: "2025-01-01T00:00:00.000Z",
  isActive: true,
  displayOrder: 0,
  ...overrides,
});

export const createMockDatabaseRow = (overrides?: Record<string, any>) => ({
  id: "mock-id",
  conversation_id: "mock-conversation-id",
  agent_id: "mock-agent-id",
  added_at: "2025-01-01T00:00:00.000Z",
  is_active: 1,
  display_order: 0,
  ...overrides,
});
```

### Database Bridge Mock

```typescript
const createMockDatabaseBridge = (): jest.Mocked<DatabaseBridge> => ({
  execute: jest.fn(),
  query: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn(),
});
```

## Acceptance Criteria

### Test Coverage Requirements

- [ ] 100% line coverage for ConversationAgentsRepository class
- [ ] All public methods tested with success and failure scenarios
- [ ] Edge cases covered (empty results, invalid inputs, database errors)
- [ ] Database constraint violations properly tested
- [ ] Transaction rollback scenarios verified

### Migration Test Requirements

- [ ] Migration creates table with correct schema
- [ ] All indexes created properly
- [ ] Foreign key constraints work with CASCADE DELETE
- [ ] Unique constraint prevents duplicate associations
- [ ] Migration is idempotent (can run multiple times)

### Error Handling Test Requirements

- [ ] Database connection failures handled gracefully
- [ ] Constraint violation errors properly caught and re-thrown
- [ ] Validation errors use appropriate custom error types
- [ ] Logging integration verified in error scenarios
- [ ] Transaction errors trigger proper rollback

### Integration Test Requirements

- [ ] Repository works with actual SQLite database (in-memory)
- [ ] Migration integration tested with real database operations
- [ ] Foreign key relationships validated end-to-end
- [ ] Performance characteristics verified for bulk operations

### Code Quality Requirements

- [ ] Tests follow existing patterns from ConversationsRepository tests
- [ ] Mock strategy consistent with existing test patterns
- [ ] Test descriptions clear and specific
- [ ] Setup and teardown properly implemented
- [ ] No test pollution between test cases

## Testing Tools and Setup

### Required Dependencies

- Jest for test framework
- SQLite3 for integration testing
- Existing mock utilities from conversations tests
- Custom matchers for schema validation

### Test Configuration

```typescript
// jest.config.js additions for integration tests
{
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/integration/*.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts']
}
```

## Files to Create

- `packages/shared/src/repositories/conversationAgents/__tests__/ConversationAgentsRepository.test.ts`
- `packages/shared/src/repositories/conversationAgents/__tests__/exports.test.ts`
- `packages/shared/src/repositories/conversationAgents/__tests__/integration/migration.test.ts`
- `packages/shared/src/repositories/conversationAgents/__tests__/testHelpers/mockData.ts`
- `packages/shared/src/repositories/conversationAgents/__tests__/testHelpers/databaseHelpers.ts`

## Dependencies

- **Prerequisite**: T-implement-conversationagentsre (repository implementation)
- **Testing**: Jest, SQLite3, existing test utilities
- **Patterns**: Follow ConversationsRepository test structure
- **Database**: In-memory SQLite for integration testing

## Reference Materials

- **Test Pattern**: `packages/shared/src/repositories/conversations/__tests__/ConversationsRepository.test.ts`
- **Migration Testing**: Similar patterns from existing migration tests
- **Mock Strategies**: Existing DatabaseBridge mocking patterns
- **Integration Testing**: In-memory SQLite testing approaches

---
id: T-implement-messagerepository
title: Implement MessageRepository with core database operations
status: open
priority: high
parent: F-chat-system-data-foundation
prerequisites:
  - T-implement-message-typescript
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T03:48:43.507Z
updated: 2025-08-28T03:48:43.507Z
---

# Implement MessageRepository with Core Database Operations

## Overview

Create the MessageRepository class following established patterns from ConversationsRepository, providing a minimal API for message persistence and retrieval with proper database abstraction, error handling, and type safety.

## Context

- **Feature**: F-chat-system-data-foundation - Chat System Data Foundation
- **Prerequisites**: Message types and schemas (`T-implement-message-typescript`) must be completed
- **Pattern Reference**: Use `ConversationsRepository` as the implementation template
- **Database Integration**: Use existing DatabaseBridge abstraction for platform independence
- **Error Handling**: Follow established error patterns from existing repositories

## Technical Requirements

### 1. Repository Class Structure

Create `MessageRepository` class in `packages/shared/src/repositories/messages/MessageRepository.ts`:

```typescript
export class MessageRepository {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "MessageRepository" } },
  });
  constructor(
    private readonly databaseBridge: DatabaseBridge,
    private readonly cryptoUtils: CryptoUtilsInterface,
  ) {}

  // Core methods implementation (align with ConversationsRepository naming)
  async create(input: CreateMessageInput): Promise<Message> {}
  async get(id: string): Promise<Message> {} // throws MessageNotFoundError if not found
  async getByConversation(conversationId: string): Promise<Message[]> {}
  async updateInclusion(id: string, included: boolean): Promise<Message> {} // returns updated message
}
```

### 2. Core Database Operations

#### Create Message Method

- **Signature**: `async create(input: CreateMessageInput): Promise<Message>`
- **Validation**: Use Zod schema to validate input before database operation
- **ID Generation**: Generate UUID using existing crypto utilities
- **Timestamp**: Default `created_at` to current timestamp if not provided
- **Error Handling**: Convert database errors to repository-specific errors
- **Return**: Complete Message object with generated ID and timestamp

#### Get Message by ID Method

- **Signature**: `async get(id: string): Promise<Message>`
- **Validation**: Validate ID parameter as proper UUID format
- **Query**: Single message retrieval by primary key
- **Return**: Message object if found
- **Error Handling**: Throw `MessageNotFoundError` if not found; convert database errors appropriately

#### Get Messages by Conversation Method

- **Signature**: `async getByConversation(conversationId: string): Promise<Message[]>`
- **Validation**: Validate conversation ID as proper UUID (throw validation error on invalid ID)
- **Query**: Retrieve all messages for conversation ordered by `created_at` ASC
- **Performance**: Leverage the `idx_messages_conversation` composite index
- **Return**: Array of Message objects in chronological order
- **Error Handling**: Empty array is acceptable for conversations with no messages

#### Update Message Inclusion Method

- **Signature**: `async updateInclusion(id: string, included: boolean): Promise<Message>`
- **Validation**: Validate ID as UUID and included as boolean
- **Operation**: Update only the `included` field for the specified message
- **Error Handling**: Throw `MessageNotFoundError` if message ID does not exist
- **Return**: The updated Message for consistency with ConversationsRepository update pattern

### 3. Database Query Implementation

#### SQL Query Patterns

Follow existing repository patterns for parameterized queries:

```typescript
// Create message SQL
const createMessageSql = `
  INSERT INTO messages (id, conversation_id, conversation_agent_id, role, content, included, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// Get message by ID SQL
const getMessageSql = `
  SELECT id, conversation_id, conversation_agent_id, role, content, included, created_at
  FROM messages
  WHERE id = ?;
`;

// Get messages by conversation SQL (uses index)
const getMessagesByConversationSql = `
  SELECT id, conversation_id, conversation_agent_id, role, content, included, created_at
  FROM messages
  WHERE conversation_id = ?
  ORDER BY created_at ASC;
`;

// Update inclusion SQL
const updateInclusionSql = `
  UPDATE messages
  SET included = ?
  WHERE id = ?;
`;
```

## Implementation Steps

### Step 1: Set Up Repository Structure

1. Create `packages/shared/src/repositories/messages/` directory
2. Create `MessageRepository.ts` with class skeleton (use createLoggerSync and ConversationsRepository-style constructor)
3. Set up constructor with proper dependency injection
4. Add logger initialization following existing patterns

### Step 2: Implement Core Database Operations

1. Implement `create()` with input validation and UUID generation; return constructed/validated Message
2. Add `get()` for single message retrieval; throw `MessageNotFoundError` if not found
3. Create `getByConversation()` with proper ordering
4. Implement `updateInclusion()` for inclusion toggles; return updated Message

### Step 3: Add Error Handling and Logging

1. Implement `handleDatabaseError()` helper method following ConversationsRepository pattern (wrap `DatabaseError` as `MessageValidationError`)
2. Add appropriate logging for all database operations
3. Convert database errors to meaningful repository errors
4. Add timestamp utility method if needed

### Step 4: Create Repository Exports

1. Create `packages/shared/src/repositories/messages/index.ts` barrel export
2. Update `packages/shared/src/repositories/index.ts` to include MessageRepository
3. Optionally define `MessageRepositoryInterface` only if DI/testing benefits arise
4. Ensure clean import paths for service integration

### Step 5: Write Comprehensive Unit Tests

1. Create test file `packages/shared/src/repositories/messages/__tests__/MessageRepository.test.ts`
2. Test all repository methods with valid and invalid inputs (use valid UUIDs)
3. Mock DatabaseBridge for isolated unit testing
4. Test error handling scenarios and edge cases

## File Organization

```
packages/shared/src/repositories/messages/
├── MessageRepository.ts               # Main repository implementation
├── index.ts                          # Barrel exports
└── __tests__/
    └── MessageRepository.test.ts     # Comprehensive unit tests
```

## Testing Requirements

### Unit Test Coverage

Create comprehensive tests covering:

#### Repository Method Tests

```typescript
describe("MessageRepository", () => {
  describe("createMessage", () => {
    it("should create message with generated ID and timestamp", async () => {
      const input: CreateMessageInput = {
        conversation_id: "conv-uuid",
        conversation_agent_id: "agent-uuid",
        role: "user",
        content: "Test message",
      };

      const result = await repository.createMessage(input);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.included).toBe(true); // Default value
    });

    it("should validate input using Zod schema", async () => {
      const invalidInput = { role: "invalid" };
      await expect(repository.createMessage(invalidInput)).rejects.toThrow();
    });
  });

  describe("getByConversation", () => {
    it("should return messages ordered by created_at", async () => {
      const messages = await repository.getByConversation(
        "22222222-2222-2222-2222-222222222222",
      );
      // Verify chronological ordering
      for (let i = 1; i < messages.length; i++) {
        expect(messages[i - 1].created_at <= messages[i].created_at).toBe(true);
      }
    });

    it("should return empty array for non-existent conversation", async () => {
      const messages = await repository.getByConversation(
        "33333333-3333-3333-3333-333333333333",
      );
      expect(messages).toEqual([]);
    });
  });
});
```

#### Error Handling Tests

```typescript
describe("error handling", () => {
  it("should handle database connection failures", async () => {
    mockDatabaseBridge.query.mockRejectedValue(new Error("Connection failed"));
    await expect(
      repository.get("11111111-1111-1111-1111-111111111111"),
    ).rejects.toThrow();
  });

  it("should convert database errors to repository errors", async () => {
    // Test error conversion logic
  });
});
```

## Integration Requirements

### Service Integration Pattern

Repository should integrate with existing service patterns:

```typescript
// Platform service integration example
export class MainProcessServices {
  readonly messageRepository: MessageRepository;

  constructor() {
    const databaseBridge = new NodeDatabaseBridge(/* ... */);
    const cryptoUtils = new NodeCryptoUtils();
    this.messageRepository = new MessageRepository(databaseBridge, cryptoUtils);
  }
}
```

### Database Bridge Usage

- **Query Method**: Use `databaseBridge.query(sql, params)` for SELECTs and `databaseBridge.execute(sql, params)` for INSERT/UPDATE/DELETE
- **Error Handling**: Catch and convert database-specific errors
- **Transaction Support**: Use existing transaction patterns if needed
- **Platform Independence**: No direct SQLite or database-specific imports

## Acceptance Criteria

### Repository Implementation

- ✅ MessageRepository class created following ConversationsRepository patterns
- ✅ Constructor uses dependency injection for DatabaseBridge and CryptoUtils
- ✅ All four core methods implemented: create, get, getByConversation, updateInclusion
- ✅ UUID generation and timestamp handling work correctly
- ✅ Proper logging added for all database operations

### Database Operations

- ✅ create() validates input and returns complete Message object
- ✅ get() returns single message by ID or throws MessageNotFoundError
- ✅ getByConversation() returns messages ordered chronologically
- ✅ updateInclusion() updates only the included field and returns the updated message
- ✅ All SQL queries use parameterized statements for security

### Error Handling and Validation

- ✅ Input validation uses existing Zod schemas before database operations
- ✅ Database errors converted to meaningful repository-specific errors
- ✅ UUID validation for all ID parameters
- ✅ Proper error messages and logging for debugging
- ✅ Graceful handling of non-existent records

### Integration and Testing

- ✅ Repository exports correctly set up with barrel pattern
- ✅ Unit tests provide comprehensive coverage of all methods
- ✅ Tests mock DatabaseBridge for isolated testing
- ✅ Error scenarios and edge cases covered in tests
- ✅ Code passes linting, formatting, and type checking

## Security Considerations

- **SQL Injection Prevention**: All queries use parameterized statements
- **Input Validation**: Zod schema validation prevents malformed data
- **Foreign Key Integrity**: Rely on database constraints for referential integrity
- **Error Information**: Don't expose internal database details in error messages

## Dependencies

- **Message Types**: T-implement-message-typescript (TypeScript types and schemas)
- **Database Bridge**: Existing DatabaseBridge abstraction
- **Crypto Utils**: Existing CryptoUtilsInterface for UUID generation
- **Logger**: Existing logging infrastructure
- **Database Migration**: Messages table must exist (T-create-messages-table)

## Out of Scope

- No service layer or business logic implementation
- No state management (Zustand stores) integration
- No UI components or React hooks
- No API endpoint implementation
- No real-time messaging or WebSocket connections
- No message content editing or deletion operations
- No complex query operations beyond basic CRUD

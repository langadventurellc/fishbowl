---
id: T-implement-create-and-get
title: Implement create and get methods
status: open
priority: high
parent: F-repository-implementation
prerequisites:
  - T-implement-repository
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T06:31:46.622Z
updated: 2025-08-23T06:31:46.622Z
---

# Implement Create and Get Methods

## Context

Implement the core create and get methods for the ConversationsRepository. These are the most fundamental operations for conversation management.

## Implementation Requirements

### 1. Implement Create Method

In `ConversationsRepository.ts`, replace the placeholder with:

```typescript
async create(input: CreateConversationInput): Promise<Conversation> {
  try {
    // Validate input
    const validatedInput = createConversationInputSchema.parse(input);

    // Generate conversation data
    const id = this.cryptoUtils.generateId();
    const title = validatedInput.title || "New Conversation";
    const timestamp = this.getCurrentTimestamp();

    // Create conversation object
    const conversation: Conversation = {
      id,
      title,
      created_at: timestamp,
      updated_at: timestamp
    };

    // Validate complete conversation
    const validatedConversation = conversationSchema.parse(conversation);

    // Insert into database
    const sql = `
      INSERT INTO conversations (id, title, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `;

    await this.databaseBridge.execute(sql, [
      validatedConversation.id,
      validatedConversation.title,
      validatedConversation.created_at,
      validatedConversation.updated_at
    ]);

    this.logger.info("Created conversation", { id: validatedConversation.id });

    return validatedConversation;
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as any;
      throw new ConversationValidationError(
        zodError.errors.map((e: any) => ({
          field: e.path.join("."),
          message: e.message
        }))
      );
    }

    this.handleDatabaseError(error, "create");
  }
}
```

### 2. Implement Get Method

```typescript
async get(id: string): Promise<Conversation> {
  try {
    // Validate ID format
    const idValidation = conversationSchema.shape.id.safeParse(id);
    if (!idValidation.success) {
      throw new ConversationNotFoundError(id);
    }

    // Query database
    const sql = `
      SELECT id, title, created_at, updated_at
      FROM conversations
      WHERE id = ?
    `;

    const rows = await this.databaseBridge.query<Conversation>(sql, [id]);

    if (rows.length === 0) {
      throw new ConversationNotFoundError(id);
    }

    // Validate and return
    const conversation = conversationSchema.parse(rows[0]);

    this.logger.debug("Retrieved conversation", { id: conversation.id });

    return conversation;
  } catch (error) {
    if (error instanceof ConversationNotFoundError) {
      throw error;
    }

    this.handleDatabaseError(error, "get");
  }
}
```

### 3. Implement Exists Helper Method

```typescript
async exists(id: string): Promise<boolean> {
  try {
    // Validate ID format
    const idValidation = conversationSchema.shape.id.safeParse(id);
    if (!idValidation.success) {
      return false;
    }

    const sql = `
      SELECT 1
      FROM conversations
      WHERE id = ?
      LIMIT 1
    `;

    const rows = await this.databaseBridge.query<{ 1: number }>(sql, [id]);

    return rows.length > 0;
  } catch (error) {
    this.logger.error("Error checking conversation existence", { id, error });
    return false;
  }
}
```

## Technical Approach

1. Validate inputs using Zod schemas
2. Generate UUID using cryptoUtils
3. Use parameterized SQL queries
4. Handle errors appropriately
5. Log operations for debugging
6. Return validated conversation objects

## Acceptance Criteria

### Create Method

- ✓ Validates input with schema
- ✓ Generates UUID v4 for ID
- ✓ Defaults title to "New Conversation"
- ✓ Sets created_at and updated_at to same timestamp
- ✓ Inserts into database
- ✓ Returns validated conversation
- ✓ Handles validation errors
- ✓ Logs operation

### Get Method

- ✓ Validates ID format
- ✓ Queries database
- ✓ Throws ConversationNotFoundError if not found
- ✓ Returns validated conversation
- ✓ Handles database errors
- ✓ Logs operation

### Exists Method

- ✓ Validates ID format
- ✓ Returns boolean existence
- ✓ Returns false for invalid IDs
- ✓ Handles errors gracefully

## Testing Requirements

Add tests to `ConversationsRepository.test.ts`:

```typescript
describe("create", () => {
  it("should create conversation with provided title");
  it("should create conversation with default title");
  it("should generate UUID for ID");
  it("should set timestamps");
  it("should validate input");
  it("should handle database errors");
});

describe("get", () => {
  it("should retrieve existing conversation");
  it("should throw ConversationNotFoundError for missing");
  it("should validate ID format");
  it("should handle database errors");
});

describe("exists", () => {
  it("should return true for existing conversation");
  it("should return false for non-existing");
  it("should return false for invalid ID");
});
```

## Security Considerations

- Use parameterized queries
- Validate all inputs
- Don't expose SQL in errors
- Sanitize logged data

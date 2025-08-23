---
id: T-implement-list-update-and
title: Implement list, update, and delete methods
status: done
priority: high
parent: F-repository-implementation
prerequisites:
  - T-implement-create-and-get
affectedFiles:
  packages/shared/src/repositories/conversations/ConversationsRepository.ts:
    Added import for updateConversationInputSchema and implemented list(),
    update(), and delete() methods with proper SQL queries, input validation,
    existence checks, error handling, and logging
  packages/shared/src/repositories/conversations/__tests__/ConversationsRepository.test.ts:
    Added comprehensive test suites for list, update, and delete methods
    including happy paths, error scenarios, validation testing, and database
    error handling with proper mocking
log:
  - Implemented list, update, and delete methods for ConversationsRepository
    with comprehensive validation, error handling, and security measures. All
    methods use parameterized queries, validate inputs with Zod schemas, check
    existence before operations, and include proper error handling. Added
    complete test coverage with 15+ test cases covering happy paths, validation
    failures, database errors, and edge cases. All quality checks pass including
    linting, formatting, type checking, and unit tests (1588 tests passed).
schema: v1.0
childrenIds: []
created: 2025-08-23T06:32:18.556Z
updated: 2025-08-23T06:32:18.556Z
---

# Implement List, Update, and Delete Methods

## Context

Complete the ConversationsRepository implementation by adding the remaining CRUD methods: list, update, and delete.

## Implementation Requirements

### 1. Implement List Method

In `ConversationsRepository.ts`, replace the placeholder with:

```typescript
async list(): Promise<Conversation[]> {
  try {
    const sql = `
      SELECT id, title, created_at, updated_at
      FROM conversations
      ORDER BY created_at DESC
    `;

    const rows = await this.databaseBridge.query<Conversation>(sql);

    // Validate each conversation
    const conversations = rows.map(row => conversationSchema.parse(row));

    this.logger.debug(`Listed ${conversations.length} conversations`);

    return conversations;
  } catch (error) {
    this.handleDatabaseError(error, "list");
  }
}
```

### 2. Implement Update Method

```typescript
async update(id: string, input: UpdateConversationInput): Promise<Conversation> {
  try {
    // Validate input
    const validatedInput = updateConversationInputSchema.parse(input);

    // Check if conversation exists
    const exists = await this.exists(id);
    if (!exists) {
      throw new ConversationNotFoundError(id);
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: unknown[] = [];

    if (validatedInput.title !== undefined) {
      updates.push("title = ?");
      params.push(validatedInput.title);
    }

    // Always update timestamp
    updates.push("updated_at = ?");
    params.push(this.getCurrentTimestamp());

    // Add ID for WHERE clause
    params.push(id);

    const sql = `
      UPDATE conversations
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    await this.databaseBridge.execute(sql, params);

    // Return updated conversation
    const updated = await this.get(id);

    this.logger.info("Updated conversation", { id });

    return updated;
  } catch (error) {
    if (error instanceof ConversationNotFoundError) {
      throw error;
    }

    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as any;
      throw new ConversationValidationError(
        zodError.errors.map((e: any) => ({
          field: e.path.join("."),
          message: e.message
        }))
      );
    }

    this.handleDatabaseError(error, "update");
  }
}
```

### 3. Implement Delete Method

```typescript
async delete(id: string): Promise<void> {
  try {
    // Validate ID format
    const idValidation = conversationSchema.shape.id.safeParse(id);
    if (!idValidation.success) {
      throw new ConversationNotFoundError(id);
    }

    // Check if exists before deleting
    const exists = await this.exists(id);
    if (!exists) {
      throw new ConversationNotFoundError(id);
    }

    const sql = `
      DELETE FROM conversations
      WHERE id = ?
    `;

    const result = await this.databaseBridge.execute(sql, [id]);

    if (result.changes === 0) {
      throw new ConversationNotFoundError(id);
    }

    this.logger.info("Deleted conversation", { id });
  } catch (error) {
    if (error instanceof ConversationNotFoundError) {
      throw error;
    }

    this.handleDatabaseError(error, "delete");
  }
}
```

## Technical Approach

1. Use parameterized queries for all operations
2. Validate inputs and outputs with schemas
3. Check existence before update/delete
4. Build dynamic SQL for partial updates
5. Always update the updated_at timestamp
6. Log all operations

## Acceptance Criteria

### List Method

- ✓ Returns all conversations
- ✓ Orders by created_at DESC (newest first)
- ✓ Returns empty array if none exist
- ✓ Validates each conversation
- ✓ Handles database errors
- ✓ Logs count

### Update Method

- ✓ Validates input with schema
- ✓ Checks conversation exists
- ✓ Updates only provided fields
- ✓ Always updates updated_at
- ✓ Returns updated conversation
- ✓ Throws ConversationNotFoundError if missing
- ✓ Handles validation errors

### Delete Method

- ✓ Validates ID format
- ✓ Checks existence before delete
- ✓ Deletes from database
- ✓ Throws ConversationNotFoundError if missing
- ✓ Returns void on success
- ✓ Logs deletion

## Testing Requirements

Add tests to `ConversationsRepository.test.ts`:

```typescript
describe("list", () => {
  it("should return all conversations");
  it("should return empty array when no conversations");
  it("should order by created_at DESC");
  it("should validate each conversation");
  it("should handle database errors");
});

describe("update", () => {
  it("should update title");
  it("should update updated_at timestamp");
  it("should handle partial updates");
  it("should throw ConversationNotFoundError if missing");
  it("should validate input");
  it("should handle database errors");
});

describe("delete", () => {
  it("should delete existing conversation");
  it("should throw ConversationNotFoundError if missing");
  it("should validate ID format");
  it("should handle database errors");
});
```

Mock scenarios:

- Database returns various result sets
- Database throws errors
- Validation failures
- Timestamps controlled with jest.useFakeTimers()

## Security Considerations

- Use parameterized queries
- Validate all inputs
- Check existence to prevent blind operations
- Don't expose internal errors

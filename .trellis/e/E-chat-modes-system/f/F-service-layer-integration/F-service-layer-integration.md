---
id: F-service-layer-integration
title: Service Layer Integration
status: done
priority: medium
parent: E-chat-modes-system
prerequisites:
  - F-database-schema-and-core-types
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
  apps/desktop/src/renderer/services/__tests__/ConversationIpcAdapter.test.ts:
    Created comprehensive unit test suite for ConversationIpcAdapter with 43
    test cases covering all methods including updateConversation, error
    handling, IPC availability checks, type safety validation, and edge cases.
    Tests include proper Electron API mocking and complete coverage of
    success/failure scenarios.
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-add-updateconversation-method
  - T-implement-updateconversation
  - T-update-conversationsrepository-1
created: 2025-09-03T18:34:45.412Z
updated: 2025-09-03T18:34:45.412Z
---

# Service Layer Integration Feature

## Overview

Update the service and repository layers to handle chat mode CRUD operations. This feature adds backend support for persisting and retrieving chat modes while maintaining the existing API patterns and ensuring new conversations default to 'round-robin' mode.

## Functionality

### Repository Layer Updates

- Update `ConversationsRepository` to include chat_mode in INSERT/SELECT/UPDATE operations
- Ensure repository `create()` method sets `chat_mode: 'round-robin'` for new conversations
- Add chat_mode support to existing query methods

### Service Layer Extensions

- Add `updateConversation(id, updates)` method to `ConversationService` using `UpdateConversationInput`
- Ensure all conversation operations handle chat_mode field
- Maintain backward compatibility with existing service contracts

### IPC Integration

- Use existing `conversations.update` IPC channel for chat_mode updates
- Implement via existing `window.electronAPI.conversations.update(id, updates)`
- No new IPC methods required (leverage existing infrastructure)

## Acceptance Criteria

### Repository Layer

- [ ] **CREATE Operations**: Repository `create()` method explicitly sets `chat_mode: 'round-robin'` for new conversations
- [ ] **SELECT Operations**: All conversation queries include chat_mode field in results
- [ ] **UPDATE Operations**: Repository `update()` method supports updating chat_mode field via `UpdateConversationInput`
- [ ] **Query Integration**: Existing list/get methods return conversations with chat_mode field
- [ ] **Data Integrity**: Database constraints prevent invalid chat_mode values
- [ ] **Naming Consistency**: Uses 'round-robin' (with hyphen) consistently in all operations

### Service Layer

- [ ] **updateConversation Method**: New method signature `updateConversation(id: string, updates: UpdateConversationInput): Promise<Conversation>`
- [ ] **Chat Mode Updates**: Can update chat_mode field independently or with other conversation fields
- [ ] **Validation**: Service validates chat_mode values using existing Zod schemas before persisting
- [ ] **Error Handling**: Descriptive errors for invalid chat_mode values or non-existent conversations
- [ ] **Transaction Safety**: Updates are atomic and handle concurrent modification properly

### IPC Adapter Integration

- [ ] **Existing IPC Reuse**: Uses existing `window.electronAPI.conversations.update` IPC without modification
- [ ] **Method Implementation**: `updateConversation()` calls `window.electronAPI.conversations.update(id, updates)`
- [ ] **Error Propagation**: IPC errors properly translated to service layer exceptions
- [ ] **Type Safety**: IPC calls maintain strong typing with `UpdateConversationInput`

### New Conversation Behavior

- [ ] **Default Mode**: New conversations created with `chat_mode: 'round-robin'` regardless of database default
- [ ] **Repository Override**: Repository create method explicitly sets mode, not relying on database default
- [ ] **Consistency**: All conversation creation paths (UI, API, tests) result in 'round-robin' mode
- [ ] **Backward Compatibility**: Existing conversations retain 'manual' mode from migration

### Testing Requirements

- [ ] **Repository Tests**: CRUD operations with chat_mode field work correctly
- [ ] **Service Tests**: updateConversation method handles all update scenarios
- [ ] **Integration Tests**: End-to-end conversation creation/update with chat_mode
- [ ] **Error Tests**: Invalid chat_mode values rejected at appropriate layers
- [ ] **Default Tests**: New conversations have correct default chat_mode

## Implementation Guidance

### Repository Implementation

```typescript
// ConversationsRepository updates
export class ConversationsRepository {
  async create(input: CreateConversationInput): Promise<Conversation> {
    const conversation = {
      id: generateId(),
      title: input.title,
      chat_mode: "round-robin" as const, // Explicit default for new conversations
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert with explicit chat_mode
    const result = await this.db.run(
      "INSERT INTO conversations (id, title, chat_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      [
        conversation.id,
        conversation.title,
        conversation.chat_mode,
        conversation.created_at,
        conversation.updated_at,
      ],
    );

    return conversation;
  }

  async update(
    id: string,
    updates: UpdateConversationInput,
  ): Promise<Conversation> {
    // Build dynamic UPDATE query based on provided fields
    // Include chat_mode in updateable fields
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push("title = ?");
      values.push(updates.title);
    }

    if (updates.chat_mode !== undefined) {
      fields.push("chat_mode = ?");
      values.push(updates.chat_mode);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.run(
      `UPDATE conversations SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return this.get(id);
  }
}
```

### Service Layer Implementation

```typescript
// ConversationService updates
export interface ConversationService {
  // ... existing methods

  /**
   * Update conversation properties including chat_mode
   * @param id - Conversation UUID to update
   * @param updates - UpdateConversationInput with optional title and chat_mode
   * @returns Promise resolving to updated conversation
   */
  updateConversation(
    id: string,
    updates: UpdateConversationInput,
  ): Promise<Conversation>;
}
```

### IPC Adapter Implementation

```typescript
// ConversationIpcAdapter updates
export class ConversationIpcAdapter implements ConversationService {
  async updateConversation(
    id: string,
    updates: UpdateConversationInput,
  ): Promise<Conversation> {
    if (!window.electronAPI?.conversations?.update) {
      throw new Error("Conversation update IPC not available");
    }

    try {
      return await window.electronAPI.conversations.update(id, updates);
    } catch (error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }
  }

  // ... existing methods
}
```

### Files to Modify

- `packages/shared/src/repositories/conversations/ConversationsRepository.ts`
- `packages/shared/src/services/conversations/ConversationService.ts`
- `apps/desktop/src/renderer/services/ConversationIpcAdapter.ts`

### Security Considerations

- **Input Validation**: Validate chat_mode values using existing Zod schemas before database operations
- **SQL Injection**: Use parameterized queries for all database operations
- **Authorization**: Ensure users can only update their own conversations
- **Data Integrity**: Validate conversation exists before updates

### Performance Requirements

- **Update Speed**: Conversation updates complete within 100ms
- **Query Performance**: No regression in existing conversation loading performance
- **Database Efficiency**: Minimal additional database load from new field

### Error Handling Patterns

```typescript
// Service layer error handling
export class ConversationServiceError extends Error {
  constructor(
    message: string,
    public readonly operation: "create" | "update" | "delete",
    public readonly conversationId?: string,
  ) {
    super(message);
  }
}

// Validation using existing schemas
import { updateConversationInputSchema } from "../types/conversations/schemas/updateConversationInputSchema";

export class ConversationServiceImpl implements ConversationService {
  async updateConversation(
    id: string,
    updates: UpdateConversationInput,
  ): Promise<Conversation> {
    // Validate using existing Zod schema
    const validatedUpdates = updateConversationInputSchema.parse(updates);

    try {
      return await this.repository.update(id, validatedUpdates);
    } catch (error) {
      throw new ConversationServiceError(
        `Failed to update conversation: ${error.message}`,
        "update",
        id,
      );
    }
  }
}
```

## Dependencies

- `F-database-schema-and-core-types` (requires updated Conversation types, UpdateConversationInput, and database schema)

## Success Metrics

- [ ] All repository CRUD operations handle chat_mode correctly
- [ ] New conversations consistently created with 'round-robin' mode
- [ ] Service layer updates work with existing IPC infrastructure
- [ ] No performance regression in conversation operations
- [ ] Comprehensive test coverage for all new functionality
- [ ] Existing `window.electronAPI.conversations.update` IPC works unchanged

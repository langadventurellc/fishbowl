---
id: T-implement-conversation
title: Implement conversation operations in ConversationService interface
status: open
priority: high
parent: F-conversationservice-interface
prerequisites:
  - T-create-conversationservice
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T03:02:24.541Z
updated: 2025-09-01T03:02:24.541Z
---

## Purpose

Add conversation CRUD operations to the ConversationService interface, ensuring exact alignment with the current window.electronAPI.conversations.\* surface for seamless platform abstraction.

## Context

This task implements conversation operations as part of the ConversationService interface (feature F-conversationservice-interface). Methods must exactly match current IPC signatures to enable clean migration from direct window.electronAPI calls to the conversation domain store architecture.

**Current IPC Analysis**:

- `window.electronAPI.conversations.list()` - Returns Promise<Conversation[]>
- `window.electronAPI.conversations.get(id)` - Returns Promise<Conversation>
- `window.electronAPI.conversations.create(title?)` - Returns Promise<Conversation>
- `window.electronAPI.conversations.update(id, input)` - Returns Promise<Conversation> (used for renaming)
- `window.electronAPI.conversations.delete(id)` - Returns Promise<boolean>

## Implementation Requirements

### Conversation Operations Interface Methods

Add the following methods to the existing ConversationService interface:

```typescript
export interface ConversationService {
  // Conversation CRUD Operations - exact IPC alignment

  /**
   * List all conversations for the current user
   * Maps to: window.electronAPI.conversations.list()
   * @returns Promise resolving to array of conversations
   * @throws Error on retrieval failure
   */
  listConversations(): Promise<Conversation[]>;

  /**
   * Get a specific conversation by ID
   * Maps to: window.electronAPI.conversations.get(id)
   * @param id - Conversation UUID
   * @returns Promise resolving to conversation or null if not found
   * @throws Error on retrieval failure
   */
  getConversation(id: string): Promise<Conversation | null>;

  /**
   * Create a new conversation
   * Maps to: window.electronAPI.conversations.create(title?)
   * @param title - Optional conversation title
   * @returns Promise resolving to created conversation
   * @throws Error on creation failure
   */
  createConversation(title?: string): Promise<Conversation>;

  /**
   * Update conversation (primarily for renaming)
   * Maps to: window.electronAPI.conversations.update(id, input)
   * @param id - Conversation UUID
   * @param title - New conversation title
   * @returns Promise resolving to updated conversation
   * @throws Error on update failure
   */
  renameConversation(id: string, title: string): Promise<Conversation>;

  /**
   * Delete a conversation permanently
   * Maps to: window.electronAPI.conversations.delete(id)
   * @param id - Conversation UUID
   * @returns Promise resolving to void on successful deletion
   * @throws Error on deletion failure
   */
  deleteConversation(id: string): Promise<void>;
}
```

### Method Signature Alignment

**Critical**: Each method signature must exactly match current IPC usage patterns:

1. **listConversations()**: No parameters, returns Conversation array
2. **getConversation(id)**: Single string parameter, nullable return (for conversation selection)
3. **createConversation(title?)**: Optional title parameter matching current create behavior
4. **renameConversation(id, title)**: Simplified interface over update operation for title changes
5. **deleteConversation(id)**: Single ID parameter, void return (interface abstracts boolean return)

### Error Handling Strategy

- **Interface level**: All methods throw standard Error objects
- **No ErrorState pattern**: Interface remains platform-agnostic
- **Adapter responsibility**: Platform adapters will convert platform errors to standard errors
- **Clean propagation**: Errors bubble up to domain store layer for ErrorState conversion

## Technical Specifications

### Type Dependencies

- All return types use existing Conversation interface from @fishbowl-ai/shared
- Parameter types use primitive strings (conversation IDs are UUIDs)
- No platform-specific types in method signatures

### Documentation Standards

- **TypeDoc format**: Complete parameter and return value documentation
- **IPC mapping**: Each method documents its corresponding window.electronAPI call
- **Error conditions**: Clear documentation of when methods throw errors
- **Purpose clarity**: Explain each operation's role in conversation lifecycle

### Method Naming Strategy

- **Semantic clarity**: Method names describe business operations (createConversation vs create)
- **Consistency**: Follows domain-driven naming patterns
- **IPC abstraction**: Names hide platform details while maintaining functionality

## Acceptance Criteria

### Functional Requirements

- [ ] All 5 conversation operations defined in interface
- [ ] Method signatures exactly match current IPC usage patterns
- [ ] Complete TypeDoc documentation for each method
- [ ] Error handling documented consistently
- [ ] Return types use existing domain types

### Code Quality Standards

- [ ] TypeScript compiles without errors
- [ ] Method signatures enable type-safe implementation
- [ ] Documentation follows established project patterns
- [ ] No platform-specific dependencies

### IPC Alignment Verification

- [ ] listConversations() matches conversations.list() signature
- [ ] getConversation() matches conversations.get() signature
- [ ] createConversation() matches conversations.create() signature
- [ ] renameConversation() abstracts conversations.update() appropriately
- [ ] deleteConversation() matches conversations.delete() signature

## Dependencies and Sequencing

### Prerequisites

- T-create-conversationservice: Interface file and imports must exist

### Enables

- Message operations implementation
- ConversationAgent operations implementation
- Desktop IPC adapter implementation
- Domain store conversation actions

## Testing Requirements

### Unit Testing (included in this task)

Update the existing test file to verify conversation operations:

```typescript
// Add to packages/shared/src/services/conversations/__tests__/ConversationService.test.ts

describe("ConversationService Interface - Conversation Operations", () => {
  it("should define all required conversation methods", () => {
    // Type checking - these must compile if interface is correct
    const mockService: ConversationService = {
      listConversations: async () => [],
      getConversation: async (id: string) => null,
      createConversation: async (title?: string) => ({}) as Conversation,
      renameConversation: async (id: string, title: string) =>
        ({}) as Conversation,
      deleteConversation: async (id: string) => {},
      // Other methods to be added by subsequent tasks
    } as ConversationService;

    expect(typeof mockService.listConversations).toBe("function");
    expect(typeof mockService.getConversation).toBe("function");
    expect(typeof mockService.createConversation).toBe("function");
    expect(typeof mockService.renameConversation).toBe("function");
    expect(typeof mockService.deleteConversation).toBe("function");
  });

  it("should have correct method signatures for conversation operations", () => {
    // Signature validation - if this compiles, signatures are correct
    const testSignatures = async () => {
      const service: ConversationService = {} as ConversationService;

      // Test parameter and return types
      const conversations: Conversation[] = await service.listConversations();
      const conversation: Conversation | null =
        await service.getConversation("id");
      const created: Conversation = await service.createConversation();
      const createdWithTitle: Conversation =
        await service.createConversation("title");
      const renamed: Conversation = await service.renameConversation(
        "id",
        "title",
      );
      const deleted: void = await service.deleteConversation("id");
    };

    expect(typeof testSignatures).toBe("function");
  });
});
```

## Out of Scope

- Method implementations (adapter layer responsibility)
- Error conversion logic (adapter layer responsibility)
- Domain store integration (separate feature)
- IPC layer modifications (separate feature)
- Conversation validation logic (adapter layer responsibility)

## Security Considerations

- Method signatures prevent invalid parameter types
- Interface design enables proper validation at implementation layer
- No exposure of internal platform implementation details

## Performance Considerations

- Interface design supports efficient batching in future implementations
- Method signatures don't prevent caching strategies in adapters
- Simple types ensure fast TypeScript compilation

## Files Modified

- `packages/shared/src/services/conversations/ConversationService.ts` - Add conversation operations
- `packages/shared/src/services/conversations/__tests__/ConversationService.test.ts` - Update tests

This task establishes the conversation operations foundation that enables all subsequent interface implementations and platform adapter development.

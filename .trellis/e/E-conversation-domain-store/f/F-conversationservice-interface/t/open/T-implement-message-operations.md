---
id: T-implement-message-operations
title: Implement message operations in ConversationService interface
status: open
priority: high
parent: F-conversationservice-interface
prerequisites:
  - T-create-conversationservice
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T03:03:06.172Z
updated: 2025-09-01T03:03:06.172Z
---

## Purpose

Add message operations to the ConversationService interface, ensuring exact alignment with the current window.electronAPI.messages.\* surface for seamless platform abstraction without pagination complexity.

## Context

This task implements message operations as part of the ConversationService interface (feature F-conversationservice-interface). Methods must exactly match current IPC signatures to enable clean migration from direct window.electronAPI calls to the conversation domain store architecture.

**Current IPC Analysis**:

- `window.electronAPI.messages.list(conversationId)` - Returns Promise<Message[]>
- `window.electronAPI.messages.create(input)` - Returns Promise<Message>
- `window.electronAPI.messages.delete(id)` - Returns Promise<boolean>
- `window.electronAPI.messages.updateInclusion(id, included)` - Returns Promise<Message> (out of scope for v1)

## Implementation Requirements

### Message Operations Interface Methods

Add the following methods to the existing ConversationService interface:

```typescript
export interface ConversationService {
  // ... existing conversation methods ...

  // Message Operations - exact IPC alignment (NO pagination complexity)

  /**
   * List all messages for a specific conversation
   * Maps to: window.electronAPI.messages.list(conversationId)
   * @param conversationId - Conversation UUID to retrieve messages for
   * @returns Promise resolving to array of messages (no pagination - simple client-side capping)
   * @throws Error on retrieval failure or invalid conversation ID
   */
  listMessages(conversationId: string): Promise<Message[]>;

  /**
   * Create a new message in a conversation
   * Maps to: window.electronAPI.messages.create(input)
   * @param input - CreateMessageInput with conversation_id, role, content, etc.
   * @returns Promise resolving to created message with generated ID and timestamps
   * @throws Error on creation failure or validation errors
   */
  createMessage(input: CreateMessageInput): Promise<Message>;

  /**
   * Delete a message permanently
   * Maps to: window.electronAPI.messages.delete(id)
   * @param id - Message UUID to delete
   * @returns Promise resolving to void on successful deletion
   * @throws Error on deletion failure or message not found
   */
  deleteMessage(id: string): Promise<void>;
}
```

### Method Signature Alignment

**Critical**: Each method signature must exactly match current IPC usage patterns:

1. **listMessages(conversationId)**: Single conversation ID parameter, returns full Message array
2. **createMessage(input)**: Uses existing CreateMessageInput type, returns created Message
3. **deleteMessage(id)**: Single message ID parameter, void return (interface abstracts boolean return)

### No Pagination Complexity

**Important**: Following epic guidance, the interface excludes pagination complexity:

- **Simple approach**: listMessages returns all messages for conversation
- **Client-side capping**: Domain store will implement configurable maximumMessages limit
- **No cursor/offset**: Interface avoids pagination parameters (beforeId, limit, etc.)
- **Future-proof**: Design allows pagination addition later if needed

### Type Dependencies and Imports

- **CreateMessageInput**: Use existing type from @fishbowl-ai/shared (already imported in interface file)
- **Message**: Use existing domain type from @fishbowl-ai/shared
- **No redefinition**: All types are imported, never redefined in this interface

## Technical Specifications

### Error Handling Strategy

- **Interface level**: All methods throw standard Error objects
- **Validation errors**: createMessage throws on invalid input (empty content, missing conversation_id)
- **Not found errors**: deleteMessage throws on non-existent message ID
- **Relationship errors**: createMessage throws on invalid conversation_id or conversation_agent_id

### Documentation Standards

- **TypeDoc format**: Complete parameter and return value documentation
- **IPC mapping**: Each method documents its corresponding window.electronAPI call
- **Error conditions**: Clear documentation of when methods throw errors
- **Business rules**: Document CreateMessageInput requirements and constraints

### Method Behavior Specifications

1. **listMessages**:
   - Returns messages in chronological order (sorted by created_at)
   - Empty array for valid conversation with no messages
   - Throws error for invalid/non-existent conversation ID

2. **createMessage**:
   - Validates CreateMessageInput according to existing schema validation
   - Generates UUID for message ID
   - Sets created_at timestamp
   - Handles user, agent, and system message types properly
   - Requires conversation_agent_id for agent messages

3. **deleteMessage**:
   - Permanently removes message from conversation
   - Throws error if message doesn't exist
   - No cascade deletion logic (interface level only)

## Acceptance Criteria

### Functional Requirements

- [ ] All 3 message operations defined in interface
- [ ] Method signatures exactly match current IPC usage patterns
- [ ] CreateMessageInput type properly imported and used
- [ ] Complete TypeDoc documentation for each method
- [ ] Error handling documented consistently
- [ ] No pagination complexity included

### Code Quality Standards

- [ ] TypeScript compiles without errors
- [ ] Method signatures enable type-safe implementation
- [ ] Documentation follows established project patterns
- [ ] Proper use of existing domain types

### IPC Alignment Verification

- [ ] listMessages() matches messages.list() signature and behavior
- [ ] createMessage() matches messages.create() signature exactly
- [ ] deleteMessage() matches messages.delete() signature
- [ ] No pagination parameters included (following epic guidance)
- [ ] CreateMessageInput usage matches current IPC patterns

## Dependencies and Sequencing

### Prerequisites

- T-create-conversationservice: Interface file and imports must exist

### Enables

- ConversationAgent operations implementation
- Chat orchestration implementation
- Desktop IPC adapter message operations
- Domain store message actions

## Testing Requirements

### Unit Testing (included in this task)

Update the existing test file to verify message operations:

```typescript
// Add to packages/shared/src/services/conversations/__tests__/ConversationService.test.ts

describe("ConversationService Interface - Message Operations", () => {
  it("should define all required message methods", () => {
    // Type checking - these must compile if interface is correct
    const mockService: Partial<ConversationService> = {
      listMessages: async (conversationId: string) => [],
      createMessage: async (input: CreateMessageInput) => ({}) as Message,
      deleteMessage: async (id: string) => {},
    };

    expect(typeof mockService.listMessages).toBe("function");
    expect(typeof mockService.createMessage).toBe("function");
    expect(typeof mockService.deleteMessage).toBe("function");
  });

  it("should have correct method signatures for message operations", () => {
    // Signature validation - if this compiles, signatures are correct
    const testSignatures = async () => {
      const service: ConversationService = {} as ConversationService;
      const mockInput: CreateMessageInput = {} as CreateMessageInput;

      // Test parameter and return types
      const messages: Message[] = await service.listMessages("conversation-id");
      const created: Message = await service.createMessage(mockInput);
      const deleted: void = await service.deleteMessage("message-id");
    };

    expect(typeof testSignatures).toBe("function");
  });

  it("should use existing CreateMessageInput type correctly", async () => {
    // Import validation - CreateMessageInput should be properly imported
    const { CreateMessageInput } = await import("@fishbowl-ai/shared");
    expect(CreateMessageInput).toBeDefined();
  });
});
```

## Out of Scope

- Method implementations (adapter layer responsibility)
- Message validation logic (handled by CreateMessageInput schema in adapter)
- Pagination support (excluded per epic guidance for v1)
- Message inclusion/exclusion operations (updateInclusion - separate concern)
- Domain store message management (separate feature)
- IPC layer modifications (separate feature)

## Security Considerations

- Interface design prevents injection of invalid CreateMessageInput
- Method signatures ensure conversation_id validation at implementation level
- No exposure of internal database IDs or implementation details

## Performance Considerations

- Simple listMessages design supports efficient client-side capping
- CreateMessageInput validation handled at adapter layer for performance
- Interface design allows future batching optimizations

## Files Modified

- `packages/shared/src/services/conversations/ConversationService.ts` - Add message operations
- `packages/shared/src/services/conversations/__tests__/ConversationService.test.ts` - Update tests

This task provides the message operations foundation that enables conversation domain store message management and seamless migration from direct IPC calls.

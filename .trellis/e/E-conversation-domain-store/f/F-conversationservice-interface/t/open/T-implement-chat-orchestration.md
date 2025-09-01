---
id: T-implement-chat-orchestration
title: Implement chat orchestration operations in ConversationService interface
status: open
priority: high
parent: F-conversationservice-interface
prerequisites:
  - T-create-conversationservice
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T03:04:26.321Z
updated: 2025-09-01T03:04:26.321Z
---

## Purpose

Add chat orchestration operations to the ConversationService interface, ensuring exact alignment with the current window.electronAPI.chat.\* surface to enable seamless agent interaction triggering through the conversation domain store.

## Context

This task implements chat orchestration operations as part of the ConversationService interface (feature F-conversationservice-interface). The sendToAgents method must exactly match current IPC signatures to enable clean migration from direct window.electronAPI calls in the message input component.

**Current IPC Analysis**:

- `window.electronAPI.chat.sendToAgents(conversationId, userMessageId)` - Returns Promise<void>
- `window.electronAPI.chat.onAgentUpdate(callback)` - Event listener (out of interface scope - handled by store)

## Implementation Requirements

### Chat Orchestration Interface Methods

Add the following method to the existing ConversationService interface:

```typescript
export interface ConversationService {
  // ... existing conversation, message, and agent methods ...

  // Chat Orchestration - exact IPC alignment

  /**
   * Trigger agent orchestration for a user message
   * Maps to: window.electronAPI.chat.sendToAgents(conversationId, userMessageId)
   *
   * Initiates the agent response generation process for enabled agents in the conversation.
   * This method starts the orchestration but does not wait for agent responses - responses
   * are delivered asynchronously via agent update events.
   *
   * @param conversationId - Conversation UUID where orchestration should occur
   * @param userMessageId - User message UUID that triggered the orchestration
   * @returns Promise resolving to void when orchestration is successfully initiated
   * @throws Error on orchestration failure, invalid IDs, or no enabled agents
   */
  sendToAgents(conversationId: string, userMessageId: string): Promise<void>;
}
```

### Method Signature Alignment

**Critical**: Method signature must exactly match current IPC usage:

- **Parameters**: Two string parameters (conversationId, userMessageId) matching current usage
- **Return type**: Promise<void> - orchestration initiation, not completion
- **Error handling**: Throws on invalid IDs, orchestration failures, or configuration issues

### Orchestration Behavior

The interface method enables the following orchestration flow:

1. **Initiation**: sendToAgents triggers agent response generation
2. **Validation**: Ensures conversation exists and has enabled agents
3. **Asynchronous execution**: Method returns after starting orchestration, not completing it
4. **Event-driven responses**: Agent responses delivered via separate event system (not part of this interface)

### Integration with Domain Store Architecture

This method will be used by the domain store to:

- **Replace direct IPC calls**: MessageInputContainer currently calls window.electronAPI.chat.sendToAgents directly
- **Coordinate with message creation**: sendUserMessage action will call createMessage then sendToAgents
- **Enable clean testing**: Interface allows mocking of orchestration for unit tests

## Technical Specifications

### Error Handling Strategy

- **Interface level**: Method throws standard Error objects
- **Validation errors**: Throws on invalid conversationId or userMessageId
- **Configuration errors**: Throws if conversation has no enabled agents
- **Orchestration errors**: Throws if agent system fails to start processing

### Documentation Standards

- **TypeDoc format**: Complete parameter and return value documentation
- **IPC mapping**: Documents corresponding window.electronAPI call
- **Async behavior**: Clearly explains that method initiates but doesn't wait for completion
- **Error conditions**: Documents all scenarios that cause exceptions

### Method Behavior Specifications

1. **Parameter validation**:
   - conversationId must be valid UUID of existing conversation
   - userMessageId must be valid UUID of existing message in the conversation

2. **Agent validation**:
   - Conversation must have at least one enabled agent
   - Throws error if no agents are available for orchestration

3. **Orchestration initiation**:
   - Starts agent response generation process
   - Returns immediately after successful initiation
   - Agent responses delivered asynchronously through event system

## Acceptance Criteria

### Functional Requirements

- [ ] sendToAgents method defined in interface
- [ ] Method signature exactly matches current IPC usage pattern
- [ ] Complete TypeDoc documentation with async behavior explanation
- [ ] Error handling documented consistently
- [ ] Parameter validation requirements clearly specified

### Code Quality Standards

- [ ] TypeScript compiles without errors
- [ ] Method signature enables type-safe implementation
- [ ] Documentation follows established project patterns
- [ ] Clear distinction between initiation and completion

### IPC Alignment Verification

- [ ] sendToAgents() matches chat.sendToAgents() signature exactly
- [ ] Parameter order and types match current usage
- [ ] Return type matches current behavior (Promise<void>)
- [ ] Error scenarios align with current implementation

## Dependencies and Sequencing

### Prerequisites

- T-create-conversationservice: Interface file and imports must exist

### Enables

- Desktop IPC adapter chat operations
- Domain store sendUserMessage action
- Message input component migration from direct IPC calls
- End-to-end conversation orchestration testing

## Testing Requirements

### Unit Testing (included in this task)

Update the existing test file to verify chat orchestration operations:

```typescript
// Add to packages/shared/src/services/conversations/__tests__/ConversationService.test.ts

describe("ConversationService Interface - Chat Orchestration", () => {
  it("should define sendToAgents method", () => {
    // Type checking - this must compile if interface is correct
    const mockService: Partial<ConversationService> = {
      sendToAgents: async (conversationId: string, userMessageId: string) => {},
    };

    expect(typeof mockService.sendToAgents).toBe("function");
  });

  it("should have correct method signature for sendToAgents", () => {
    // Signature validation - if this compiles, signature is correct
    const testSignature = async () => {
      const service: ConversationService = {} as ConversationService;

      // Test parameter and return types
      const result: void = await service.sendToAgents("conv-id", "msg-id");

      // Ensure parameters are required strings
      await service.sendToAgents("conversation-id", "message-id");
    };

    expect(typeof testSignature).toBe("function");
  });

  it("should complete interface definition with all required methods", () => {
    // Comprehensive interface validation
    const mockService: ConversationService = {
      // Conversation operations
      listConversations: async () => [],
      getConversation: async (id: string) => null,
      createConversation: async (title?: string) => ({}) as Conversation,
      renameConversation: async (id: string, title: string) =>
        ({}) as Conversation,
      deleteConversation: async (id: string) => {},

      // Message operations
      listMessages: async (conversationId: string) => [],
      createMessage: async (input: CreateMessageInput) => ({}) as Message,
      deleteMessage: async (id: string) => {},

      // Agent operations
      listConversationAgents: async (conversationId: string) => [],
      addAgent: async (conversationId: string, agentId: string) =>
        ({}) as ConversationAgent,
      removeAgent: async (conversationId: string, agentId: string) => {},
      updateConversationAgent: async (
        id: string,
        updates: Partial<ConversationAgent>,
      ) => ({}) as ConversationAgent,

      // Chat orchestration
      sendToAgents: async (conversationId: string, userMessageId: string) => {},
    };

    // Verify all methods are properly defined
    expect(typeof mockService.sendToAgents).toBe("function");
    expect(Object.keys(mockService)).toHaveLength(12); // Total expected methods
  });
});
```

## Out of Scope

- Method implementation (adapter layer responsibility)
- Agent response handling (separate event system)
- Agent update events (handled by domain store, not interface)
- Orchestration configuration logic (adapter layer responsibility)
- Domain store sendUserMessage implementation (separate feature)
- IPC layer modifications (separate feature)

## Security Considerations

- Interface design prevents orchestration with invalid conversation or message IDs
- Method signature ensures proper parameter validation at implementation level
- No exposure of internal orchestration implementation details

## Performance Considerations

- Method design supports efficient orchestration initiation
- Async pattern prevents blocking UI during agent processing
- Interface allows future orchestration optimization and batching

## Files Modified

- `packages/shared/src/services/conversations/ConversationService.ts` - Add sendToAgents method
- `packages/shared/src/services/conversations/__tests__/ConversationService.test.ts` - Update tests

This task completes the core ConversationService interface definition, providing all operations needed for the conversation domain store to replace direct window.electronAPI usage throughout the application.

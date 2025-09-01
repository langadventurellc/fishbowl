---
id: T-implement-conversation-agent
title: Implement conversation agent operations in ConversationService interface
status: done
priority: high
parent: F-conversationservice-interface
prerequisites:
  - T-create-conversationservice
affectedFiles:
  packages/shared/src/services/conversations/ConversationService.ts:
    Added four conversation agent operation methods (listConversationAgents,
    addAgent, removeAgent, updateConversationAgent) with complete TypeDoc
    documentation, IPC mapping comments, and exact alignment to current
    window.electronAPI.conversationAgent surface. Method signatures transform
    object parameters to simplified string parameters for cleaner interface
    design.
  packages/shared/src/services/conversations/__tests__/ConversationService.test.ts:
    "Added comprehensive test suite for conversation agent operations including
    3 new test cases: method existence validation, signature type checking, and
    Partial<ConversationAgent> update compatibility. All tests use
    compilation-based validation following established patterns and verify
    TypeScript type safety."
log:
  - >-
    Successfully implemented conversation agent operations in
    ConversationService interface with exact IPC alignment and comprehensive
    testing.


    Added four new methods to the interface:

    1. listConversationAgents() - retrieves all agents for a conversation 

    2. addAgent() - adds agent to conversation with simplified parameter pattern

    3. removeAgent() - removes agent from conversation 

    4. updateConversationAgent() - updates agent configuration (enable/disable)


    Each method includes complete TypeDoc documentation with IPC mapping
    comments, parameter validation, and error handling specifications. Method
    signatures exactly match current window.electronAPI.conversationAgent
    surface while providing cleaner parameter patterns (simplified from object
    parameters to separate string parameters).


    All methods use existing ConversationAgent type from @fishbowl-ai/shared and
    support proper TypeScript type checking. Implementation follows established
    interface patterns for platform abstraction and dependency injection.


    Comprehensive test coverage added with 3 new test cases verifying method
    signatures, parameter types, and Partial<ConversationAgent> updates. All
    tests pass and ensure TypeScript compilation works correctly.
schema: v1.0
childrenIds: []
created: 2025-09-01T03:03:45.418Z
updated: 2025-09-01T03:03:45.418Z
---

## Purpose

Add conversation agent operations to the ConversationService interface, ensuring exact alignment with the current window.electronAPI.conversationAgent.\* surface for seamless platform abstraction and agent lifecycle management.

## Context

This task implements conversation agent operations as part of the ConversationService interface (feature F-conversationservice-interface). Methods must exactly match current IPC signatures to enable clean migration from direct window.electronAPI calls to the conversation domain store architecture.

**Current IPC Analysis**:

- `window.electronAPI.conversationAgent.getByConversation(conversationId)` - Returns Promise<ConversationAgent[]>
- `window.electronAPI.conversationAgent.add({conversation_id, agent_id})` - Returns Promise<ConversationAgent>
- `window.electronAPI.conversationAgent.remove({conversation_id, agent_id})` - Returns Promise<void>
- `window.electronAPI.conversationAgent.update({conversationAgentId, updates})` - Returns Promise<ConversationAgent>

## Implementation Requirements

### ConversationAgent Operations Interface Methods

Add the following methods to the existing ConversationService interface:

```typescript
export interface ConversationService {
  // ... existing conversation and message methods ...

  // ConversationAgent Operations - exact IPC alignment

  /**
   * List all agents assigned to a specific conversation
   * Maps to: window.electronAPI.conversationAgent.getByConversation(conversationId)
   * @param conversationId - Conversation UUID to retrieve agents for
   * @returns Promise resolving to array of conversation agents with their configurations
   * @throws Error on retrieval failure or invalid conversation ID
   */
  listConversationAgents(conversationId: string): Promise<ConversationAgent[]>;

  /**
   * Add an agent to a conversation
   * Maps to: window.electronAPI.conversationAgent.add({conversation_id, agent_id})
   * @param conversationId - Conversation UUID to add agent to
   * @param agentId - Agent UUID to add to the conversation
   * @returns Promise resolving to created conversation agent relationship
   * @throws Error on creation failure, duplicate assignment, or invalid IDs
   */
  addAgent(conversationId: string, agentId: string): Promise<ConversationAgent>;

  /**
   * Remove an agent from a conversation
   * Maps to: window.electronAPI.conversationAgent.remove({conversation_id, agent_id})
   * @param conversationId - Conversation UUID to remove agent from
   * @param agentId - Agent UUID to remove from the conversation
   * @returns Promise resolving to void on successful removal
   * @throws Error on removal failure or relationship not found
   */
  removeAgent(conversationId: string, agentId: string): Promise<void>;

  /**
   * Update conversation agent configuration (primarily for enabling/disabling)
   * Maps to: window.electronAPI.conversationAgent.update({conversationAgentId, updates})
   * @param conversationAgentId - ConversationAgent relationship UUID
   * @param updates - Partial ConversationAgent updates (typically {enabled: boolean})
   * @returns Promise resolving to updated conversation agent
   * @throws Error on update failure or relationship not found
   */
  updateConversationAgent(
    conversationAgentId: string,
    updates: Partial<ConversationAgent>,
  ): Promise<ConversationAgent>;
}
```

### Method Signature Alignment

**Critical**: Each method signature must exactly match current IPC usage patterns:

1. **listConversationAgents(conversationId)**: Single conversation ID parameter, returns ConversationAgent array
2. **addAgent(conversationId, agentId)**: Two string parameters, returns created ConversationAgent relationship
3. **removeAgent(conversationId, agentId)**: Two string parameters, void return (interface abstracts result)
4. **updateConversationAgent(id, updates)**: ConversationAgent ID and partial updates, returns updated relationship

### Agent Lifecycle Management

The interface supports complete agent lifecycle within conversations:

- **Discovery**: listConversationAgents retrieves current conversation participants
- **Assignment**: addAgent creates new agent-conversation relationships
- **Configuration**: updateConversationAgent modifies agent settings (enabled/disabled state)
- **Removal**: removeAgent breaks agent-conversation relationships

### IPC Parameter Transformation

**Important**: Interface simplifies IPC parameter patterns:

- **IPC**: `add({conversation_id, agent_id})` → **Interface**: `addAgent(conversationId, agentId)`
- **IPC**: `remove({conversation_id, agent_id})` → **Interface**: `removeAgent(conversationId, agentId)`
- **IPC**: `update({conversationAgentId, updates})` → **Interface**: `updateConversationAgent(conversationAgentId, updates)`

This provides cleaner method signatures while maintaining exact functional alignment.

## Technical Specifications

### Type Dependencies

- **ConversationAgent**: Use existing domain type from @fishbowl-ai/shared
- **Partial<ConversationAgent>**: TypeScript utility type for updates
- **String parameters**: All IDs are UUID strings

### Error Handling Strategy

- **Interface level**: All methods throw standard Error objects
- **Relationship errors**: Add/remove operations throw on invalid agent or conversation IDs
- **Duplicate errors**: addAgent throws if relationship already exists
- **Not found errors**: updateConversationAgent and removeAgent throw if relationship doesn't exist

### Documentation Standards

- **TypeDoc format**: Complete parameter and return value documentation
- **IPC mapping**: Each method documents its corresponding window.electronAPI call
- **Business rules**: Document agent assignment constraints and update patterns
- **State management**: Explain enabled/disabled toggle functionality

## Acceptance Criteria

### Functional Requirements

- [ ] All 4 conversation agent operations defined in interface
- [ ] Method signatures exactly match current IPC usage patterns with parameter simplification
- [ ] ConversationAgent type properly imported and used
- [ ] Complete TypeDoc documentation for each method
- [ ] Error handling documented consistently
- [ ] Update operations support Partial<ConversationAgent> pattern

### Code Quality Standards

- [ ] TypeScript compiles without errors
- [ ] Method signatures enable type-safe implementation
- [ ] Documentation follows established project patterns
- [ ] Proper use of existing domain types
- [ ] Clean parameter patterns (simplified from IPC object parameters)

### IPC Alignment Verification

- [ ] listConversationAgents() matches conversationAgent.getByConversation() functionality
- [ ] addAgent() matches conversationAgent.add() functionality with simplified parameters
- [ ] removeAgent() matches conversationAgent.remove() functionality with simplified parameters
- [ ] updateConversationAgent() matches conversationAgent.update() functionality
- [ ] Parameter transformation properly documented

## Dependencies and Sequencing

### Prerequisites

- T-create-conversationservice: Interface file and imports must exist

### Enables

- Chat orchestration implementation
- Desktop IPC adapter conversationAgent operations
- Domain store agent management actions
- Agent enabling/disabling functionality

## Testing Requirements

### Unit Testing (included in this task)

Update the existing test file to verify conversation agent operations:

```typescript
// Add to packages/shared/src/services/conversations/__tests__/ConversationService.test.ts

describe("ConversationService Interface - ConversationAgent Operations", () => {
  it("should define all required conversation agent methods", () => {
    // Type checking - these must compile if interface is correct
    const mockService: Partial<ConversationService> = {
      listConversationAgents: async (conversationId: string) => [],
      addAgent: async (conversationId: string, agentId: string) =>
        ({}) as ConversationAgent,
      removeAgent: async (conversationId: string, agentId: string) => {},
      updateConversationAgent: async (
        id: string,
        updates: Partial<ConversationAgent>,
      ) => ({}) as ConversationAgent,
    };

    expect(typeof mockService.listConversationAgents).toBe("function");
    expect(typeof mockService.addAgent).toBe("function");
    expect(typeof mockService.removeAgent).toBe("function");
    expect(typeof mockService.updateConversationAgent).toBe("function");
  });

  it("should have correct method signatures for conversation agent operations", () => {
    // Signature validation - if this compiles, signatures are correct
    const testSignatures = async () => {
      const service: ConversationService = {} as ConversationService;
      const updates: Partial<ConversationAgent> = { enabled: false };

      // Test parameter and return types
      const agents: ConversationAgent[] =
        await service.listConversationAgents("conv-id");
      const added: ConversationAgent = await service.addAgent(
        "conv-id",
        "agent-id",
      );
      const removed: void = await service.removeAgent("conv-id", "agent-id");
      const updated: ConversationAgent = await service.updateConversationAgent(
        "ca-id",
        updates,
      );
    };

    expect(typeof testSignatures).toBe("function");
  });

  it("should support Partial<ConversationAgent> updates correctly", () => {
    // Type validation for update operations
    const validUpdates: Partial<ConversationAgent> = {
      enabled: true,
      // Other ConversationAgent properties can be partial
    };

    const testUpdate = async () => {
      const service: ConversationService = {} as ConversationService;
      await service.updateConversationAgent("ca-id", validUpdates);
      await service.updateConversationAgent("ca-id", { enabled: false });
    };

    expect(typeof testUpdate).toBe("function");
  });
});
```

## Out of Scope

- Method implementations (adapter layer responsibility)
- Agent validation logic (handled by existing domain validation)
- ConversationAgent relationship constraints (handled by database layer)
- Agent orchestration logic (separate chat operations)
- Domain store agent management (separate feature)
- IPC layer modifications (separate feature)

## Security Considerations

- Interface design prevents assignment of invalid agent or conversation IDs
- Method signatures ensure relationship validation at implementation level
- Update operations constrained to safe ConversationAgent properties
- No exposure of internal relationship management details

## Performance Considerations

- Simple listConversationAgents design supports efficient agent loading
- Parameter simplification reduces object creation overhead
- Interface design allows future agent batching optimizations

## Files Modified

- `packages/shared/src/services/conversations/ConversationService.ts` - Add conversation agent operations
- `packages/shared/src/services/conversations/__tests__/ConversationService.test.ts` - Update tests

This task provides the conversation agent operations foundation that enables complete agent lifecycle management within the conversation domain store architecture.

---
id: F-conversationservice-interface
title: ConversationService Interface Definition
status: done
priority: medium
parent: E-conversation-domain-store
prerequisites: []
affectedFiles:
  packages/shared/src/services/conversations/ConversationService.ts:
    Created main interface file with type-only imports of Conversation, Message,
    ConversationAgent, and CreateMessageInput from existing shared package
    locations. Includes comprehensive TypeDoc documentation explaining Platform
    Abstraction Pattern and empty interface structure ready for method
    implementations in subsequent tasks.; Added sendToAgents method to interface
    with signature exactly matching current IPC surface. Includes comprehensive
    TypeDoc documentation explaining orchestration behavior, async pattern,
    parameter validation, and error handling.; Added four conversation agent
    operation methods (listConversationAgents, addAgent, removeAgent,
    updateConversationAgent) with complete TypeDoc documentation, IPC mapping
    comments, and exact alignment to current
    window.electronAPI.conversationAgent surface. Method signatures transform
    object parameters to simplified string parameters for cleaner interface
    design.; Added 5 conversation CRUD methods (listConversations,
    getConversation, createConversation, renameConversation, deleteConversation)
    with complete TypeDoc documentation and IPC mapping comments; Added three
    message operation methods (listMessages, createMessage, deleteMessage) with
    comprehensive TypeDoc documentation and exact IPC alignment to
    window.electronAPI.messages surface. Methods use existing _Message and
    _CreateMessageInput type aliases following established interface patterns.
  packages/shared/src/services/conversations/index.ts:
    Created barrel export file
    providing clean import path for ConversationService interface following
    established shared package patterns.
  packages/shared/src/services/conversations/__tests__/ConversationService.test.ts:
    "Created comprehensive test suite with 3 tests: interface type validation,
    import resolution verification, and barrel export confirmation. All tests
    pass and verify TypeScript compilation works correctly.; Added comprehensive
    test suite for chat orchestration operations including 3 new test cases:
    method signature validation, parameter type checking, and IPC alignment
    verification. Updated existing test to include sendToAgents in partial
    mock.; Added comprehensive test suite for conversation agent operations
    including 3 new test cases: method existence validation, signature type
    checking, and Partial<ConversationAgent> update compatibility. All tests use
    compilation-based validation following established patterns and verify
    TypeScript type safety.; Added Conversation type import and comprehensive
    test suite with 4 tests validating conversation CRUD method signatures,
    optional parameters, and complete interface implementation; Added Message
    and CreateMessageInput imports. Added complete 'Message Operations' test
    suite with 4 test cases: method definition validation, signature type
    checking, CreateMessageInput type usage verification, and IPC alignment
    implementation testing. Updated complete interface implementation test to
    include message operations."
  packages/shared/src/services/index.ts: Added export for conversations service
    following established barrel export patterns
  packages/shared/src/services/conversations/README.md: Created comprehensive
    service documentation explaining ConversationService interface usage, import
    patterns, and available operations
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-barrel-exports-and
  - T-create-conversationservice
  - T-implement-chat-orchestration
  - T-implement-conversation-agent
  - T-implement-conversation
  - T-implement-message-operations
created: 2025-09-01T02:19:23.735Z
updated: 2025-09-01T02:19:23.735Z
---

## Purpose

Define a clean, platform-agnostic ConversationService interface in the shared package that eliminates direct window.electronAPI calls from UI components and provides a foundation for the unified conversation domain store.

## Key Components

### ConversationService Interface

- **Location**: `packages/shared/src/services/conversations/ConversationService.ts`
- **Scope**: Simple operations without pagination complexity
- **Purpose**: Clean abstraction layer for conversation, message, and agent operations
- **Method alignment**: Exactly match current IPC surface (window.electronAPI)

### Type Dependencies

- **CreateMessageInput**: Use existing type from @fishbowl-ai/shared (don't redefine)
- **Message, Conversation, ConversationAgent**: Reuse existing types
- **Error handling**: Interface throws errors; store layer converts to ErrorState

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] ConversationService interface provides all conversation CRUD operations (list, create, delete)
- [ ] **Rename operation**: Check if window.electronAPI.conversation.rename exists; if not, scope out of v1
- [ ] Message operations include list (no pagination), create, and delete methods
- [ ] ConversationAgent operations support full lifecycle (list, add, remove, update)
- [ ] sendToAgents method for triggering agent orchestration
- [ ] All methods return Promises with appropriate types
- [ ] Interface uses existing domain types (Message, Conversation, ConversationAgent)
- [ ] **CreateMessageInput**: Import existing type from @fishbowl-ai/shared (no redefinition)

### IPC Surface Alignment Checklist

- [ ] Method names exactly match window.electronAPI structure
- [ ] Verify: `conversations` vs `conversation` namespace consistency
- [ ] Confirm all methods exist on current electronAPI before defining interface
- [ ] Document any methods that need to be added to IPC layer
- [ ] Scope out methods not available in current IPC surface

### Technical Specifications

```typescript
import { CreateMessageInput } from "@fishbowl-ai/shared"; // Use existing type

export interface ConversationService {
  // Conversation operations - align with window.electronAPI.conversation.*
  listConversations(): Promise<Conversation[]>;
  createConversation(title?: string): Promise<Conversation>;
  // NOTE: Check if rename exists on electronAPI; scope out if not available
  renameConversation?(id: string, title: string): Promise<void>;
  deleteConversation(id: string): Promise<void>;

  // Message operations - align with window.electronAPI.message.*
  listMessages(conversationId: string): Promise<Message[]>;
  createMessage(input: CreateMessageInput): Promise<Message>; // Use existing type
  deleteMessage(id: string): Promise<void>;

  // ConversationAgent operations - align with window.electronAPI.conversationAgent.*
  listConversationAgents(conversationId: string): Promise<ConversationAgent[]>;
  addAgent(conversationId: string, agentId: string): Promise<ConversationAgent>;
  removeAgent(conversationId: string, agentId: string): Promise<void>;
  updateConversationAgent(
    conversationAgentId: string,
    updates: Partial<ConversationAgent>,
  ): Promise<ConversationAgent>;

  // Agent orchestration - align with window.electronAPI.chat.*
  sendToAgents(conversationId: string, userMessageId: string): Promise<void>;
}
```

### File Organization

- [ ] Interface definition in `packages/shared/src/services/conversations/ConversationService.ts`
- [ ] Import CreateMessageInput from existing location in @fishbowl-ai/shared
- [ ] Barrel export in `packages/shared/src/services/conversations/index.ts`
- [ ] Update main shared package index if needed

### Implementation Guidance

- **Exact IPC alignment**: Method names and signatures must match window.electronAPI exactly
- **Type reuse**: Import all types from existing locations, don't redefine
- **Error handling**: Interface throws errors (adapter converts platform errors to standard errors)
- **Name consistency**: Maintain careful alignment between interface and IPC methods
- **Scope management**: Only include methods that exist or will be added to IPC layer

### Testing Requirements

- [ ] Interface compiles without errors
- [ ] All method signatures match epic specifications and current IPC surface
- [ ] Types are properly imported from existing locations
- [ ] No platform-specific dependencies in the interface file
- [ ] Method names verified against actual window.electronAPI structure

### Security Considerations

- Interface methods should not expose internal implementation details
- Parameter validation will be handled by implementations, not the interface
- Error handling patterns should align with existing service patterns (not ErrorState)

### Performance Requirements

- Interface design should support efficient batching operations
- Method signatures should not prevent future optimization
- Simple types that compile quickly and don't impact build times

## Dependencies

- **Prerequisites**: None (foundational feature)
- **Type dependencies**: Existing CreateMessageInput, Message, Conversation, ConversationAgent types
- **IPC verification**: Validate against current window.electronAPI structure
- **Enables**: Desktop IPC adapter, domain store implementation, end-to-end wiring

## Implementation Notes

- This feature is purely interface definition - no implementation logic
- **Critical**: Verify method availability on window.electronAPI before including
- Focus on creating a clean contract that exactly matches current IPC surface
- Interface will be implemented by ConversationIpcAdapter in subsequent feature
- Store implementation will use this interface through dependency injection

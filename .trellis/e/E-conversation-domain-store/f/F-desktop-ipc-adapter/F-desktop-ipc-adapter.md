---
id: F-desktop-ipc-adapter
title: Desktop IPC Adapter Implementation
status: in-progress
priority: medium
parent: E-conversation-domain-store
prerequisites:
  - F-conversationservice-interface
affectedFiles:
  apps/desktop/src/renderer/services/ConversationIpcAdapter.ts:
    Created ConversationIpcAdapter class implementing ConversationService
    interface with conversation CRUD operations mapping to
    window.electronAPI.conversations methods. Includes proper error handling,
    type safety, and placeholder implementations for future operations.;
    Implemented message operations by replacing placeholder methods with actual
    IPC calls to window.electronAPI.messages.* methods. Added
    listMessages(conversationId), createMessage(input), and deleteMessage(id)
    implementations with proper error handling, type safety, and JSDoc
    documentation. Updated class-level JSDoc comment to include message
    operations in IPC method mapping section.
  apps/desktop/src/renderer/services/RendererProcessServices.ts:
    Added ConversationIpcAdapter as conversationService property with proper
    dependency injection in constructor, following established service container
    patterns.
  apps/desktop/src/renderer/services/index.ts: Added ConversationIpcAdapter to
    barrel exports for external accessibility and testing.
log: []
schema: v1.0
childrenIds:
  - T-implement-conversation-agent-1
  - T-implement-message-operations-1
  - T-implement-sendtoagents-method
  - T-create-conversationipcadapter
created: 2025-09-01T02:19:52.756Z
updated: 2025-09-01T02:19:52.756Z
---

## Purpose

Implement ConversationIpcAdapter in the desktop renderer process that wraps existing window.electronAPI calls using the ConversationService interface. This provides a clean platform boundary for future mobile implementation while maintaining exact method name alignment with IPC surface.

## Key Components

### ConversationIpcAdapter Class

- **Location**: `apps/desktop/src/renderer/services/ConversationIpcAdapter.ts`
- **Purpose**: Wrap existing window.electronAPI patterns with ConversationService interface
- **Error handling**: Throw standard errors (store layer converts to ErrorState)
- **Method alignment**: Exact match with window.electronAPI method names

### IPC Method Name Alignment Checklist

- [ ] Verify `window.electronAPI.conversation.*` vs `conversations.*` namespace
- [ ] Confirm method names: list, create, rename (if exists), delete
- [ ] Validate `window.electronAPI.message.*` method names
- [ ] Check `window.electronAPI.conversationAgent.*` method names
- [ ] Verify `window.electronAPI.chat.sendToAgents` signature

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] ConversationIpcAdapter implements ConversationService interface completely
- [ ] All conversation operations (list, create, delete) wrapped properly
- [ ] Rename operation only included if it exists on window.electronAPI
- [ ] Message operations (list, create, delete) use existing IPC endpoints
- [ ] ConversationAgent operations (list, add, remove, update) implemented
- [ ] sendToAgents method wraps window.electronAPI.chat.sendToAgents
- [ ] **Error model**: Adapter throws standard errors, doesn't expose ErrorState
- [ ] Type safety maintained for all operations

### IPC Method Name Verification Checklist

```typescript
// Verify these exact method names exist on window.electronAPI:
- window.electronAPI.conversation.list (or conversations.list?)
- window.electronAPI.conversation.create
- window.electronAPI.conversation.rename (check if exists)
- window.electronAPI.conversation.delete
- window.electronAPI.message.list
- window.electronAPI.message.create
- window.electronAPI.message.delete
- window.electronAPI.conversationAgent.list
- window.electronAPI.conversationAgent.add
- window.electronAPI.conversationAgent.remove
- window.electronAPI.conversationAgent.update
- window.electronAPI.chat.sendToAgents
```

### Technical Implementation

```typescript
export class ConversationIpcAdapter implements ConversationService {
  async listConversations(): Promise<Conversation[]> {
    // Verify exact method name: conversation vs conversations
    return await window.electronAPI.conversation.list();
  }

  async createMessage(input: CreateMessageInput): Promise<Message> {
    return await window.electronAPI.message.create(input);
  }

  // Error handling: throw standard errors, no ErrorState
  private handleError(error: unknown, operation: string): never {
    if (error instanceof Error) {
      throw new Error(`${operation}: ${error.message}`);
    }
    throw new Error(`${operation}: Unknown error`);
  }
}
```

### Error Handling Standards

- [ ] **No ErrorState in adapter**: Throw standard JavaScript errors only
- [ ] Store layer converts thrown errors to ErrorState patterns
- [ ] Meaningful error messages that include operation context
- [ ] Platform-specific errors converted to domain-appropriate messages
- [ ] No error state management in adapter layer

### File Organization

- [ ] Single adapter file: `apps/desktop/src/renderer/services/ConversationIpcAdapter.ts`
- [ ] Import ConversationService from @fishbowl-ai/shared
- [ ] Export for use in service initialization
- [ ] Follow existing desktop renderer service patterns

### Implementation Guidance

- **Exact IPC alignment**: Use current window.electronAPI methods without modification
- **Error simplicity**: Throw errors, don't manage ErrorState (store handles conversion)
- **Type mapping**: Ensure IPC response types match ConversationService interface exactly
- **Method name verification**: Double-check every method name against actual IPC surface
- **Simple implementation**: Direct method-to-method mapping, no complex logic

### Testing Requirements

- [ ] Adapter compiles without TypeScript errors
- [ ] All ConversationService methods implemented with correct names
- [ ] Error handling throws appropriate errors (not ErrorState)
- [ ] Can be instantiated and used in renderer process
- [ ] Methods properly await IPC responses
- [ ] Method names match window.electronAPI exactly

### Security Considerations

- [ ] No additional security surface introduced
- [ ] Use existing electronAPI security model
- [ ] Parameter validation deferred to main process
- [ ] No credential handling in adapter layer

### Performance Requirements

- [ ] Direct pass-through to IPC with minimal overhead
- [ ] Error handling doesn't impact performance
- [ ] No unnecessary data transformation
- [ ] Maintains existing IPC performance characteristics

## Dependencies

- **Prerequisites**: F-conversationservice-interface (ConversationService interface definition)
- **Platform requirements**: Electron renderer process, existing window.electronAPI
- **Type dependencies**: Existing Message, Conversation, ConversationAgent, CreateMessageInput types
- **Method verification**: Validate against actual window.electronAPI structure
- **Enables**: End-to-end wiring validation, domain store integration

## Integration Points

- **Service injection**: Designed for dependency injection into domain store
- **Error boundary**: Converts platform errors to standard errors (store converts to ErrorState)
- **Type bridge**: Ensures platform IPC types align with service interface
- **Testing seam**: Enables mocking for unit tests of domain logic

## Implementation Notes

- **Critical**: Verify every method name against actual window.electronAPI before implementation
- Keep implementation simple - direct method wrapping only
- Focus on type safety and standard error handling
- No business logic in adapter - pure platform translation layer
- Design for easy testing and future platform adapters

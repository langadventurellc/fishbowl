---
id: T-implement-sendtoagents-method
title: Implement sendToAgents method in ConversationIpcAdapter
status: open
priority: high
parent: F-desktop-ipc-adapter
prerequisites:
  - T-implement-conversation-agent-1
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T03:54:48.856Z
updated: 2025-09-01T03:54:48.856Z
---

## Purpose

Complete the ConversationIpcAdapter implementation by adding the sendToAgents method with exact IPC alignment and proper error handling.

## Context

Based on codebase analysis:

- `window.electronAPI.chat.sendToAgents(conversationId, userMessageId)` is the verified IPC signature
- Method signature exactly matches the ConversationService interface definition
- This is the final method needed to complete the adapter implementation

## Implementation Requirements

### sendToAgents Method Implementation

Add this final method to complete ConversationIpcAdapter class:

```typescript
// Verified IPC mapping:
- sendToAgents(conversationId, userMessageId) → window.electronAPI.chat.sendToAgents(conversationId, userMessageId)
```

### Method Specifications

- **Parameters**: `conversationId: string, userMessageId: string`
- **Return type**: `Promise<void>`
- **IPC call**: Direct pass-through to window.electronAPI.chat.sendToAgents
- **Error handling**: Follow existing adapter error handling patterns

### Integration Completion

- **Interface completion**: This completes all ConversationService interface methods
- **Full implementation**: Adapter now fully implements ConversationService interface
- **Type safety**: Ensure method signature exactly matches interface definition

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] sendToAgents method added to existing ConversationIpcAdapter class
- [ ] Method uses exact window.electronAPI.chat.sendToAgents call
- [ ] Parameters passed directly to IPC without transformation
- [ ] Method signature matches ConversationService interface exactly
- [ ] Returns Promise<void> as specified in interface

### Complete Implementation

- [ ] ConversationIpcAdapter now implements all ConversationService methods
- [ ] All conversation operations implemented (5 methods)
- [ ] All message operations implemented (3 methods)
- [ ] All conversation agent operations implemented (4 methods)
- [ ] sendToAgents method implemented (1 method)
- [ ] Total: 13 methods fully implementing ConversationService interface

### Code Quality

- [ ] Method added to existing class structure (no new file)
- [ ] Consistent with all other adapter method implementations
- [ ] Proper async/await usage for chat orchestration
- [ ] No business logic - pure IPC translation layer
- [ ] Clear parameter and return type annotations

### Error Handling Consistency

- [ ] Follows same error handling pattern as other adapter methods
- [ ] Throws standard errors with operation context
- [ ] No ErrorState management in adapter layer
- [ ] Meaningful error messages for chat orchestration failures

### Testing Requirements

- [ ] sendToAgents method compiles without TypeScript errors
- [ ] Method properly returns Promise<void> matching interface
- [ ] Can be called with string parameters as expected
- [ ] Complete adapter compiles and implements interface fully

## Out of Scope

- Chat orchestration logic (handled by main process)
- Agent response handling (handled by event system)
- Chat state management (handled by store layer)
- Optimistic UI updates (handled by store layer)

## Implementation Notes

- **Final method**: Completes the ConversationIpcAdapter implementation
- **Direct mapping**: Simple pass-through to window.electronAPI.chat.sendToAgents
- **Interface completion**: Enables full ConversationService interface usage
- **Clean boundary**: Provides platform abstraction for chat orchestration

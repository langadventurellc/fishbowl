---
id: T-implement-conversation-agent-1
title: Implement conversation agent operations in ConversationIpcAdapter
status: open
priority: medium
parent: F-desktop-ipc-adapter
prerequisites:
  - T-implement-message-operations-1
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T03:54:27.928Z
updated: 2025-09-01T03:54:27.928Z
---

## Purpose

Add conversation agent operations to the existing ConversationIpcAdapter class with exact IPC method alignment.

## Context

Based on codebase analysis, conversation agent operations use:

- `window.electronAPI.conversationAgent.*` for all agent operations
- Methods use object parameters that need transformation to string parameters
- Interface design transforms complex parameters to simpler string-based interface

## Implementation Requirements

### Conversation Agent Operations Implementation

Add these exact methods to existing ConversationIpcAdapter class:

```typescript
// Verified IPC mappings with parameter transformation:
- listConversationAgents(conversationId) → window.electronAPI.conversationAgent.getByConversation(conversationId)
- addAgent(conversationId, agentId) → window.electronAPI.conversationAgent.add({conversation_id: conversationId, agent_id: agentId})
- removeAgent(conversationId, agentId) → window.electronAPI.conversationAgent.remove({conversation_id: conversationId, agent_id: agentId})
- updateConversationAgent(conversationAgentId, updates) → window.electronAPI.conversationAgent.update({conversationAgentId, updates})
```

### Parameter Transformation Requirements

- **addAgent**: Transform `(conversationId, agentId)` to `{conversation_id, agent_id}` object
- **removeAgent**: Transform `(conversationId, agentId)` to `{conversation_id, agent_id}` object
- **updateConversationAgent**: Transform `(conversationAgentId, updates)` to `{conversationAgentId, updates}` object
- **listConversationAgents**: Direct parameter pass-through

### Type Requirements

- **Import types**: ConversationAgent from shared package
- **Parameter types**: Use Partial<ConversationAgent> for updates parameter
- **Return types**: Ensure ConversationAgent[] and ConversationAgent types match exactly
- **Object parameters**: Transform simple parameters to IPC object format

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] Four conversation agent methods added to existing ConversationIpcAdapter class
- [ ] All methods use verified window.electronAPI.conversationAgent.\* calls
- [ ] listConversationAgents uses getByConversation method correctly
- [ ] addAgent transforms parameters to {conversation_id, agent_id} object
- [ ] removeAgent transforms parameters to {conversation_id, agent_id} object
- [ ] updateConversationAgent transforms parameters to {conversationAgentId, updates} object
- [ ] Type safety maintained for all agent operations

### Code Quality

- [ ] Methods added to existing class structure (no new file)
- [ ] Consistent with conversation and message operations implementation
- [ ] Proper parameter transformation from interface to IPC format
- [ ] No business logic - pure IPC translation layer
- [ ] Clear parameter transformation and return type annotations

### Parameter Transformation

- [ ] addAgent correctly maps (conversationId, agentId) → {conversation_id, agent_id}
- [ ] removeAgent correctly maps (conversationId, agentId) → {conversation_id, agent_id}
- [ ] updateConversationAgent correctly maps (id, updates) → {conversationAgentId, updates}
- [ ] Parameter names match exact IPC expectations (conversation_id vs conversationId)

### Testing Requirements

- [ ] All agent methods compile without TypeScript errors
- [ ] Methods properly return Promise types matching interface
- [ ] Parameter transformation works correctly with IPC layer
- [ ] updateConversationAgent accepts Partial<ConversationAgent> updates correctly

## Out of Scope

- sendToAgents method (separate task)
- Agent validation logic (handled by main process)
- Agent state management (handled by store layer)
- Business logic for agent operations (pure adapter only)

## Implementation Notes

- **Parameter mapping critical**: IPC expects object parameters, interface uses strings
- **Method name alignment**: Use exact verified conversationAgent.\* method names
- **Type consistency**: Ensure ConversationAgent type matches shared package definitions
- **Object transformation**: Transform simple parameters to expected IPC object format

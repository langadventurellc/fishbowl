---
id: T-create-conversationipcadapter
title: Create ConversationIpcAdapter class foundation with conversation operations
status: open
priority: high
parent: F-desktop-ipc-adapter
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T03:53:49.285Z
updated: 2025-09-01T03:53:49.285Z
---

## Purpose

Create the ConversationIpcAdapter class foundation and implement all conversation CRUD operations with exact IPC method name alignment.

## Context

Based on codebase analysis, the IPC surface uses:

- `window.electronAPI.conversations.*` (plural) for conversation operations
- Rename operation actually uses `update` method, not `rename`
- All methods return promises and follow existing error handling patterns

## Implementation Requirements

### File Creation

- **Location**: `apps/desktop/src/renderer/services/ConversationIpcAdapter.ts`
- **Import ConversationService**: From `@fishbowl-ai/shared`
- **Class structure**: Export class implementing ConversationService interface

### Conversation Operations Implementation

Implement these exact methods with verified IPC alignment:

```typescript
// Verified IPC mappings:
- listConversations() → window.electronAPI.conversations.list()
- getConversation(id) → window.electronAPI.conversations.get(id)
- createConversation(title?) → window.electronAPI.conversations.create(title)
- renameConversation(id, title) → window.electronAPI.conversations.update(id, {title})
- deleteConversation(id) → window.electronAPI.conversations.delete(id)
```

### Error Handling Standards

- **No ErrorState in adapter**: Throw standard JavaScript errors only
- **Store layer converts**: Thrown errors to ErrorState patterns later
- **Meaningful messages**: Include operation context in error messages
- **Pattern**: `throw new Error(\`\${operation}: \${error.message}\`);`

### Type Safety Requirements

- Use existing Conversation type from shared package
- Ensure IPC response types match interface expectations exactly
- All methods properly await IPC responses
- TypeScript compilation without errors

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] ConversationIpcAdapter class created and exports properly
- [ ] Implements ConversationService interface partially (conversation methods only)
- [ ] All 5 conversation methods implemented with exact IPC alignment
- [ ] Methods use verified window.electronAPI.conversations.\* calls
- [ ] renameConversation correctly maps to update method with title parameter
- [ ] Type safety maintained for all conversation operations

### Code Quality

- [ ] Follow existing desktop renderer service patterns
- [ ] Clear, readable method implementations
- [ ] Proper async/await usage throughout
- [ ] No business logic - pure IPC translation layer
- [ ] Methods properly typed with ConversationService interface

### Error Handling

- [ ] Standard error throwing (no ErrorState management in adapter)
- [ ] Platform-specific errors converted to meaningful messages
- [ ] Operation context included in error messages
- [ ] No error state management in adapter layer

## Testing Requirements

- [ ] Adapter compiles without TypeScript errors
- [ ] Can be instantiated in renderer process context
- [ ] All conversation methods callable with correct signatures
- [ ] Methods properly return Promise types matching interface

## Out of Scope

- Message operations (separate task)
- ConversationAgent operations (separate task)
- sendToAgents method (separate task)
- Complex error state management (handled by store layer)
- Business logic or validation (pure adapter only)

## Implementation Notes

- **Keep simple**: Direct method-to-method mapping only
- **IPC alignment critical**: Use exact verified method names
- **Error simplicity**: Throw errors, don't manage state
- **Type bridge**: Ensure platform IPC types align with service interface

---
id: T-add-conversation-agent
title: Add conversation agent methods to preload bridge API
status: open
priority: high
parent: F-service-layer-and-ipc
prerequisites:
  - T-create-ipc-handlers-for
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T04:37:09.557Z
updated: 2025-08-25T04:37:09.557Z
---

# Add conversation agent methods to preload bridge API

## Context

Extend the Electron preload bridge to expose conversation agent operations to the renderer process. This provides the type-safe API that the renderer will use to interact with conversation agents.

## Technical Approach

Follow the exact pattern established by existing preload methods (conversations, settings, etc.) to maintain consistency and type safety.

## Implementation Requirements

### Preload Bridge Extension

Extend the electronAPI object in `apps/desktop/src/electron/preload.ts` with a conversationAgent namespace:

```typescript
conversationAgent: {
  getByConversation: async (conversationId: string): Promise<ConversationAgentViewModel[]> => {
    // Implementation following existing patterns
  },
  add: async (input: { conversationId: string; agentId: string }): Promise<ConversationAgentViewModel> => {
    // Implementation following existing patterns
  },
  remove: async (input: { conversationId: string; agentId: string }): Promise<void> => {
    // Implementation following existing patterns
  },
}
```

### Method Implementation Details

1. **`getByConversation(conversationId: string)`**
   - Validate conversationId parameter (non-empty string)
   - Call IPC channel `conversationAgent:getByConversation`
   - Handle response validation (success/error pattern)
   - Return ConversationAgentViewModel[] or throw meaningful error
   - Include try/catch with logger.error for IPC communication failures

2. **`add(input: { conversationId: string; agentId: string })`**
   - Validate input object structure and required fields
   - Call IPC channel `conversationAgent:add` with input
   - Handle response validation and error cases
   - Return ConversationAgentViewModel or throw error
   - Log errors with context (conversationId, agentId)

3. **`remove(input: { conversationId: string; agentId: string })`**
   - Validate input object structure and required fields
   - Call IPC channel `conversationAgent:remove` with input
   - Handle response validation and error cases
   - Return void on success or throw error
   - Log errors with context (conversationId, agentId)

### Error Handling Pattern

Follow the exact error handling pattern used by existing preload methods:

```typescript
try {
  const response = (await ipcRenderer.invoke(
    CHANNEL_NAME,
    request,
  )) as ResponseType;
  if (!response.success) {
    throw new Error(response.error?.message || "Operation failed");
  }
  return response.data!;
} catch (error) {
  logger.error(
    "Error description",
    error instanceof Error ? error : new Error(String(error)),
  );
  throw error instanceof Error
    ? error
    : new Error("Failed to communicate with main process");
}
```

### TypeScript Type Integration

Update the ElectronAPI interface in the appropriate types file to include:

```typescript
conversationAgent: {
  getByConversation(conversationId: string): Promise<ConversationAgentViewModel[]>;
  add(input: { conversationId: string; agentId: string }): Promise<ConversationAgentViewModel>;
  remove(input: { conversationId: string; agentId: string }): Promise<void>;
};
```

### Channel Constants Import

Import and use the channel constants from the IPC types:

```typescript
import { CONVERSATION_AGENT_CHANNELS } from "@fishbowl-ai/shared";
```

### Input Validation

Each method should include basic input validation:

- Check for required parameters
- Validate parameter types
- Ensure non-empty string values where appropriate
- Provide clear error messages for validation failures

## Unit Tests

Create comprehensive test suite at `apps/desktop/src/electron/__tests__/preload.conversationAgent.test.ts`:

- **Method registration**: Verify all three methods exist on electronAPI.conversationAgent
- **getByConversation tests**:
  - Successfully returns agent array from IPC
  - Handles empty results correctly
  - Throws appropriate error for IPC failures
  - Validates conversationId parameter
- **add tests**:
  - Successfully adds agent and returns populated data
  - Validates input object structure
  - Handles IPC errors with proper error transformation
  - Logs errors with appropriate context
- **remove tests**:
  - Successfully removes agent (void return)
  - Validates input object structure
  - Handles IPC errors appropriately
  - Returns void on successful removal
- **Error handling tests**: Verify proper error transformation for all IPC failure scenarios
- **Type safety tests**: Ensure proper TypeScript typing throughout

Follow the test structure from existing preload test files.

## Dependencies

- IPC channel constants from conversationAgent types
- ConversationAgentViewModel type definitions
- IPC request/response types (from previous task)
- Existing preload infrastructure and logger
- ElectronAPI type definitions

## Acceptance Criteria

- [ ] conversationAgent namespace added to electronAPI object
- [ ] All three methods implemented with proper signatures
- [ ] Input validation for all parameters
- [ ] Consistent error handling following existing patterns
- [ ] Proper TypeScript typing integration
- [ ] Channel constants used (not hardcoded strings)
- [ ] Comprehensive logging for errors
- [ ] Complete unit test suite covering all methods and error cases
- [ ] ElectronAPI interface updated with new namespace
- [ ] Follows exact patterns from existing preload methods

## Implementation Notes

- Must follow the exact error handling pattern from existing methods
- Input validation should be lightweight (basic type/presence checks)
- Error messages should be user-friendly and informative
- Logger context should include relevant IDs for debugging
- Type safety is critical for renderer process integration
- The preload bridge is the security boundary between main and renderer processes

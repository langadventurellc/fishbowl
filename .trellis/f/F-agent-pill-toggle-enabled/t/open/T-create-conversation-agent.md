---
id: T-create-conversation-agent
title: Create conversation agent update request and response types
status: open
priority: medium
parent: F-agent-pill-toggle-enabled
prerequisites:
  - T-add-update-channel-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T03:58:19.628Z
updated: 2025-08-29T03:58:19.628Z
---

# Create conversation agent update request and response types

## Context

To support the UPDATE IPC channel, we need request and response type definitions that follow the existing patterns in the conversation agent IPC system.

## Technical Approach

1. Create `ConversationAgentUpdateRequest` interface extending or using existing update input types
2. Create `ConversationAgentUpdateResponse` interface following the `IPCResponse<T>` pattern
3. Follow existing patterns from other request/response pairs (e.g., Add, Remove)

## Specific Implementation Requirements

### Request Type (`conversationAgentUpdateRequest.ts`)

- Interface that includes conversation agent ID and fields to update
- Should leverage existing `UpdateConversationAgentInput` type from shared package
- Include proper JSDoc documentation with examples

### Response Type (`conversationAgentUpdateResponse.ts`)

- Interface extending `IPCResponse<ConversationAgent>`
- Follow the success/failure pattern used by other response types
- Include proper JSDoc documentation

## Acceptance Criteria

- [ ] `ConversationAgentUpdateRequest` interface created
- [ ] `ConversationAgentUpdateResponse` interface created
- [ ] Both files follow existing naming and structure conventions
- [ ] Types properly imported and exported
- [ ] Unit tests pass and TypeScript compilation succeeds
- [ ] JSDoc documentation included

## Files to Create

- `apps/desktop/src/shared/ipc/conversationAgents/conversationAgentUpdateRequest.ts`
- `apps/desktop/src/shared/ipc/conversationAgents/conversationAgentUpdateResponse.ts`

## Dependencies

- Prerequisite: UPDATE channel constant must exist
- Must use existing `UpdateConversationAgentInput` and `IPCResponse<T>` types

## Testing Requirements

- Unit tests to verify type definitions are correct
- Verify imports and exports work properly
- Test TypeScript type checking

## Out of Scope

- Do not implement the actual IPC handler
- Do not modify the repository or shared types

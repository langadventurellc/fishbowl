---
id: T-add-conversations-types-to
title: Add conversations types to IPC barrel export
status: open
priority: medium
parent: F-ipc-channel-constants-and
prerequisites:
  - T-create-conversations-ipc
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T00:03:20.884Z
updated: 2025-08-24T00:03:20.884Z
---

# Add conversations types to IPC barrel export

## Context

Update the shared IPC index file to export all conversation-related constants and types, making them easily accessible throughout the desktop application.

**Reference File**: `apps/desktop/src/shared/ipc/index.ts`

## Implementation Requirements

### 1. Update Barrel Export

- Add conversations constants export to `apps/desktop/src/shared/ipc/index.ts`
- Follow the existing pattern used for agents, llmModels, etc.

### 2. Export Pattern

```typescript
// Conversations constants
export { CONVERSATION_CHANNELS } from "./conversationsConstants";
export type { ConversationsChannelType } from "./conversationsConstants";

// Conversations request types
export type {
  ConversationsCreateRequest,
  ConversationsListRequest,
  ConversationsGetRequest,
  ConversationsUpdateRequest,
  ConversationsDeleteRequest,
} from "./conversationsConstants";

// Conversations response types
export type {
  ConversationsCreateResponse,
  ConversationsListResponse,
  ConversationsGetResponse,
  ConversationsUpdateResponse,
  ConversationsDeleteResponse,
} from "./conversationsConstants";
```

### 3. Organization

- Add conversations exports after existing IPC exports
- Group constants, request types, and response types logically
- Include descriptive comments matching existing pattern

## Detailed Acceptance Criteria

- [ ] All conversation constants exported from barrel file
- [ ] All request types exported with proper `type` keyword
- [ ] All response types exported with proper `type` keyword
- [ ] ConversationsChannelType union exported
- [ ] Comments added following existing format
- [ ] Exports organized consistently with existing patterns
- [ ] No breaking changes to existing exports

## Dependencies

- Completed `T-create-conversations-ipc` task
- Existing IPC barrel file structure
- TypeScript compilation without errors

## Testing Requirements

- Unit tests verifying:
  - All types importable from `apps/desktop/src/shared/ipc/index`
  - No circular dependency issues
  - TypeScript compilation succeeds
  - Existing exports still work
  - Conversation types accessible in other modules

## Technical Notes

Follow the exact grouping and commenting pattern from existing IPC exports:

- Comment sections for different export categories
- Consistent spacing and organization
- Type-only exports use `export type` syntax
- Constant exports use regular `export`

## Security Considerations

- Verify no sensitive types are exposed
- Maintain module boundary separation
- No implementation details leaked through types

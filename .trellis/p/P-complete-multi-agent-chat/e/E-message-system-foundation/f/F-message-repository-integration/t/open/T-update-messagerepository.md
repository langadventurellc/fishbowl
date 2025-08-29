---
id: T-update-messagerepository
title: Update MessageRepository query ordering for stable message retrieval
status: open
priority: high
parent: F-message-repository-integration
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T18:43:14.148Z
updated: 2025-08-29T18:43:14.148Z
---

# Update MessageRepository Query Ordering

## Context

The MessageRepository's `getByConversation()` method currently uses `ORDER BY created_at ASC` but needs stable ordering to prevent message reordering when multiple messages have the same timestamp. The feature specification requires `ORDER BY created_at ASC, id ASC` for consistent message display.

## Implementation Requirements

### Update Query in MessageRepository

Update the SQL query in `getByConversation()` method:

```typescript
// Current query in packages/shared/src/repositories/messages/MessageRepository.ts
const sql = `
  SELECT id, conversation_id, conversation_agent_id, role, content, included, created_at
  FROM messages
  WHERE conversation_id = ?
  ORDER BY created_at ASC, id ASC
`;
```

### Update Unit Tests

Update existing unit tests in `packages/shared/src/repositories/messages/__tests__/MessageRepository.test.ts` to:

- Verify the new ordering behavior with test messages having identical timestamps
- Ensure messages with same `created_at` are ordered by `id ASC`
- Test with realistic message data scenarios

## Detailed Acceptance Criteria

**GIVEN** multiple messages in a conversation with identical timestamps
**WHEN** `getByConversation(conversationId)` is called  
**THEN** messages should be returned sorted first by `created_at ASC`, then by `id ASC`

**GIVEN** a conversation with messages at different timestamps
**WHEN** fetching messages via the repository
**THEN** chronological order should be maintained with stable secondary sorting

**GIVEN** the updated query implementation
**WHEN** running existing unit tests
**THEN** all tests should pass with the new ordering behavior

## Testing Requirements

- Update unit tests to create scenarios with identical timestamps
- Verify stable ordering works correctly
- Ensure existing functionality remains intact
- Test edge cases: single message, empty conversation, mixed timestamps

## Out of Scope

- Database index modifications (explicitly excluded)
- Performance optimizations
- Changes to other repository methods
- IPC layer modifications (handled by prerequisite feature)

## Dependencies

- No blocking dependencies
- This change supports the completed F-messages-ipc-bridge feature

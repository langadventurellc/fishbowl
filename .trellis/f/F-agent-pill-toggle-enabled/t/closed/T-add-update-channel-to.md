---
id: T-add-update-channel-to
title: Add UPDATE channel to conversation agent IPC constants
status: done
priority: medium
parent: F-agent-pill-toggle-enabled
prerequisites: []
affectedFiles:
  apps/desktop/src/shared/ipc/conversationAgentsConstants.ts: Added UPDATE channel constant following naming pattern
  apps/desktop/src/shared/ipc/__tests__/conversationAgentsIPC.test.ts:
    Updated tests to validate UPDATE channel and adjusted expected channel count
    from 4 to 5
log:
  - Successfully added UPDATE channel to conversation agent IPC constants
    following established patterns. Added "conversationAgent:update" channel
    constant and updated comprehensive test suite to validate the new channel.
    All quality checks pass and the implementation maintains type safety and
    consistency with existing code.
schema: v1.0
childrenIds: []
created: 2025-08-29T03:58:05.396Z
updated: 2025-08-29T03:58:05.396Z
---

# Add UPDATE channel to conversation agent IPC constants

## Context

The conversation agent system currently supports GET_BY_CONVERSATION, ADD, REMOVE, and LIST channels. To support toggling the enabled state of agents, we need to add an UPDATE channel to the existing IPC infrastructure.

## Technical Approach

1. Add UPDATE channel to `CONVERSATION_AGENT_CHANNELS` constant in `apps/desktop/src/shared/ipc/conversationAgentsConstants.ts`
2. Follow the existing naming pattern: `"conversationAgent:update"`
3. Ensure type safety by updating the `ConversationAgentChannelType` if needed

## Specific Implementation Requirements

- Add `UPDATE: "conversationAgent:update"` to the `CONVERSATION_AGENT_CHANNELS` object
- Maintain consistency with existing channel naming conventions
- Include unit tests to verify the channel constant is correctly defined

## Acceptance Criteria

- [ ] UPDATE channel added to CONVERSATION_AGENT_CHANNELS
- [ ] Channel follows existing naming pattern ("conversationAgent:update")
- [ ] Type definitions updated if necessary
- [ ] Unit tests pass for the updated constants

## Files to Modify

- `apps/desktop/src/shared/ipc/conversationAgentsConstants.ts`

## Dependencies

None - this is foundational work for other tasks

## Testing Requirements

- Unit test to verify UPDATE channel exists and has correct value
- Verify TypeScript compilation passes without errors

## Out of Scope

- Do not implement the actual handler - that's handled by another task
- Do not create request/response types - separate tasks handle those

---
id: T-implement-no-agents-enabled
title: Implement no agents enabled handling with system message
status: open
priority: medium
parent: F-message-input-integration
prerequisites:
  - T-create-integrated-message
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-30T03:55:02.260Z
updated: 2025-08-30T03:55:02.260Z
---

# Implement No Agents Enabled Handling with System Message

## Context

When users have disabled all conversation agents, the system should still save their message but display a helpful system message explaining that no agents are enabled. This provides clear feedback and guidance for users who might not realize why they're not getting responses.

## Specific Implementation Requirements

### Detection Logic

- **Check for Enabled Agents**: Determine if any agents are enabled for the current conversation
- **Integration Point**: Add this logic to the `MessageInputContainer` created in the previous task
- **Agent State Source**: Use existing agent management state/hooks to check enabled status

### Message Flow Modification

- **Save User Message**: Always save the user's message to the conversation (even with no agents)
- **Skip Agent Invocation**: Do not trigger any LLM provider calls when no agents are enabled
- **Create System Message**: Automatically create a system message with helpful guidance
- **Preserve UX**: Keep normal input clearing and success feedback

### System Message Content

- **Message Text**: "No agents are enabled for this conversation"
- **Call to Action**: Include guidance on how to enable agents
- **Message Type**: Create as `role: "system"` message
- **Styling Context**: System messages should have distinct visual styling in the chat

### Technical Implementation

- **Location**: Add logic to `MessageInputContainer.tsx` after successful user message creation
- **Conditional Logic**: Check agent enabled status before/after user message creation
- **System Message Creation**: Use same `useCreateMessage` hook with `role: "system"`
- **Error Handling**: Handle case where system message creation also fails

## Detailed Acceptance Criteria

### No Agents Detection

- **GIVEN** user is in a conversation with no enabled agents
- **WHEN** the component loads or agent status changes
- **THEN** it should detect the no-agents state correctly

### User Message Saving

- **GIVEN** user types and sends a message with no agents enabled
- **WHEN** the message is submitted
- **THEN** it should:
  - Save the user message to the conversation successfully
  - Clear the input field normally
  - Not show any error states for the user message

### System Message Creation

- **GIVEN** user message was saved successfully and no agents are enabled
- **WHEN** the user message creation completes
- **THEN** it should:
  - Immediately create a system message with text: "No agents are enabled for this conversation"
  - Include helpful guidance about enabling agents
  - Display the system message in the chat interface

### Agent Invocation Prevention

- **GIVEN** no agents are enabled for the conversation
- **WHEN** user sends a message
- **THEN** it should:
  - Not trigger any LLM provider API calls
  - Not update any agent thinking states in `useChatStore`
  - Not attempt to process the message through the chat engine

### Error Handling

- **GIVEN** system message creation fails
- **WHEN** attempting to create the "no agents enabled" message
- **THEN** it should:
  - Log the error appropriately
  - Not block the user message from being saved
  - Not show user-facing errors (since user message succeeded)

## Dependencies on Other Tasks

- **Requires**: T-create-integrated-message (needs the integrated container to add this logic to)

## Research Required

Before implementation, determine:

- **How to check if agents are enabled**: Find existing agent state management in the codebase
- **Agent management UI location**: For including in the system message guidance

## Testing Requirements (Include in Same Task)

- **Unit tests** for no agents handling:
  - Detection of no enabled agents
  - User message saving with no agents
  - System message creation after user message
  - Prevention of agent invocation
  - Error handling for system message failures
- **Test file**: Add tests to existing `MessageInputContainer.test.tsx`
- **Mock strategy**: Mock agent state management hooks/stores

## Technical Implementation Pattern

```typescript
// Pseudo-code for the logic to add to MessageInputContainer
const handleSendMessage = async (content: string) => {
  // Save user message (always)
  const userMessage = await createMessage({
    conversation_id: conversationId,
    role: "user",
    content: content,
  });

  // Check if agents are enabled
  const enabledAgents = getEnabledAgents(conversationId);

  if (enabledAgents.length === 0) {
    // Create system message
    await createMessage({
      conversation_id: conversationId,
      role: "system",
      content:
        "No agents are enabled for this conversation. Enable agents to start receiving responses.",
    });
    return; // Don't invoke chat engine
  }

  // Normal flow: invoke chat engine for agent responses
  // (This logic may be handled elsewhere in the system)
};
```

## Out of Scope

- **Agent management UI changes** - Only message handling, not enabling/disabling agents
- **Chat engine modifications** - Focus on input component behavior only
- **Advanced system message styling** - Use existing system message display patterns

## Files to Modify

- **Modify**: `apps/desktop/src/components/input/MessageInputContainer.tsx`
- **Modify**: `apps/desktop/src/components/input/__tests__/MessageInputContainer.test.tsx`

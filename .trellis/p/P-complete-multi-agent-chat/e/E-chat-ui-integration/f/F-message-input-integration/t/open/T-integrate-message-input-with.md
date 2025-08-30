---
id: T-integrate-message-input-with
title: Integrate message input with chat orchestration engine
status: open
priority: high
parent: F-message-input-integration
prerequisites:
  - T-create-integrated-message
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-30T03:55:43.718Z
updated: 2025-08-30T03:55:43.718Z
---

# Integrate Message Input with Chat Orchestration Engine

## Context

After a user message is successfully created, the system needs to trigger the multi-agent chat orchestration to generate responses from all enabled agents. This task connects the message input component to the chat engine that coordinates agent responses and manages the `useChatStore` state during processing.

## Specific Implementation Requirements

### Chat Engine Integration

- **Trigger Point**: After successful user message creation and when agents are enabled
- **Integration Method**: Call the existing chat orchestration service/hook
- **State Management**: Ensure `useChatStore` is properly updated during orchestration

### Research Required First

Before implementation, identify:

- **Existing chat orchestration service**: Find the service that handles multi-agent processing
- **Orchestration trigger method**: Determine the correct function/hook to call
- **State integration**: Verify how orchestration updates `useChatStore.sendingMessage` and agent thinking states

### Expected Integration Pattern

Based on the epic description, the integration should:

- **Call chat orchestration** after user message creation
- **Update global state** via `useChatStore` during processing
- **Handle orchestration errors** gracefully without affecting user message
- **Maintain input responsiveness** during multi-agent processing

## Detailed Acceptance Criteria

### Orchestration Triggering

- **GIVEN** user sends a message and agents are enabled for the conversation
- **WHEN** the user message is successfully created
- **THEN** it should:
  - Trigger the chat orchestration engine for the conversation
  - Pass the conversation ID to the orchestration system
  - Continue normal UI flow (input clearing, etc.)

### State Management During Processing

- **GIVEN** chat orchestration is triggered
- **WHEN** agents begin processing
- **THEN** it should:
  - Ensure `useChatStore.sendingMessage` is set to `true`
  - Allow individual agent thinking states to be managed by orchestration
  - Keep the send button disabled during processing
  - Allow continued typing in the input field

### Orchestration Error Handling

- **GIVEN** chat orchestration fails to start
- **WHEN** the orchestration trigger encounters an error
- **THEN** it should:
  - Log the error appropriately
  - Not affect the user message (which was already saved)
  - Allow user to try sending another message
  - Show appropriate error feedback (if user-facing errors are needed)

### Orchestration Completion

- **GIVEN** all agents have completed processing
- **WHEN** chat orchestration finishes
- **THEN** it should:
  - Ensure `useChatStore.sendingMessage` returns to `false`
  - Re-enable the send button automatically
  - Clear any processing states appropriately

## Research Tasks (Complete Before Implementation)

### 1. Identify Chat Orchestration Service

- **Search for**: Chat orchestration, multi-agent processing service
- **Look for**: Services that handle agent response coordination
- **Key files**: Services that manage chat engine state and agent processing

### 2. Determine Integration Method

- **Find**: The correct function/hook to trigger multi-agent processing
- **Understand**: Parameter requirements (conversation ID, message context, etc.)
- **Verify**: Error handling patterns used by the orchestration system

### 3. Verify State Integration

- **Confirm**: How orchestration service updates `useChatStore`
- **Check**: If any additional state management is needed in the input component
- **Ensure**: Proper cleanup if orchestration is cancelled or fails

## Implementation Approach

### Add to MessageInputContainer

- **Location**: `apps/desktop/src/components/input/MessageInputContainer.tsx`
- **Integration point**: After successful user message creation and agent enablement check
- **Method**: Import and use the chat orchestration service/hook

### Error Boundary Considerations

- **Isolation**: Orchestration failures should not break the input component
- **User Experience**: Input remains functional even if orchestration fails
- **Logging**: Comprehensive error logging for debugging orchestration issues

## Testing Requirements (Include in Same Task)

### Unit Tests

- **Integration**: Test that orchestration is triggered after user message creation
- **State management**: Verify proper state updates during processing
- **Error handling**: Test orchestration failure scenarios
- **Agent enabling**: Test that orchestration only triggers when agents are enabled

### Test Strategy

- **Mock orchestration service**: Use Jest mocks for the orchestration calls
- **State verification**: Check `useChatStore` state changes during test scenarios
- **Error simulation**: Test various orchestration failure modes

## Dependencies on Other Tasks

- **Requires**: T-create-integrated-message (needs the integrated container)
- **Coordinates with**: T-implement-no-agents-enabled (should not trigger when no agents)

## Files to Research

- Look for files related to:
  - Chat orchestration service
  - Multi-agent processing
  - Chat engine coordination
  - Services that update `useChatStore`

## Files to Modify (After Research)

- **Modify**: `apps/desktop/src/components/input/MessageInputContainer.tsx`
- **Modify**: `apps/desktop/src/components/input/__tests__/MessageInputContainer.test.tsx`
- **Import**: Chat orchestration service (to be identified)

## Out of Scope

- **Orchestration service modifications** - Use existing orchestration as-is
- **Agent response handling** - Handled by existing orchestration system
- **Chat display updates** - Handled by other components/features
- **Advanced orchestration configuration** - Use default orchestration behavior

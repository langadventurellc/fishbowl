---
id: F-delete-conversation-agent
title: Delete Conversation Agent with Confirmation
status: in-progress
priority: medium
parent: none
prerequisites: []
affectedFiles:
  packages/shared/src/repositories/messages/MessageRepository.ts:
    Added deleteByConversationAgentId method with UUID validation, parameterized
    SQL DELETE query, error handling, and logging
  packages/shared/src/repositories/messages/__tests__/MessageRepository.test.ts:
    Added comprehensive unit test suite for deleteByConversationAgentId method
    and updated constructor test to include new method
log: []
schema: v1.0
childrenIds:
  - T-add-delete-confirmation
  - T-add-explicit-message-refresh
  - T-add-message-deletion-method
  - T-add-ondelete-prop-to
  - T-implement-x-button-and-delete
  - T-update-ipc-handler-for
created: 2025-09-05T16:52:11.785Z
updated: 2025-09-05T16:52:11.785Z
---

# Delete Conversation Agent Feature

## Purpose and Functionality

Implement a delete functionality for conversation agents that allows users to remove agents from conversations through an X button that appears on hover over agent pills. The feature includes confirmation dialog with clear messaging about both agent removal and message deletion, followed by hard deletion of the conversation agent and all their messages from the database.

## Key Components to Implement

### 1. Enhanced AgentPill Component

- Add X button that appears on hover over the right side of the agent pill
- Implement careful click event handling to prevent conflicts with existing enable/disable toggle
- Add new optional `onDelete` prop to the `AgentPillProps` interface
- Maintain all existing functionality and visual states

### 2. Delete Confirmation Dialog

- Utilize existing `ConfirmationDialog` component (`apps/desktop/src/components/ui/confirmation-dialog.tsx`)
- Display clear messaging about both agent removal AND message deletion consequences
- Use destructive variant styling to indicate severity of action
- Handle loading states during deletion process

### 3. Backend Message Deletion Implementation

- **Option B (Preferred)**: Add `MessageRepository.deleteByConversationAgentId(conversationAgentId: string)` method
- Update `apps/desktop/src/electron/conversationAgentHandlers.ts` to perform two-step deletion:
  1. Find conversation agent by `conversation_id` + `agent_id`
  2. Delete all messages with that `conversation_agent_id`
  3. Delete the conversation agent record
- Maintain existing IPC contract and service patterns

### 4. Store Integration

- Continue using existing `ConversationService.removeAgent(conversationId, agentId)` method
- No new store method needed - leverage existing `useConversationStore.removeAgent()`
- Add explicit message refresh after successful deletion via `refreshActiveConversation()`
- Handle proper error states and loading indicators

### 5. Container Display Integration

- Update `AgentLabelsContainerDisplay` to wire up delete functionality
- Pass delete handler down to individual `AgentPill` components
- Manage confirmation dialog state at container level

## Detailed Acceptance Criteria

### Functional Behavior

- **MUST** display X button on right side of agent pill only when hovering over the pill
- **MUST** trigger delete confirmation dialog when X button is clicked
- **MUST** prevent enable/disable toggle when X button area is clicked (event.stopPropagation())
- **MUST** allow enable/disable toggle when main pill area (left ~80%) is clicked
- **MUST** perform hard deletion of conversation agent and all related messages from database
- **MUST** refresh both agent list AND message list after successful deletion
- **MUST** update UI immediately after successful deletion (remove agent pill from display)
- **MUST** display loading state during deletion process
- **MUST** display appropriate error messages if deletion fails

### User Interface Requirements

- **X button positioning**: Right-aligned within pill, ~16px from right edge
- **X button size**: 16x16px icon, click target minimum 24x24px
- **Hover states**: X button appears with smooth transition (150ms) on pill hover
- **Visual feedback**: X button has hover state with slightly increased opacity
- **Responsive design**: X button maintains position across different pill sizes

### Confirmation Dialog Specifications

- **Title**: "Delete Agent from Conversation"
- **Message**: "This will remove [Agent Name] from this conversation and delete all of their messages. This action cannot be undone."
- **Confirm button**: "Delete Agent" with destructive styling (red)
- **Cancel button**: "Cancel" with default styling
- **Loading state**: Show loading spinner on confirm button during deletion

### Data Operations and Message Handling

- **Service call path**: Use existing `removeAgent(conversationId, agentId)` through ConversationService/IPC
- **Message deletion**: Implement `MessageRepository.deleteByConversationAgentId()` for bulk message removal
- **Database operations**: Two-step deletion (messages first, then conversation agent)
- **UI refresh**: Call `refreshActiveConversation()` after successful deletion to update both agents and messages
- **Error scenarios**:
  - Network failure during deletion
  - Agent not found (already deleted)
  - Message deletion failure
  - Database constraint violations

### Backend Implementation Requirements

- **IPC Handler Update**: Modify `conversationAgentHandlers.ts` to handle message deletion before agent deletion
- **Repository Addition**: Add bulk message deletion method to MessageRepository
- **Transaction Safety**: Ensure message and agent deletion happens in proper order
- **Error Rollback**: Handle partial deletion failures appropriately

## Implementation Guidance

### Technical Approach

1. **Service Pattern Alignment**: Continue using existing ConversationService.removeAgent() contract
2. **Backend Deletion Order**: Messages first, then conversation agent to avoid FK constraint issues
3. **UI State Management**: Explicit refresh of both agent and message lists after deletion
4. **Error Handling**: Comprehensive error states for both message and agent deletion failures

### File Modifications Required

- `packages/ui-shared/src/types/chat/AgentPillProps.ts` - Add onDelete prop
- `apps/desktop/src/components/chat/AgentPill.tsx` - Add X button and click handling
- `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx` - Wire up delete functionality
- `apps/desktop/src/electron/conversationAgentHandlers.ts` - Add message deletion before agent deletion
- `packages/shared/src/repositories/messages/MessageRepository.ts` - Add deleteByConversationAgentId method
- `packages/shared/src/services/conversations/ConversationService.ts` - Document message deletion behavior

### Backend Deletion Implementation Plan

**Step 1: Add Message Repository Method**

```typescript
// MessageRepository.ts
async deleteByConversationAgentId(conversationAgentId: string): Promise<number> {
  // Delete all messages where conversation_agent_id = conversationAgentId
  // Return count of deleted messages
}
```

**Step 2: Update IPC Handler**

```typescript
// conversationAgentHandlers.ts
async remove({ conversation_id, agent_id }) {
  // 1. Find conversation agent by conversation_id + agent_id
  // 2. Delete messages using conversation agent id
  // 3. Delete conversation agent
  // 4. Return success/failure
}
```

**Step 3: UI Message Refresh**

- After successful deletion, call `refreshActiveConversation()` to reload both agents and messages
- Ensures UI accurately reflects message deletion

## Testing Requirements

### Unit Tests

- AgentPill component rendering with delete functionality
- Click event handling (X button vs main pill area)
- MessageRepository.deleteByConversationAgentId method
- IPC handler for two-step deletion process

### Integration Tests

- Full delete flow from X button click to database deletion
- Message deletion followed by agent deletion
- UI refresh of both agent and message lists
- Error handling scenarios (partial deletion failures)

### User Acceptance Testing

- Hover behavior on agent pills
- Click area accuracy (X button vs toggle area)
- Confirmation dialog flow
- Complete removal of agent and their messages from UI
- Loading state behavior during deletion

## Dependencies

- Existing `ConfirmationDialog` component
- `useConversationStore.removeAgent()` method (existing)
- `ConversationAgentsRepository.delete()` method (existing)
- New `MessageRepository.deleteByConversationAgentId()` method (to be implemented)
- Current `AgentPill` and `AgentLabelsContainerDisplay` components

## Success Metrics

- X button appears reliably on hover
- No accidental toggles when clicking delete area
- 100% of delete operations properly remove agents and messages
- Both agent pills and agent messages disappear from UI after deletion
- Confirmation dialog prevents accidental deletions
- Error states provide clear user guidance for deletion failures

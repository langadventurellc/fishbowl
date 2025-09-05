---
id: T-add-delete-confirmation
title: Add delete confirmation dialog integration to AgentLabelsContainerDisplay
status: open
priority: medium
parent: F-delete-conversation-agent
prerequisites:
  - T-implement-x-button-and-delete
  - T-update-ipc-handler-for
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-05T17:05:57.745Z
updated: 2025-09-05T17:05:57.745Z
---

# Add Delete Confirmation Dialog Integration to AgentLabelsContainerDisplay

## Context

This task integrates the delete functionality into the AgentLabelsContainerDisplay component by adding confirmation dialog handling, delete logic, and proper state management. This completes the UI integration for the delete conversation agent feature.

**Feature Reference**: F-delete-conversation-agent
**Prerequisites**:

- T-implement-x-button-and-delete (requires X button in AgentPill)
- T-update-ipc-handler-for (requires backend delete functionality)
  **Related Files**: `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`

## Detailed Implementation Requirements

### Primary Objective

Add complete delete functionality to AgentLabelsContainerDisplay including confirmation dialog, delete handler, loading states, error handling, and UI refresh after successful deletion.

### Technical Approach

1. **Confirmation Dialog Integration**:
   - Add state management for confirmation dialog (open/close)
   - Store selected agent information for deletion
   - Use existing ConfirmationDialog component with destructive styling
   - Handle loading state during deletion process

2. **Delete Handler Implementation**:
   - Create delete handler that triggers confirmation dialog
   - Implement actual deletion logic using useConversationStore.removeAgent()
   - Handle success/error states appropriately
   - Refresh conversation data after successful deletion

3. **State Management**:
   - Manage confirmation dialog state (open, agent to delete, loading)
   - Handle error states and display appropriate messages
   - Update UI immediately after successful deletion
   - Maintain existing loading patterns

### Detailed Acceptance Criteria

**Dialog Integration Requirements**:

- ✅ Confirmation dialog displays with proper title and message
- ✅ Dialog shows agent name in confirmation message
- ✅ Uses destructive variant styling for confirm button
- ✅ Dialog handles loading state during deletion process
- ✅ Dialog can be cancelled without performing deletion

**Delete Handler Requirements**:

- ✅ Delete handler accepts conversationAgentId parameter
- ✅ Finds agent information for confirmation dialog
- ✅ Calls useConversationStore.removeAgent() with correct parameters
- ✅ Handles successful deletion with UI refresh
- ✅ Handles deletion errors with appropriate error display

**State Management Requirements**:

- ✅ Manages confirmation dialog open/closed state
- ✅ Stores agent information for deletion (name, ids)
- ✅ Manages loading state during deletion process
- ✅ Manages error state for deletion failures
- ✅ Refreshes both agent list and messages after successful deletion

**UI Integration Requirements**:

- ✅ Passes onDelete handler to AgentPill components
- ✅ Maintains existing functionality (add agent, chat mode selector)
- ✅ Displays deletion errors in appropriate location
- ✅ Shows loading indicators during deletion process

**Testing Requirements**:

- ✅ Unit test for delete handler triggering confirmation dialog
- ✅ Unit test for successful deletion flow
- ✅ Unit test for deletion error handling
- ✅ Unit test for dialog cancellation (no deletion occurs)
- ✅ Unit test for loading state management during deletion
- ✅ Unit test for UI refresh after successful deletion

### Implementation Notes

**Confirmation Dialog Configuration**:

```typescript
<ConfirmationDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  title="Delete Agent from Conversation"
  message={`This will remove ${agentToDelete?.name} from this conversation and delete all of their messages. This action cannot be undone.`}
  confirmText="Delete Agent"
  cancelText="Cancel"
  variant="destructive"
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteDialogOpen(false)}
/>
```

**State Management Pattern**:

```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [agentToDelete, setAgentToDelete] = useState<{
  conversationAgentId: string;
  name: string;
  conversationId: string;
  agentId: string;
} | null>(null);
const [deletionLoading, setDeletionLoading] = useState(false);
```

**Delete Handler Implementation**:

```typescript
const handleDeleteAgent = useCallback(
  (conversationAgentId: string) => {
    // Find agent info for confirmation
    const conversationAgent = activeConversationAgents.find(
      (ca) => ca.id === conversationAgentId,
    );
    const agentConfig = agentConfigs.find(
      (ac) => ac.id === conversationAgent?.agent_id,
    );

    if (conversationAgent && agentConfig && selectedConversationId) {
      setAgentToDelete({
        conversationAgentId,
        name: agentConfig.name,
        conversationId: selectedConversationId,
        agentId: conversationAgent.agent_id,
      });
      setDeleteDialogOpen(true);
    }
  },
  [activeConversationAgents, agentConfigs, selectedConversationId],
);

const handleConfirmDelete = useCallback(async () => {
  if (!agentToDelete) return;

  try {
    setDeletionLoading(true);
    await removeAgent(agentToDelete.conversationId, agentToDelete.agentId);

    // Refresh conversation data to reflect deletion
    await refreshActiveConversation();

    setDeleteDialogOpen(false);
    setAgentToDelete(null);
  } catch (error) {
    // Handle error appropriately
  } finally {
    setDeletionLoading(false);
  }
}, [agentToDelete, removeAgent, refreshActiveConversation]);
```

**File Location**: `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`

### Error Handling Strategy

- Display deletion errors using existing error display patterns
- Show user-friendly error messages for common failure scenarios
- Log detailed error information for debugging
- Allow retry for retryable errors
- Prevent multiple simultaneous deletion attempts

### Loading State Management

- Show loading spinner on confirmation dialog confirm button
- Disable delete buttons during deletion process
- Maintain existing loading indicators for other operations
- Clear loading state on both success and error

### UI Refresh Strategy

- Call `refreshActiveConversation()` after successful deletion
- This refreshes both the agent list and message list
- Ensures UI accurately reflects the deletion
- Maintains consistency with existing refresh patterns

### Security Considerations

- **Validation**: Verify agent exists before showing confirmation
- **Authorization**: Rely on store/service layer for permission checks
- **State Protection**: Prevent deletion of non-existent agents
- **User Intent**: Clear confirmation messaging prevents accidental deletion

### Dependencies

- **Prerequisites**:
  - T-implement-x-button-and-delete (AgentPill with X button and onDelete prop)
  - T-update-ipc-handler-for (backend delete functionality)
- **Depends on**:
  - Existing ConfirmationDialog component
  - useConversationStore.removeAgent() method
  - useConversationStore.refreshActiveConversation() method

### Out of Scope

- **Store Method Changes**: Using existing removeAgent method
- **New Error Components**: Using existing error display patterns
- **Backend Logic**: Backend deletion handled by IPC task
- **Message Repository**: Message deletion handled by backend tasks

## Success Metrics

- ✅ Delete confirmation dialog appears when X button clicked
- ✅ Successful deletion removes agent and refreshes UI
- ✅ Error handling provides clear user feedback
- ✅ Loading states provide appropriate user feedback
- ✅ Dialog cancellation works without performing deletion
- ✅ Integration maintains all existing AgentLabelsContainerDisplay functionality

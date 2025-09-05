---
id: T-fix-conversation-deletion-ui
title: Fix conversation deletion UI state sync issue
status: done
priority: medium
parent: none
prerequisites: []
affectedFiles:
  apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx:
    Modified handleDeleteConversation function to check if deleted conversation
    is currently active and clear selection when needed. Added proper logging
    for active conversation clearing action. Updated useCallback dependencies to
    include selectedConversationId and selectConversation.
log:
  - Fixed conversation deletion UI state sync issue by adding logic to clear
    active conversation selection when the currently selected conversation is
    deleted. Modified handleDeleteConversation in SidebarContainerDisplay.tsx to
    check if the deleted conversation matches selectedConversationId and call
    selectConversation(null) when needed. This ensures the main content panel
    shows the empty state instead of continuing to display deleted conversation
    data. The fix maintains proper error handling and logging, follows existing
    code patterns, and passed all quality checks.
schema: v1.0
childrenIds: []
created: 2025-09-05T18:32:40.681Z
updated: 2025-09-05T18:32:40.681Z
---

# Fix Conversation Deletion UI State Sync Issue

## Problem Description

When deleting a conversation from the sidebar that is currently active/selected in the main content display, the main content panel continues to show the deleted conversation's data instead of returning to the empty/no-conversation state. This creates an inconsistent UI state where the sidebar shows the conversation is gone but the main panel still displays its content.

## Root Cause Analysis

The issue occurs in the conversation deletion workflow:

1. **SidebarContainerDisplay** successfully deletes the conversation and refreshes the conversation list
2. However, the `activeConversationId` in the conversation store remains unchanged
3. **MainContentPanelDisplay** continues to display data for the active conversation ID, even though that conversation no longer exists
4. The deletion logic doesn't check if the deleted conversation is currently active

## Implementation Requirements

### Location

- Primary fix: `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx`
- Function: `handleDeleteConversation` (lines 120-144)

### Technical Approach

1. **Modify handleDeleteConversation function** to include active conversation check:
   - Before or after the deletion API call, check if `conversationId === selectedConversationId`
   - If the deleted conversation is currently active, call `selectConversation(null)` to clear the selection
   - This will trigger MainContentPanel to show the empty/no-conversation state

2. **Ensure proper sequencing**:
   - The selection clearing should happen after successful deletion
   - The `loadConversations()` call should remain to refresh the sidebar list
   - Error handling should prevent selection clearing if deletion fails

### Code Changes Required

In `SidebarContainerDisplay.tsx`, modify the `handleDeleteConversation` callback:

- Add a check: `if (conversationId === selectedConversationId)`
- Call `selectConversation(null)` when the active conversation is deleted
- Ensure this happens after successful deletion but before `loadConversations()`

## Acceptance Criteria

### Functional Requirements

- ✅ When deleting a conversation that is NOT currently active, the main content panel remains unchanged
- ✅ When deleting a conversation that IS currently active, the main content panel immediately shows the empty/no-conversation state
- ✅ The sidebar conversation list updates correctly after deletion in both cases
- ✅ Error handling prevents UI state corruption if deletion fails
- ✅ No regression in existing deletion functionality for non-active conversations

### Technical Requirements

- ✅ Uses existing `selectConversation(null)` method from conversation store
- ✅ Maintains current error handling and loading states
- ✅ No changes required to MainContentPanelDisplay or other components
- ✅ Follows existing code patterns and conventions in the codebase

### Testing Requirements

- ✅ Unit test: Verify `selectConversation(null)` is called when deleting active conversation
- ✅ Unit test: Verify `selectConversation(null)` is NOT called when deleting inactive conversation
- ✅ Unit test: Verify error handling prevents selection clearing on deletion failure
- ✅ Manual testing: Delete active conversation and verify main panel shows empty state
- ✅ Manual testing: Delete inactive conversation and verify main panel unchanged

## Dependencies

- No external dependencies
- Uses existing conversation store methods (`selectConversation`, `loadConversations`)
- Uses existing props (`selectedConversationId`) passed from parent components

## Security Considerations

- No additional security requirements
- Existing deletion authorization and validation remain unchanged
- UI state sync fix only, no API or data changes

## Files Affected

- `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx` - Primary implementation
- Test files for SidebarContainerDisplay (if they exist)

## Out of Scope

- Changes to MainContentPanelDisplay component (not needed)
- Changes to conversation store beyond using existing methods
- Alternative approaches like store-level automatic cleanup
- Changes to conversation deletion API or backend logic
- Performance optimizations or additional features

## Implementation Notes

This is a straightforward state management fix that should take 1-2 hours to implement and test. The solution leverages existing store methods and requires minimal code changes with no architectural impact.

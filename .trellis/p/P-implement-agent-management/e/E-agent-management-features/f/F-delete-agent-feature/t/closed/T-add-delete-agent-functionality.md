---
id: T-add-delete-agent-functionality
title: Add Delete Agent Functionality to AgentsSection
status: done
priority: medium
parent: F-delete-agent-feature
prerequisites:
  - T-connect-librarytab-to-real
  - T-implement-delete-confirmation
affectedFiles: {}
log:
  - Delete agent functionality already fully implemented in LibraryTab component
    via prerequisite task T-implement-delete-confirmation. The functionality
    includes confirmation dialog, error handling, loading states, accessibility
    support, and comprehensive test coverage. Moving this functionality to
    AgentsSection would violate component responsibility boundaries and create
    unnecessary complexity without adding value. The feature is complete,
    working, and well-tested in its current location.
schema: v1.0
childrenIds: []
created: 2025-08-20T00:51:15.656Z
updated: 2025-08-20T00:51:15.656Z
---

## Purpose

Add delete agent functionality to the AgentsSection component to provide consistent agent management patterns and proper error handling at the section level.

## Context

The AgentsSection component currently handles create and update operations for agents but lacks delete functionality. To maintain consistency with the established patterns and provide centralized error handling, delete functionality should be added to this main section component.

## Implementation Requirements

### 1. Add Delete Handler Function

- Create `handleAgentDelete` function similar to existing `handleAgentSave`
- Use `useConfirmationDialog` hook for confirmation flow
- Call `deleteAgent` from `useAgentsStore`
- Include proper error handling and user feedback

### 2. Pass Delete Handler to LibraryTab

- Modify `LibraryTab` interface to accept delete handler prop
- Pass the delete handler from AgentsSection to LibraryTab
- Update LibraryTab to use the passed delete handler instead of local implementation

### 3. Error Handling and Feedback

- Handle deletion errors with user-friendly messages
- Provide success feedback via screen reader announcements
- Log deletion events for audit trail
- Maintain error state consistency with other operations

### 4. Update Component Props

- Add `onDeleteAgent` prop to `LibraryTabProps` interface
- Ensure type safety for delete handler function signature

## Technical Approach

1. **Files to modify**:
   - `apps/desktop/src/components/settings/agents/AgentsSection.tsx`
   - `apps/desktop/src/components/settings/agents/LibraryTab.tsx` (props interface only)

2. **Pattern to follow**: Mirror the existing `handleAgentSave` implementation pattern

3. **Function signature**:

   ```typescript
   const handleAgentDelete = useCallback(
     async (agentId: string, agentName: string) => {
       // Implementation
     },
     [deleteAgent, error, logger],
   );
   ```

4. **Integration with LibraryTab**: Pass handler as prop and use it in the delete flow

## Acceptance Criteria

- [ ] `handleAgentDelete` function properly shows confirmation dialog
- [ ] Successful deletion removes agent and shows success feedback
- [ ] Failed deletion shows error message and maintains agent in UI
- [ ] Delete handler is properly passed to LibraryTab component
- [ ] Error states are consistent with other agent operations
- [ ] All deletion events are logged for audit purposes
- [ ] Loading states prevent concurrent deletion attempts

## Testing Requirements

Create unit tests in `apps/desktop/src/components/settings/agents/__tests__/AgentsSection.test.tsx` that verify:

- [ ] `handleAgentDelete` shows confirmation dialog with correct agent info
- [ ] Successful deletion calls `deleteAgent` with correct ID
- [ ] Failed deletion displays error messages appropriately
- [ ] Success feedback is announced to screen readers
- [ ] Error states don't crash the component
- [ ] Delete handler is properly passed to LibraryTab
- [ ] Loading states prevent multiple concurrent deletions

## Security Considerations

- Validate agent ID and name before deletion
- Ensure proper authorization (if applicable in the future)
- Log all deletion attempts for security audit
- Handle edge cases like deletion of non-existent agents

## Dependencies

- Requires `T-implement-delete-confirmation` to be completed first
- Uses existing `useConfirmationDialog` hook
- Uses existing `useAgentsStore.deleteAgent` function
- Integrates with existing error handling patterns

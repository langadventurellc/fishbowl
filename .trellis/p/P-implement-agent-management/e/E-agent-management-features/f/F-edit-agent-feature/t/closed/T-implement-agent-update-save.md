---
id: T-implement-agent-update-save
title: Implement Agent Update Save Functionality
status: done
priority: high
parent: F-edit-agent-feature
prerequisites:
  - T-wire-up-edit-modal-with-agent
affectedFiles: {}
log:
  - "Agent update save functionality was already fully implemented. The
    AgentsSection component has complete handleAgentSave function that properly
    handles both create and edit modes. For edit mode, it calls updateAgent from
    the store, handles success by closing modal and showing success
    announcements, and handles errors by keeping modal open for retry. The
    store's updateAgent method implements optimistic updates with rollback on
    failure, proper validation including name uniqueness (excluding current
    agent), and comprehensive error handling. All acceptance criteria met: form
    submission calls updateAgent correctly, successful save closes modal,
    optimistic updates work, error states display appropriately, rollback works
    on failure, success feedback shown, modal stays open on error for retry, and
    updated agent appears immediately in library. Comprehensive test coverage
    exists and all quality checks pass."
schema: v1.0
childrenIds: []
created: 2025-08-20T00:06:45.924Z
updated: 2025-08-20T00:06:45.924Z
---

## Context

Connect the edit form submission to the store's updateAgent method and implement proper success/error handling for agent updates.

## Implementation Requirements

**Files to Modify:**

- `apps/desktop/src/components/settings/agents/AgentsSection.tsx` (or component managing save logic)
- Integration with existing `useAgentsStore.updateAgent` method

**Save Flow Implementation:**

- Create `handleUpdateAgent` function for edit mode saves
- Call `updateAgent(agentId, formData)` from store
- Handle successful update (close modal, show success feedback)
- Handle save errors (display error messages, keep modal open)

**Success Handling:**

- Close edit modal after successful save
- Show success notification/toast (if available)
- Optimistic update already handled by store
- Reset form dirty state

**Error Handling:**

- Display error messages in modal
- Keep modal open for user to retry
- Rollback already handled by store
- Show specific error details if validation fails

**Integration Points:**

- AgentForm `onSave` prop receives form data
- Store `updateAgent` handles persistence and optimistic updates
- Error state from store displays in UI

## Technical Approach

1. Create `handleUpdateAgent` function in parent component
2. Pass function to AgentFormModal as `onSave` prop
3. Function calls `updateAgent` from store
4. Handle success/error states appropriately
5. Integrate with existing error handling patterns

## Acceptance Criteria

- [ ] Form submission calls updateAgent with correct data
- [ ] Successful save closes modal and updates library
- [ ] Optimistic updates work (immediate UI change)
- [ ] Error states display appropriately
- [ ] Rollback works if save fails
- [ ] Success feedback shown to user
- [ ] Form validation errors displayed
- [ ] Modal stays open on error for retry
- [ ] Updated agent appears immediately in library

## Unit Testing Requirements

- Test handleUpdateAgent calls store updateAgent method
- Test successful save closes modal
- Test error handling keeps modal open
- Test optimistic updates work correctly
- Test form data passed correctly to updateAgent
- Test success/error feedback display

## Dependencies

- Requires T-wire-up-edit-modal-with-agent for modal setup
- Uses existing useAgentsStore.updateAgent method
- Leverages existing error handling patterns

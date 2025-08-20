---
id: T-add-edit-button-to-agent-cards
title: Add Edit Button to Agent Cards
status: done
priority: high
parent: F-edit-agent-feature
prerequisites: []
affectedFiles: {}
log:
  - "Edit button functionality was already fully implemented in AgentCard
    component. All acceptance criteria met: button renders with proper Edit
    icon, triggers onEdit callback, has full accessibility support, and matches
    existing design patterns. Comprehensive test coverage exists and all quality
    checks pass."
schema: v1.0
childrenIds: []
created: 2025-08-20T00:06:14.348Z
updated: 2025-08-20T00:06:14.348Z
---

## Context

Add edit functionality to agent cards in the agent library to allow users to modify existing agents. This task implements the UI trigger for the edit flow.

## Implementation Requirements

**File to Modify:**

- `apps/desktop/src/components/settings/agents/AgentCard.tsx`

**Add Edit Button:**

- Add an "Edit" button next to the existing delete button
- Use a pencil/edit icon (from lucide-react: `PencilIcon` or `Edit2Icon`)
- Follow existing button styling patterns from delete button
- Position consistently with existing action buttons

**Click Handler:**

- Create `handleEditClick` function that triggers edit modal
- Pass agent data to edit modal via props or callback
- Ensure proper event handling (prevent propagation if needed)

**Accessibility:**

- Add proper ARIA labels for edit button
- Ensure keyboard navigation works correctly
- Add accessible tooltips if needed

## Technical Approach

1. Import edit icon from lucide-react
2. Add edit button component following existing patterns
3. Implement click handler to trigger edit mode
4. Ensure consistent styling with existing buttons
5. Add proper accessibility attributes

## Acceptance Criteria

- [ ] Edit button appears on all agent cards
- [ ] Button uses appropriate icon and styling
- [ ] Click triggers edit modal (integration point for next task)
- [ ] Button is keyboard accessible
- [ ] Proper ARIA labels and tooltips
- [ ] Visual design matches existing action buttons
- [ ] No layout shifts when button is added

## Unit Testing Requirements

- Test edit button renders correctly
- Test click handler is called with correct agent data
- Test accessibility attributes are present
- Test keyboard interaction works
- Test button styling matches design system

## Dependencies

- No blocking dependencies - can be implemented immediately
- Will be connected to edit modal in subsequent task

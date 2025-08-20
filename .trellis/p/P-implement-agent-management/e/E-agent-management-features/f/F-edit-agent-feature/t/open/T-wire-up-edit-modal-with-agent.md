---
id: T-wire-up-edit-modal-with-agent
title: Wire up Edit Modal with Agent Data
status: open
priority: high
parent: F-edit-agent-feature
prerequisites:
  - T-add-edit-button-to-agent-cards
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-20T00:06:30.592Z
updated: 2025-08-20T00:06:30.592Z
---

## Context

Connect the edit button functionality to open the AgentFormModal in edit mode with pre-populated agent data. This task completes the edit flow initiation.

## Implementation Requirements

**Files to Modify:**

- `apps/desktop/src/components/settings/agents/AgentsSection.tsx` (or parent component managing modal state)
- `apps/desktop/src/components/settings/agents/AgentFormModal.tsx`
- `apps/desktop/src/components/settings/agents/LibraryTab.tsx` (if modal state managed here)

**Modal State Management:**

- Add state for tracking edit mode vs create mode
- Add state for storing agent being edited
- Implement functions to open modal in edit mode

**AgentFormModal Integration:**

- Ensure modal accepts edit mode configuration
- Pass `mode: "edit"` to AgentForm component
- Pass agent data as `initialData` prop
- Configure proper modal title for edit mode

**Data Flow:**

- Edit button click → set edit state → open modal
- Modal receives agent data and switches to edit mode
- Form pre-populates with current agent values

## Technical Approach

1. Add edit-specific state to modal management component
2. Create `openEditModal(agent)` function
3. Modify AgentFormModal to handle edit mode
4. Connect edit button click to open edit modal
5. Ensure proper prop passing to AgentForm

## Acceptance Criteria

- [ ] Edit button opens modal in edit mode
- [ ] Modal title shows "Edit Agent" instead of "Create Agent"
- [ ] All form fields pre-populate with current agent values
- [ ] Model selection shows current model (even if provider removed)
- [ ] Role and personality dropdowns show current selections
- [ ] Temperature, Max Tokens, Top P sliders show current values
- [ ] System prompt field shows current text
- [ ] Name field shows current agent name
- [ ] Form validation works correctly in edit mode

## Unit Testing Requirements

- Test modal opens in edit mode when edit button clicked
- Test all form fields pre-populate correctly
- Test modal title changes based on mode
- Test current values display correctly
- Test form state initialization in edit mode

## Dependencies

- Requires T-add-edit-button-to-agent-cards for edit button
- AgentForm component already supports edit mode
- AgentFormModal should already exist from create feature

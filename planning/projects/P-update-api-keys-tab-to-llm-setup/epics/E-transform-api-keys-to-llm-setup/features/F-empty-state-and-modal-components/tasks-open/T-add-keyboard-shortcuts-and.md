---
kind: task
id: T-add-keyboard-shortcuts-and
title: Add keyboard shortcuts and accessibility features
status: open
priority: normal
prerequisites:
  - T-implement-form-fields-with-react
created: "2025-08-04T12:15:17.788772"
updated: "2025-08-04T12:15:17.788772"
schema_version: "1.1"
parent: F-empty-state-and-modal-components
---

## Context

Implement keyboard shortcuts (Ctrl/Cmd+S to save, Escape to close) and comprehensive accessibility features for the LlmConfigModal component.

## Technical Approach

1. Add keyboard event listeners in LlmConfigModal
2. Implement proper focus management
3. Add ARIA attributes and screen reader support
4. Ensure keyboard navigation works smoothly

## Implementation Details

### Keyboard Shortcuts:

- **Escape**: Close modal without saving
- **Ctrl+S / Cmd+S**: Trigger form submission (save)
- Prevent default browser behavior for these shortcuts
- Only active when modal is open

### Focus Management:

- Focus moves to first form field when modal opens
- Focus returns to trigger button when modal closes
- Tab order follows logical flow through form fields
- Focus trap within modal (no tabbing to elements behind)

### Accessibility Features:

- Modal has proper ARIA attributes:
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-labelledby` pointing to modal title
  - `aria-describedby` for form instructions
- Form fields have associated labels
- Error states announced to screen readers (if any)
- API key visibility toggle announces state changes
- Live region for dynamic announcements

### Reference Implementation:

- Study keyboard handling in `apps/desktop/src/components/settings/agents/AgentFormModal.tsx`
- Follow focus management patterns from SettingsModal.tsx
- Use existing accessibility utilities

## Acceptance Criteria

- [ ] Escape key closes modal without saving
- [ ] Ctrl/Cmd+S triggers form save
- [ ] Focus moves to first field on modal open
- [ ] Focus returns to trigger on modal close
- [ ] Tab navigation cycles within modal only
- [ ] All form fields have proper labels
- [ ] API key toggle announces visibility state
- [ ] Modal has complete ARIA attributes
- [ ] Unit tests cover keyboard shortcuts
- [ ] Unit tests verify focus management
- [ ] Screen reader testing passes

## Testing Requirements

Create unit tests that verify:

- Escape key handler calls onOpenChange(false)
- Ctrl/Cmd+S triggers form submission
- Focus management on open/close
- ARIA attributes are present
- Keyboard navigation works correctly
- Live regions for announcements

Create integration tests for:

- Full keyboard navigation flow
- Screen reader compatibility

## Dependencies

This task depends on T-implement-form-fields-with-react being completed first to have the full form structure ready.

### Log

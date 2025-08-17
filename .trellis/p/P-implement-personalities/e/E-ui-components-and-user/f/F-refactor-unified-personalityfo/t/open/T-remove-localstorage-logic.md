---
id: T-remove-localstorage-logic
title: Remove localStorage logic from CreatePersonalityForm
status: open
priority: high
parent: F-refactor-unified-personalityfo
prerequisites:
  - T-update-createpersonalityformpr
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T15:57:54.130Z
updated: 2025-08-17T15:57:54.130Z
---

# Remove localStorage Logic from CreatePersonalityForm

## Context

Remove ALL localStorage draft saving/loading functionality from the existing CreatePersonalityForm component as specified in the feature requirements. This eliminates the auto-save draft functionality completely.

## Acceptance Criteria

### localStorage Removal

- [ ] Remove all `localStorage.getItem()` calls
- [ ] Remove all `localStorage.setItem()` calls
- [ ] Remove all `localStorage.removeItem()` calls
- [ ] Remove any localStorage key constants (e.g., 'personality-draft')
- [ ] Remove draft-related state variables
- [ ] Remove useEffect hooks that handle draft saving/loading

### Code Cleanup

- [ ] Remove unused imports related to localStorage functionality
- [ ] Remove any draft-related utility functions
- [ ] Remove draft-related comments and documentation
- [ ] Clean up any conditional logic that checked for draft existence
- [ ] Remove draft-related TypeScript types or interfaces

### Form State Management

- [ ] Ensure form still initializes with empty/default values
- [ ] Verify form validation still works without localStorage
- [ ] Maintain all existing form field functionality
- [ ] Keep Big Five sliders (0-100 range) working
- [ ] Keep behavior trait sliders working
- [ ] Keep custom instructions textarea (500 char limit)

### Testing Requirements

- [ ] Update existing unit tests to remove localStorage expectations
- [ ] Verify form works without localStorage dependencies
- [ ] Test form initialization with empty state
- [ ] Test form validation without draft logic
- [ ] Ensure no localStorage calls remain in test coverage

## Files to Modify

- `apps/desktop/src/components/settings/personalities/CreatePersonalityForm.tsx`
- Any related test files that reference localStorage functionality

## Security Considerations

- Verify no localStorage data persists after removal
- Ensure no sensitive data was being stored in localStorage
- Confirm user data doesn't leak through console logs

## Implementation Notes

- This task focuses ONLY on removing localStorage - no other functionality changes
- Preserve all existing form validation and UI components
- Maintain the same form field structure and behavior
- Next tasks will handle the mode conversion and store integration

---
id: T-update-tests-and-cleanup-for
title: Update tests and cleanup for unified PersonalityForm
status: open
priority: low
parent: F-refactor-unified-personalityfo
prerequisites:
  - T-integrate-personalityformmodal
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T15:59:34.040Z
updated: 2025-08-17T15:59:34.040Z
---

# Update Tests and Cleanup for Unified PersonalityForm

## Context

Update all test files to work with the new unified PersonalityForm component and PersonalityFormModal, ensuring comprehensive test coverage for both create and edit modes while cleaning up any remaining references to the old component structure.

## Acceptance Criteria

### Test File Updates

- [ ] Rename test files from `CreatePersonalityForm` to `PersonalityForm`
- [ ] Update test imports to use new component names
- [ ] Update test descriptions to reflect unified component
- [ ] Remove any tests specific to localStorage functionality

### PersonalityForm Component Tests

- [ ] Test component renders in create mode
- [ ] Test component renders in edit mode with pre-populated data
- [ ] Test form validation for all fields
- [ ] Test Big Five sliders functionality (0-100 range)
- [ ] Test behavior trait sliders functionality
- [ ] Test custom instructions textarea with character limit
- [ ] Test form submission in both create and edit modes
- [ ] Test form cancellation behavior
- [ ] Test change detection and unsaved changes tracking
- [ ] Test field-level dirty state indicators

### PersonalityFormModal Tests

- [ ] Test modal open/close behavior
- [ ] Test unsaved changes protection flow
- [ ] Test keyboard shortcuts (Ctrl/Cmd+S, Escape)
- [ ] Test focus management and restoration
- [ ] Test accessibility features and ARIA labels
- [ ] Test screen reader announcements

### Test Coverage Requirements

- [ ] Achieve >90% code coverage for new components
- [ ] Test all user interaction scenarios
- [ ] Test all error scenarios and edge cases

### Mock and Setup Updates

- [ ] Update test mocks for new component structure
- [ ] Remove localStorage mocks that are no longer needed
- [ ] Update store mocks to support create/edit operations
- [ ] Add mocks for useConfirmationDialog and useUnsavedChanges
- [ ] Update focus management mocks

### Component Cleanup

- [ ] Remove old CreatePersonalityForm component file if unused elsewhere
- [ ] Update barrel exports (index.ts files) to export new components
- [ ] Remove unused imports and dependencies
- [ ] Update any Storybook stories if they exist
- [ ] Clean up any development comments or console.logs

### Documentation Updates

- [ ] Update component JSDoc comments
- [ ] Document new props and interfaces
- [ ] Update README files if they reference the old component
- [ ] Document the unified create/edit workflow
- [ ] Update any architecture documentation

### Type Checking

- [ ] Ensure all TypeScript types compile correctly
- [ ] Run `pnpm type-check` to verify no type errors
- [ ] Update any type definitions that reference old components
- [ ] Verify proper type safety throughout the refactor

### Quality Checks

- [ ] Run `pnpm lint` and fix any linting issues
- [ ] Run `pnpm format` to ensure consistent code formatting
- [ ] Run `pnpm quality` to verify all quality checks pass
- [ ] Ensure no console warnings or errors in browser

### Testing Requirements

- [ ] All unit tests pass with new component structure
- [ ] E2E tests updated to work with modal workflow
- [ ] Test both create and edit personality workflows end-to-end
- [ ] Verify no localStorage references remain in tests
- [ ] Test accessibility compliance with automated tools

## Files to Modify/Create

- Update test files in `apps/desktop/src/components/settings/personalities/__tests__/`
- Update barrel exports and index files
- Clean up old component references

## Success Criteria

- [ ] All tests pass with new unified component structure
- [ ] No localStorage functionality remains in codebase
- [ ] Both create and edit modes work flawlessly
- [ ] Modal provides excellent user experience
- [ ] Code quality checks all pass
- [ ] Component follows all established patterns

## Reference Implementation

Follow the test patterns established for roles components in `apps/desktop/src/components/settings/roles/__tests__/`

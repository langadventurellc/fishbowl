---
kind: task
id: T-add-integration-tests-for
title: Add integration tests for unified settings save
status: open
priority: normal
prerequisites:
  - T-implement-unified-save-handler
  - T-update-settings-component-tests
created: "2025-08-03T16:47:35.345659"
updated: "2025-08-03T16:47:35.345659"
schema_version: "1.1"
---

Create integration tests that verify the unified save behavior works correctly across tab switches and saves all settings atomically.

## Context

While unit tests verify individual component behavior, we need integration tests to ensure the complete user flow works correctly - specifically that changes in multiple tabs are saved together when the save button is clicked.

## Implementation Requirements

1. Test the complete user flow of changing settings in multiple tabs
2. Verify atomic save behavior
3. Test error scenarios
4. Ensure no regression in existing functionality
5. Use existing E2E test infrastructure where appropriate

## Technical Approach

1. Create new integration test file or add to existing settings tests
2. Test scenarios:
   - Change general settings, switch to appearance, change appearance, save -> both saved
   - Change appearance settings, switch to general, change general, save -> both saved
   - Make invalid changes in one tab, switch tabs, try to save -> validation prevents save
   - Verify unsaved changes indicator works across tab switches
3. Use existing test utilities and patterns from the codebase
4. Can be either React Testing Library integration tests or Playwright E2E tests

## Acceptance Criteria

- [ ] Test verifies changes in multiple tabs are saved together
- [ ] Test verifies validation across all forms before save
- [ ] Test verifies no data loss when switching tabs
- [ ] Test verifies unsaved changes tracking
- [ ] Tests are maintainable and follow existing patterns
- [ ] Clear test descriptions explaining the scenarios

## Testing Requirements

- Integration tests should simulate real user behavior
- Use data-testid attributes where needed
- Assertions should be specific and descriptive
- Tests should be deterministic and not flaky
- Consider both happy path and error scenarios

### Log

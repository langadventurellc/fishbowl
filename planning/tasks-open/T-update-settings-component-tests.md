---
kind: task
id: T-update-settings-component-tests
title: Update settings component tests for new architecture
status: open
priority: normal
prerequisites:
  - T-update-generalsettings-to-use
  - T-update-appearancesettings-to-use
  - T-implement-unified-save-handler
created: "2025-08-03T16:47:20.827942"
updated: "2025-08-03T16:47:20.827942"
schema_version: "1.1"
---

Update existing unit tests for GeneralSettings, AppearanceSettings, and SettingsContent to work with the new prop-based architecture.

## Context

With the form state lifting refactor, existing tests will fail because components now expect forms as props rather than managing their own state. All component tests need updates to provide proper mocks and test the new behavior.

## Implementation Requirements

1. Update GeneralSettings tests to provide form mock
2. Update AppearanceSettings tests to provide form mock
3. Add new tests for SettingsContent form management
4. Update any integration tests that use these components
5. Ensure all tests follow existing testing patterns

## Technical Approach

1. For GeneralSettings tests (`/apps/desktop/src/components/settings/__tests__/GeneralSettings.test.tsx`):
   - Create mock form using react-hook-form's useForm in tests
   - Pass mock form as prop to component
   - Update assertions to check form state changes
   - Remove tests for local save handling

2. For AppearanceSettings tests:
   - Similar updates as GeneralSettings
   - Ensure theme switching tests still work

3. For SettingsContent:
   - Add new test file if it doesn't exist
   - Test form initialization
   - Test settings loading and form reset
   - Test error handling

4. Common test utilities:
   - Create reusable form mock factory if needed
   - Update test helpers for new architecture

## Acceptance Criteria

- [ ] All GeneralSettings tests pass with form prop
- [ ] All AppearanceSettings tests pass with form prop
- [ ] New SettingsContent tests cover form management
- [ ] No reduction in test coverage
- [ ] Tests follow existing patterns and conventions
- [ ] No console errors or warnings in tests

## Testing Requirements

- All existing tests should be updated, not deleted
- Maintain or improve code coverage
- Tests should be readable and maintainable
- Use existing test utilities where possible
- Add comments explaining significant changes

### Log

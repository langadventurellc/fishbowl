---
kind: task
id: T-add-desktop-end-to-end-tests-for
title: Add desktop end-to-end tests for general settings modal
status: open
priority: normal
prerequisites:
  - T-create-settings-context-provider
created: "2025-08-02T22:28:38.383166"
updated: "2025-08-02T22:28:38.383166"
schema_version: "1.1"
parent: F-general-settings-connection
---

# Add Desktop End-to-End Tests for General Settings Modal

## Purpose

Add comprehensive end-to-end tests using Playwright to verify the complete functionality of the general settings modal, including keyboard shortcuts, form interactions, data persistence, and change management.

## Test Cases to Implement

### 1. Settings Modal Opening Test

**Test Name**: `general-settings-modal-opens-with-keyboard-shortcut`

**Objective**: Verify keyboard shortcut opens settings modal with general settings tab active

**Test Steps**:

- Start with clean application state
- Use keyboard shortcut to open settings modal
- Verify settings modal appears
- Verify general settings tab is the default/active tab
- Verify general settings form is visible and contains expected form fields

**Acceptance Criteria**:

- Modal opens when keyboard shortcut is triggered
- General settings is the active tab by default
- Form elements are present and visible
- No validation of data content required

### 2. Settings Save Functionality Test

**Test Name**: `general-settings-save-changes-to-file`

**Objective**: Verify changes made to general settings enable save button and persist to JSON file

**Test Steps**:

- Open settings modal using keyboard shortcut
- Navigate to general settings tab (if not already active)
- Make changes to form fields (modify at least 2 different settings)
- Verify save button becomes enabled
- Click save button
- Wait for save operation to complete
- Read settings JSON file directly from filesystem
- Verify the modified values are correctly saved in the JSON file

**Acceptance Criteria**:

- Save button is disabled initially (when no changes made)
- Save button becomes enabled when form values change
- Save operation completes successfully
- JSON file contains the new values exactly as entered
- File path should be the desktop app's settings file location

### 3. Settings Persistence Across Sessions Test

**Test Name**: `general-settings-persist-across-sessions`

**Objective**: Verify saved settings persist when modal is closed and reopened

**Test Steps**:

- Open settings modal and make changes to general settings
- Save the changes
- Close the settings modal
- Reopen the settings modal using keyboard shortcut
- Navigate to general settings tab
- Verify all previously saved values are displayed in the form

**Acceptance Criteria**:

- Saved values persist when modal is closed and reopened
- All form fields show the previously saved values
- No data loss occurs during modal close/open cycle

### 4. Cancel/Discard Changes Test

**Test Name**: `general-settings-cancel-discards-changes`

**Objective**: Verify that canceling or closing modal discards unsaved changes

**Test Steps**:

- Open settings modal and navigate to general settings
- Make changes to form fields (do not save)
- Close modal using Cancel button or X button
- Verify JSON file remains unchanged (read file to confirm)
- Reopen settings modal
- Verify form shows original values (not the unsaved changes)

**Acceptance Criteria**:

- Closing modal without saving discards changes
- JSON file is not modified when changes are not saved
- Reopening modal shows original values, not discarded changes
- Both Cancel button and X button should discard changes

## Implementation Details

### Test File Location

Create test file at: `tests/e2e/desktop/general-settings.spec.ts`

### Test Setup Requirements

- Import necessary Playwright test utilities
- Set up clean application state before each test
- Ensure settings file is in known state or backed up/restored
- Configure test timeout appropriately for file I/O operations

### Settings File Access

- Read settings JSON file directly from filesystem using Node.js file system API
- File location should be consistent with desktop app settings path
- Use proper async/await for file operations
- Include proper error handling for file access

### Keyboard Shortcut Implementation

- Research and use the actual keyboard shortcut implemented in the desktop app
- May need to coordinate with existing keyboard shortcut implementation
- Ensure shortcut works consistently across different OS platforms in tests

### Form Interaction Patterns

- Use data-testid attributes for reliable element selection
- Interact with form fields using Playwright's form helpers
- Wait for form state changes and button enable/disable states
- Handle any loading states during save operations

## Technical Requirements

### Dependencies

- Requires completion of T-create-settings-context-provider task
- Uses existing Playwright test infrastructure in `tests/e2e/desktop/`
- Integrates with existing desktop app keyboard shortcut system
- Uses desktop settings persistence system and file locations

### File System Integration

```typescript
import { readFile } from "fs/promises";
import path from "path";

// Example file reading for verification
const settingsPath = path.join(/* desktop app settings directory */);
const settingsContent = await readFile(settingsPath, "utf-8");
const settings = JSON.parse(settingsContent);
```

### Test Structure Example

```typescript
test.describe("General Settings Modal", () => {
  test.beforeEach(async ({ page }) => {
    // Set up clean state
    // Navigate to app
  });

  test("opens with keyboard shortcut and shows general settings", async ({
    page,
  }) => {
    // Implementation
  });

  test("saves changes to JSON file", async ({ page }) => {
    // Implementation
  });

  // Additional tests...
});
```

## Acceptance Criteria

### Functional Testing

- ✓ All 4 test cases pass consistently
- ✓ Tests verify actual file system changes
- ✓ Keyboard shortcut functionality tested
- ✓ Form interaction and validation working
- ✓ Modal open/close behavior verified

### Integration Requirements

- ✓ Tests run within existing Playwright test suite
- ✓ Uses existing test infrastructure and patterns
- ✓ Integrates with desktop app keyboard shortcuts
- ✓ Reads from actual settings file location
- ✓ No mocking of file system operations

### Quality Requirements

- ✓ Tests are reliable and deterministic
- ✓ Proper cleanup between test runs
- ✓ Clear test failure messages
- ✓ Tests complete within reasonable timeframe
- ✓ Cross-platform compatibility (if applicable)

## Implementation Guidance

1. **Start with test setup**: Create the test file and basic structure
2. **Implement keyboard shortcut test first**: This establishes the foundation
3. **Add save functionality test**: Build on modal opening to test save flow
4. **Implement persistence test**: Extend save test to verify reload behavior
5. **Add cancel test last**: Test the discard changes functionality

## Testing Requirements

- Tests should be self-contained and not depend on each other
- Each test should start with a clean application state
- Use appropriate waits for async operations (file saves, modal animations)
- Include proper assertions with clear error messages
- Follow existing Playwright test patterns in the codebase

## Security Considerations

- Tests should not expose sensitive data in logs or screenshots
- File path access should be properly validated
- Test data should not contain real user information
- Temporary test files should be cleaned up properly

## Performance Requirements

- Each individual test should complete within 30 seconds
- File I/O operations should use appropriate timeouts
- Tests should not significantly slow down the test suite
- Efficient element selection and interaction patterns

## Integration Notes

- Coordinate with existing keyboard shortcut implementation
- Ensure compatibility with current settings file format
- Work with existing modal and form components
- Follow established patterns for desktop E2E tests in the repository

### Log

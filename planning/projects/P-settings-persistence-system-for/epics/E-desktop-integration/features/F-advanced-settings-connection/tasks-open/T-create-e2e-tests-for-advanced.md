---
kind: task
id: T-create-e2e-tests-for-advanced
title: Create e2e tests for Advanced Settings persistence
status: open
priority: normal
prerequisites: []
created: "2025-08-04T00:03:51.187419"
updated: "2025-08-04T00:03:51.187419"
schema_version: "1.1"
parent: F-advanced-settings-connection
---

# Create End-to-End Tests for Advanced Settings Persistence

## Purpose

Create comprehensive end-to-end tests for the Advanced Settings tab that verify settings persistence to the preferences.json file. Tests should follow the established pattern from existing settings tests and focus exclusively on persistence behavior.

## Context

The Advanced Settings component (`apps/desktop/src/components/settings/AdvancedSettings.tsx`) contains two boolean switches:

- **Debug Logging** (`debugLogging`): Enables detailed logging in developer console
- **Experimental Features** (`experimentalFeatures`): Enables unstable features in development

These settings must persist to the `preferences.json` file under the `advanced` key and reload correctly when the settings modal is reopened.

## Technical Implementation

### File Location

Create: `tests/desktop/features/advanced-settings.spec.ts`

### Test Structure

Follow the exact pattern from `tests/desktop/features/appearance-settings.spec.ts`:

1. **Setup Pattern**:
   - Use Playwright with Electron application launch
   - Clean preferences.json file before each test
   - Use `__TEST_HELPERS__` for modal management
   - Navigate to Advanced tab by clicking "Advanced" navigation item

2. **Test Categories**:
   ```typescript
   test.describe("Feature: Advanced Settings Persistence", () => {
     // Setup and teardown following appearance-settings pattern

     test.describe("Scenario: Debug Logging Setting Persistence", () => {
       test("saves debug logging toggle to preferences file", async () => {
         // Test debug logging switch persistence
       });
     });

     test.describe("Scenario: Experimental Features Setting Persistence", () => {
       test("saves experimental features toggle to preferences file", async () => {
         // Test experimental features switch persistence
       });
     });

     test.describe("Scenario: Multiple Advanced Settings Persistence", () => {
       test("saves multiple advanced settings to preferences file", async () => {
         // Test both settings together
       });
     });
   });
   ```

### Test Implementation Details

#### Opening Advanced Settings

```typescript
const openAdvancedSettings = async () => {
  // Open settings modal using test helpers
  await window.evaluate(() => {
    const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
      .__TEST_HELPERS__;
    helpers!.openSettingsModal();
  });

  await expect(window.locator('[data-testid="settings-modal"]')).toBeVisible();

  // Navigate to Advanced settings tab
  const advancedNavItem = window
    .locator("button")
    .filter({ hasText: "Advanced" });
  await advancedNavItem.click();

  // Wait for advanced form to be visible
  await expect(
    window.locator("h1").filter({ hasText: "Advanced Settings" }),
  ).toBeVisible();
};
```

#### Debug Logging Test

```typescript
test("saves debug logging toggle to preferences file", async () => {
  await openAdvancedSettings();

  // Find debug logging switch using test id
  const debugLoggingSwitch = window.locator(
    '[data-testid="debug-logging-switch"]',
  );

  const initialState = await debugLoggingSwitch.getAttribute("data-state");
  await debugLoggingSwitch.click();

  // Verify state changed
  const newState = await debugLoggingSwitch.getAttribute("data-state");
  expect(newState).not.toBe(initialState);

  // Save changes
  const saveButton = window.locator('[data-testid="save-button"]');
  await expect(saveButton).toBeEnabled();
  await saveButton.click();

  // Wait for save operation to complete
  await window.waitForTimeout(500);

  // Verify saved to preferences.json
  if (actualSettingsPath) {
    const settingsContent = await readFile(actualSettingsPath, "utf-8");
    const settings = JSON.parse(settingsContent);
    expect(settings.advanced?.debugLogging).toBe(newState === "checked");
  }

  // Test persistence by reopening
  await window.evaluate(() => {
    const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
      .__TEST_HELPERS__;
    helpers!.closeSettingsModal();
  });

  await openAdvancedSettings();
  const reopenedSwitch = window.locator('[data-testid="debug-logging-switch"]');
  const reopenedState = await reopenedSwitch.getAttribute("data-state");
  expect(reopenedState).toBe(newState);
});
```

#### Experimental Features Test

```typescript
test("saves experimental features toggle to preferences file", async () => {
  await openAdvancedSettings();

  // Find experimental features switch using test id
  const experimentalSwitch = window.locator(
    '[data-testid="experimental-features-switch"]',
  );

  const initialState = await experimentalSwitch.getAttribute("data-state");
  await experimentalSwitch.click();

  // Verify state changed
  const newState = await experimentalSwitch.getAttribute("data-state");
  expect(newState).not.toBe(initialState);

  // Save and verify persistence (same pattern as debug logging)
  // ... (follow same save/verify/reopen pattern)
});
```

#### Multiple Settings Test

```typescript
test("saves multiple advanced settings to preferences file", async () => {
  await openAdvancedSettings();

  // Toggle both switches
  const debugLoggingSwitch = window.locator(
    '[data-testid="debug-logging-switch"]',
  );
  const experimentalSwitch = window.locator(
    '[data-testid="experimental-features-switch"]',
  );

  await debugLoggingSwitch.click();
  await experimentalSwitch.click();

  // Save changes
  const saveButton = window.locator('[data-testid="save-button"]');
  await expect(saveButton).toBeEnabled();
  await saveButton.click();

  // Wait for save operation to complete
  await window.waitForTimeout(500);

  // Verify both settings saved to file
  if (actualSettingsPath) {
    const settingsContent = await readFile(actualSettingsPath, "utf-8");
    const settings = JSON.parse(settingsContent);
    expect(typeof settings.advanced?.debugLogging).toBe("boolean");
    expect(typeof settings.advanced?.experimentalFeatures).toBe("boolean");
  }
});
```

## Acceptance Criteria

### Functional Requirements

- ✓ Debug logging switch state persists to preferences.json under `advanced.debugLogging`
- ✓ Experimental features switch state persists to preferences.json under `advanced.experimentalFeatures`
- ✓ Settings are restored correctly when reopening the Advanced Settings tab
- ✓ Multiple advanced settings can be saved together in a single operation
- ✓ Tests use the same setup/teardown pattern as existing settings tests

### Testing Requirements

- ✓ Tests follow exact pattern from `appearance-settings.spec.ts`
- ✓ Tests use proper test ids (`debug-logging-switch`, `experimental-features-switch`)
- ✓ Tests verify file persistence by reading preferences.json
- ✓ Tests verify UI state persistence by reopening modal
- ✓ Clean state between tests (delete preferences.json)
- ✓ Proper Electron app lifecycle management

### Integration Requirements

- ✓ Works with existing test helper infrastructure
- ✓ Uses same modal navigation pattern
- ✓ Compatible with CI environment
- ✓ Follows same timeout and wait patterns

## Files to Modify

### New Files

- `tests/desktop/features/advanced-settings.spec.ts` - Main e2e test file

### Test IDs Required

The Advanced Settings component already has the required test IDs:

- `debug-logging-switch` - Debug logging toggle switch
- `experimental-features-switch` - Experimental features toggle switch

## Dependencies

- Existing test infrastructure in `tests/desktop/`
- Test helpers from `tests/desktop/support/`
- Advanced Settings component with proper test IDs
- Settings persistence system working correctly

## Implementation Notes

1. **Follow Existing Pattern**: Use exact same setup/teardown, navigation, and verification patterns from appearance-settings.spec.ts
2. **Focus on Persistence Only**: Do not test functional behavior, only that settings save and load correctly
3. **Use Test IDs**: Rely on data-testid attributes rather than text content for robust selectors
4. **File Verification**: Always verify settings are written to preferences.json with correct structure
5. **UI Verification**: Always verify settings are restored in UI after reopening modal

## Security Considerations

- Tests run in isolated test environment with clean preferences.json
- No sensitive data involved in advanced settings
- Test files are properly cleaned up after each test

## Performance Requirements

- Tests should complete within reasonable time limits
- Use appropriate timeouts for save operations (500ms as per existing pattern)
- Clean up test artifacts to prevent accumulation

### Log

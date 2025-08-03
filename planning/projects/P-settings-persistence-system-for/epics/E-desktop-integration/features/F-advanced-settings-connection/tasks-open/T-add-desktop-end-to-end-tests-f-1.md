---
kind: task
id: T-add-desktop-end-to-end-tests-f-1
title: Add desktop end-to-end tests for advanced settings modal
status: open
priority: low
prerequisites:
  - T-add-form-submission-handler-with
  - T-implement-advanced-settings
created: "2025-08-03T17:36:38.471717"
updated: "2025-08-03T17:36:38.471717"
schema_version: "1.1"
parent: F-advanced-settings-connection
---

# Add desktop end-to-end tests for advanced settings modal

## Context

Following the pattern established for general settings, we need to create comprehensive end-to-end tests for the advanced settings functionality. These tests will verify the complete flow of loading, modifying, and persisting advanced settings, including real-time application of debug logging and restart notifications. Don't add any additional tests that are not explicitly stated below.

## Implementation Requirements

### 1. Create Advanced Settings E2E Test File

Create `tests/desktop/e2e/settings/advancedSettings.test.ts`:

```typescript
import { test, expect } from "../fixtures/electronTest";
import { SettingsPage } from "../pages/SettingsPage";
import { getPersistedSettings } from "../helpers/settings";

test.describe("Advanced Settings", () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page, app }) => {
    // Reset settings before each test
    await app.evaluate(async ({ app }) => {
      const userDataPath = app.getPath("userData");
      const settingsPath = require("path").join(userDataPath, "settings.json");
      if (require("fs").existsSync(settingsPath)) {
        require("fs").unlinkSync(settingsPath);
      }
    });

    settingsPage = new SettingsPage(page);
    await settingsPage.open();
    await settingsPage.switchToTab("advanced");
  });

  test("should load default advanced settings", async () => {
    // Verify default values
    await expect(settingsPage.debugLoggingSwitch).not.toBeChecked();
    await expect(settingsPage.experimentalFeaturesSwitch).not.toBeChecked();
  });

  test("should preserve settings across app restart", async ({ app, page }) => {
    // Enable both settings
    await settingsPage.debugLoggingSwitch.click();
    await settingsPage.experimentalFeaturesSwitch.click();
    await settingsPage.saveButton.click();
    await settingsPage.waitForSaveSuccess();

    // Close and reopen settings
    await settingsPage.close();
    await page.reload();
    await settingsPage.open();
    await settingsPage.switchToTab("advanced");

    // Verify settings are preserved
    await expect(settingsPage.debugLoggingSwitch).toBeChecked();
    await expect(settingsPage.experimentalFeaturesSwitch).toBeChecked();
  });

  test("should track unsaved changes", async () => {
    // Make a change
    await settingsPage.debugLoggingSwitch.click();

    // Try to close modal
    await settingsPage.closeButton.click();

    // Verify unsaved changes dialog
    await expect(settingsPage.unsavedChangesDialog).toBeVisible();

    // Cancel and save
    await settingsPage.cancelUnsavedChanges.click();
    await settingsPage.saveButton.click();
    await settingsPage.waitForSaveSuccess();

    // Now should close without dialog
    await settingsPage.closeButton.click();
    await expect(settingsPage.modal).not.toBeVisible();
  });
});

test.describe("Advanced Settings Integration", () => {
  test("should save all settings tabs atomically", async ({ page, app }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.open();

    // Modify settings in each tab
    await settingsPage.switchToTab("general");
    await settingsPage.autoSaveSwitch.click();

    await settingsPage.switchToTab("appearance");
    await settingsPage.themeSelect.selectOption("dark");

    await settingsPage.switchToTab("advanced");
    await settingsPage.debugLoggingSwitch.click();

    // Save all settings
    await settingsPage.saveButton.click();
    await settingsPage.waitForSaveSuccess();

    // Verify all settings were saved
    const settings = await getPersistedSettings(app);
    expect(settings.general.autoSave).toBe(true);
    expect(settings.appearance.theme).toBe("dark");
    expect(settings.advanced.debugLogging).toBe(true);
  });
});
```

### 2. Update SettingsPage Helper

Update `tests/desktop/e2e/pages/SettingsPage.ts` to include advanced settings elements:

```typescript
export class SettingsPage {
  // ... existing properties ...

  // Advanced settings elements
  readonly debugLoggingSwitch = this.page.locator('switch[id="debug-mode"]');
  readonly experimentalFeaturesSwitch = this.page.locator(
    'switch[id="experimental-features"]',
  );
  readonly restartNotification = this.page.locator('[role="alert"]').filter({
    hasText: /restart/i,
  });

  async switchToTab(tab: "general" | "appearance" | "advanced") {
    await this.page.click(`button[role="tab"]:has-text("${tab}")`);
    await this.page.waitForSelector(`[role="tabpanel"][data-state="active"]`);
  }
}
```

### 3. Add Debug Logging Verification Helper

Create helper to verify debug logging state:

```typescript
export async function isDebugLoggingEnabled(
  app: ElectronApplication,
): Promise<boolean> {
  return app.evaluate(async () => {
    // Check if logger is in debug mode
    const logger = require("@fishbowl-ai/shared").logger;
    return logger.getLevel() === "debug";
  });
}
```

### 4. Add Tests to CI Pipeline

Ensure the new tests are included in the E2E test suite run by CI:

```yaml
# In .circleci/config.yml or GitHub Actions
- run:
    name: Run desktop E2E tests
    command: pnpm test:e2e:desktop
```

## Acceptance Criteria

- ✓ E2E tests verify default advanced settings load correctly
- ✓ E2E tests verify debug logging can be enabled and persisted
- ✓ E2E tests verify restart notification appears for experimental features
- ✓ E2E tests verify debug logging applies immediately without save
- ✓ E2E tests verify settings persist across app restart
- ✓ E2E tests verify error handling for save failures
- ✓ E2E tests verify unsaved changes tracking
- ✓ E2E tests verify atomic save across all settings tabs
- ✓ All tests pass consistently in CI environment

## Testing Requirements

E2E tests must verify:

- Complete user flow from opening to saving settings
- Real-time application of debug logging
- Restart notifications work correctly
- Settings persistence to actual file system
- Error scenarios are handled gracefully
- Integration with other settings tabs
- No flaky tests or race conditions

## File Locations

- Create test file: `tests/desktop/e2e/settings/advancedSettings.test.ts`
- Update page object: `tests/desktop/e2e/pages/SettingsPage.ts`
- Add helpers as needed: `tests/desktop/e2e/helpers/`
- Ensure CI runs these tests

### Log

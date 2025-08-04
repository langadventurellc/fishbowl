import { expect, test } from "@playwright/test";
import { readFile } from "fs/promises";
import path from "path";
import type { ElectronApplication, Page } from "playwright";
import playwright from "playwright";
import { fileURLToPath } from "url";

const { _electron: electron } = playwright;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test helpers interface for type safety
interface TestHelpers {
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  isSettingsModalOpen: () => boolean;
}

test.describe("Feature: Advanced Settings Persistence", () => {
  let electronApp: ElectronApplication;
  let window: Page;
  let actualSettingsPath: string; // Where settings are actually saved

  test.beforeAll(async () => {
    // Launch Electron app with test environment
    const electronPath = path.join(
      __dirname,
      "../../../apps/desktop/dist-electron/electron/main.js",
    );

    const launchArgs = [electronPath];
    if (process.env.CI) {
      launchArgs.push("--no-sandbox");
    }

    electronApp = await electron.launch({
      args: launchArgs,
      timeout: 30000,
      env: {
        ...process.env,
        NODE_ENV: "test", // Enable test helpers
      },
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState("domcontentloaded");

    // Wait for the app to fully initialize
    await window.waitForLoadState("networkidle");
  });

  test.beforeEach(async () => {
    // Get the settings file path and delete it to ensure clean state
    try {
      const userDataPath = await electronApp.evaluate(async ({ app }) => {
        return app.getPath("userData");
      });

      actualSettingsPath = path.join(userDataPath, "preferences.json");

      // Delete the settings file to start each test with a clean state
      try {
        const fs = await import("fs/promises");
        await fs.unlink(actualSettingsPath);
      } catch {
        // File might not exist, that's fine
      }
    } catch (error) {
      actualSettingsPath = ""; // Fallback
      console.warn("Could not setup clean test state:", error);
    }

    // Ensure modal is closed before each test
    await window.evaluate(() => {
      const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
        .__TEST_HELPERS__;
      if (helpers?.isSettingsModalOpen()) {
        helpers!.closeSettingsModal();
      }
    });

    // Force reload the page to ensure fresh state after file deletion
    await window.reload();
    await window.waitForLoadState("domcontentloaded");
    await window.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    // Ensure modal is closed first
    try {
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        if (helpers?.isSettingsModalOpen()) {
          helpers!.closeSettingsModal();
        }
      });
    } catch {
      // Window might be closed, ignore
    }

    // Clean up settings file after each test
    if (actualSettingsPath) {
      try {
        const fs = await import("fs/promises");
        await fs.unlink(actualSettingsPath);
      } catch {
        // File might not exist, that's fine
      }
    }
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  const openAdvancedSettings = async () => {
    // Open settings modal
    await window.evaluate(() => {
      const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
        .__TEST_HELPERS__;
      helpers!.openSettingsModal();
    });

    await expect(
      window.locator('[data-testid="settings-modal"]'),
    ).toBeVisible();

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

  test.describe("Scenario: Debug Logging Setting Persistence", () => {
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
      const reopenedSwitch = window.locator(
        '[data-testid="debug-logging-switch"]',
      );
      const reopenedState = await reopenedSwitch.getAttribute("data-state");
      expect(reopenedState).toBe(newState);
    });
  });

  test.describe("Scenario: Experimental Features Setting Persistence", () => {
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
        expect(settings.advanced?.experimentalFeatures).toBe(
          newState === "checked",
        );
      }

      // Test persistence by reopening
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.closeSettingsModal();
      });

      await openAdvancedSettings();
      const reopenedSwitch = window.locator(
        '[data-testid="experimental-features-switch"]',
      );
      const reopenedState = await reopenedSwitch.getAttribute("data-state");
      expect(reopenedState).toBe(newState);
    });
  });

  test.describe("Scenario: Multiple Advanced Settings Persistence", () => {
    test("saves multiple advanced settings to preferences file", async () => {
      await openAdvancedSettings();

      // Get initial states
      const debugLoggingSwitch = window.locator(
        '[data-testid="debug-logging-switch"]',
      );
      const experimentalSwitch = window.locator(
        '[data-testid="experimental-features-switch"]',
      );

      const initialDebugState =
        await debugLoggingSwitch.getAttribute("data-state");
      const initialExperimentalState =
        await experimentalSwitch.getAttribute("data-state");

      // Toggle both switches
      await debugLoggingSwitch.click();
      await experimentalSwitch.click();

      // Get new states after toggling
      const newDebugState = await debugLoggingSwitch.getAttribute("data-state");
      const newExperimentalState =
        await experimentalSwitch.getAttribute("data-state");

      // Verify both states changed
      expect(newDebugState).not.toBe(initialDebugState);
      expect(newExperimentalState).not.toBe(initialExperimentalState);

      // Save changes
      const saveButton = window.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Wait for save operation to complete
      await window.waitForTimeout(500);

      // Verify both settings saved to file with correct values
      if (actualSettingsPath) {
        const settingsContent = await readFile(actualSettingsPath, "utf-8");
        const settings = JSON.parse(settingsContent);
        expect(settings.advanced?.debugLogging).toBe(
          newDebugState === "checked",
        );
        expect(settings.advanced?.experimentalFeatures).toBe(
          newExperimentalState === "checked",
        );
      }

      // Test persistence by reopening and verifying both switches maintain state
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.closeSettingsModal();
      });

      await openAdvancedSettings();

      const reopenedDebugSwitch = window.locator(
        '[data-testid="debug-logging-switch"]',
      );
      const reopenedExperimentalSwitch = window.locator(
        '[data-testid="experimental-features-switch"]',
      );

      // Both switches should maintain their toggled state
      const finalDebugState =
        await reopenedDebugSwitch.getAttribute("data-state");
      const finalExperimentalState =
        await reopenedExperimentalSwitch.getAttribute("data-state");

      expect(finalDebugState).toBe(newDebugState);
      expect(finalExperimentalState).toBe(newExperimentalState);
    });
  });
});

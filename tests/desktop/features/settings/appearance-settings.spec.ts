import { expect, test } from "@playwright/test";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import {
  createElectronApp,
  openAppearanceSettings,
  type TestElectronApplication,
  type TestWindow,
} from "../../helpers";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Feature: Appearance Settings Persistence", () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;
  let actualSettingsPath: string; // Where settings are actually saved

  test.beforeAll(async () => {
    // Launch Electron app with test environment
    const electronPath = path.join(
      __dirname,
      "../../../../apps/desktop/dist-electron/electron/main.js",
    );
    electronApp = await createElectronApp(electronPath);

    window = electronApp.window;
    await window.waitForLoadState("domcontentloaded");

    // Wait for the app to fully initialize
    await window.waitForLoadState("networkidle");
  });

  test.beforeEach(async () => {
    // Get the settings file path and delete it to ensure clean state
    try {
      // Get the settings file path from the app's user data directory
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
      if (window.testHelpers?.isSettingsModalOpen()) {
        window.testHelpers!.closeSettingsModal();
      }
    });
  });

  test.afterEach(async () => {
    // Ensure modal is closed first
    try {
      await window.evaluate(() => {
        if (window.testHelpers?.isSettingsModalOpen()) {
          window.testHelpers!.closeSettingsModal();
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

  test.describe("Scenario: Theme Setting Persistence", () => {
    test("saves theme selection to preferences file", async () => {
      await openAppearanceSettings(window);

      // Verify default theme is system
      await expect(window.locator("#theme-system")).toBeChecked();

      // Change theme to light
      await window.locator("#theme-light").click();
      await expect(window.locator("#theme-light")).toBeChecked();

      // Save changes
      const saveButton = window.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Wait for save operation to complete
      await window.waitForTimeout(500);

      // Verify settings were saved to JSON file
      if (actualSettingsPath) {
        const settingsContent = await readFile(actualSettingsPath, "utf-8");
        const settings = JSON.parse(settingsContent);
        expect(settings.appearance?.theme).toBe("light");
      }
    });
  });

  test.describe("Scenario: Display Settings Persistence", () => {
    test("saves and loads timestamp display setting", async () => {
      await openAppearanceSettings(window);

      // First, determine what the current setting is and change to a different one
      const isAlwaysChecked = await window
        .locator("#timestamps-always")
        .isChecked();
      const isHoverChecked = await window
        .locator("#timestamps-hover")
        .isChecked();

      let targetSelector: string;
      let expectedSavedValue: string;

      // Choose a different setting than what's currently selected
      if (isAlwaysChecked) {
        targetSelector = "#timestamps-hover";
        expectedSavedValue = "hover";
      } else if (isHoverChecked) {
        targetSelector = "#timestamps-never";
        expectedSavedValue = "never";
      } else {
        targetSelector = "#timestamps-always";
        expectedSavedValue = "always";
      }

      // Change to the target setting
      await window.locator(targetSelector).click();
      await expect(window.locator(targetSelector)).toBeChecked();

      // Wait for form to register change and enable save button
      await window.waitForTimeout(200);

      // Save changes
      const saveButton = window.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Wait for save operation to complete
      await window.waitForTimeout(500);

      // Verify saved to file
      if (actualSettingsPath) {
        const settingsContent = await readFile(actualSettingsPath, "utf-8");
        const settings = JSON.parse(settingsContent);
        expect(settings.appearance?.showTimestamps).toBe(expectedSavedValue);
      }

      // Reopen and verify persistence
      await window.evaluate(() => {
        window.testHelpers!.closeSettingsModal();
      });

      await openAppearanceSettings(window);
      await expect(window.locator(targetSelector)).toBeChecked();
    });

    test("saves and loads activity time switch", async () => {
      await openAppearanceSettings(window);

      // Find the activity time switch and toggle it
      const activityTimeSwitch = window.getByRole("switch", {
        name: "Show last activity time",
      });

      const initialState = await activityTimeSwitch.getAttribute("data-state");
      await activityTimeSwitch.click();

      // Verify state changed
      const newState = await activityTimeSwitch.getAttribute("data-state");
      expect(newState).not.toBe(initialState);

      // Save changes
      const saveButton = window.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Wait for save operation to complete
      await window.waitForTimeout(500);

      // Verify saved to file
      if (actualSettingsPath) {
        const settingsContent = await readFile(actualSettingsPath, "utf-8");
        const settings = JSON.parse(settingsContent);
        expect(settings.appearance?.showActivityTime).toBe(
          newState === "checked",
        );
      }

      // Reopen and verify persistence
      await window.evaluate(() => {
        window.testHelpers!.closeSettingsModal();
      });

      await openAppearanceSettings(window);

      const reopenedSwitch = window.getByRole("switch", {
        name: "Show last activity time",
      });

      const reopenedState = await reopenedSwitch.getAttribute("data-state");
      expect(reopenedState).toBe(newState);
    });

    test("saves and loads compact list switch", async () => {
      await openAppearanceSettings(window);

      // Find the compact list switch and toggle it
      const compactListSwitch = window.getByRole("switch", {
        name: "Compact conversation list",
      });

      const initialState = await compactListSwitch.getAttribute("data-state");
      await compactListSwitch.click();

      // Verify state changed
      const newState = await compactListSwitch.getAttribute("data-state");
      expect(newState).not.toBe(initialState);

      // Save changes
      const saveButton = window.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Wait for save operation to complete
      await window.waitForTimeout(500);

      // Verify saved to file
      if (actualSettingsPath) {
        const settingsContent = await readFile(actualSettingsPath, "utf-8");
        const settings = JSON.parse(settingsContent);
        expect(settings.appearance?.compactList).toBe(newState === "checked");
      }

      // Reopen and verify persistence
      await window.evaluate(() => {
        window.testHelpers!.closeSettingsModal();
      });

      await openAppearanceSettings(window);

      const reopenedSwitch = window.getByRole("switch", {
        name: "Compact conversation list",
      });

      const reopenedState = await reopenedSwitch.getAttribute("data-state");
      expect(reopenedState).toBe(newState);
    });
  });

  test.describe("Scenario: Chat Display Settings Persistence", () => {
    test("saves and loads font size setting", async () => {
      await openAppearanceSettings(window);

      // Find the font size slider
      const fontSizeSlider = window
        .locator("div")
        .filter({ hasText: "Message Font Size" })
        .locator('span[role="slider"]');

      // Change font size to 16px (move slider to the right)
      await fontSizeSlider.click();
      await window.keyboard.press("ArrowRight");
      await window.keyboard.press("ArrowRight");

      // Verify the display shows 16px
      await expect(
        window.locator("span").filter({ hasText: "16px" }),
      ).toBeVisible();

      // Save changes
      const saveButton = window.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Wait for save operation to complete
      await window.waitForTimeout(500);

      // Verify saved to file
      if (actualSettingsPath) {
        const settingsContent = await readFile(actualSettingsPath, "utf-8");
        const settings = JSON.parse(settingsContent);
        expect(settings.appearance?.fontSize).toBe(16);
      }

      // Reopen and verify persistence
      await window.evaluate(() => {
        window.testHelpers!.closeSettingsModal();
      });

      await openAppearanceSettings(window);

      // Verify font size is still 16px
      await expect(
        window.locator("span").filter({ hasText: "16px" }),
      ).toBeVisible();
    });

    test("saves and loads message spacing setting", async () => {
      await openAppearanceSettings(window);

      // Change message spacing to "relaxed"
      await window.locator("#spacing-relaxed").click();
      await expect(window.locator("#spacing-relaxed")).toBeChecked();

      // Save changes
      const saveButton = window.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Wait for save operation to complete
      await window.waitForTimeout(500);

      // Verify saved to file
      if (actualSettingsPath) {
        const settingsContent = await readFile(actualSettingsPath, "utf-8");
        const settings = JSON.parse(settingsContent);
        expect(settings.appearance?.messageSpacing).toBe("relaxed");
      }

      // Reopen and verify persistence
      await window.evaluate(() => {
        window.testHelpers!.closeSettingsModal();
      });

      await openAppearanceSettings(window);
      await expect(window.locator("#spacing-relaxed")).toBeChecked();
    });
  });

  test.describe("Scenario: Multiple Settings Persistence", () => {
    test("saves multiple appearance settings to preferences file", async () => {
      await openAppearanceSettings(window);

      // Change multiple settings
      await window.locator("#timestamps-never").click();
      await window.locator("#spacing-compact").click();

      // Toggle activity time switch
      const activityTimeSwitch = window.getByRole("switch", {
        name: "Show last activity time",
      });
      await activityTimeSwitch.click();

      // Save changes
      const saveButton = window.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Wait for save operation to complete
      await window.waitForTimeout(500);

      // Verify all settings saved to file
      if (actualSettingsPath) {
        const settingsContent = await readFile(actualSettingsPath, "utf-8");
        const settings = JSON.parse(settingsContent);
        expect(settings.appearance?.showTimestamps).toBe("never");
        expect(settings.appearance?.messageSpacing).toBe("compact");
        expect(typeof settings.appearance?.showActivityTime).toBe("boolean");
      }
    });
  });
});

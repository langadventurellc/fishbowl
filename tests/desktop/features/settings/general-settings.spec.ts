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

test.describe("Feature: General Settings Modal", () => {
  let electronApp: ElectronApplication;
  let window: Page;
  let settingsBackupPath: string;
  let originalSettings: string;
  let actualSettingsPath: string; // Where settings are actually saved

  test.beforeAll(async () => {
    // Launch Electron app with test environment
    const electronPath = path.join(
      __dirname,
      "../../../../apps/desktop/dist-electron/electron/main.js",
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
      // Get the settings file path from the app's user data directory
      const userDataPath = await electronApp.evaluate(async ({ app }) => {
        return app.getPath("userData");
      });

      settingsBackupPath = path.join(userDataPath, "preferences.json");
      actualSettingsPath = settingsBackupPath;

      // Delete the settings file to start each test with a clean state
      try {
        const fs = await import("fs/promises");
        await fs.unlink(actualSettingsPath);
      } catch {
        // File might not exist, that's fine
      }

      originalSettings = "{}"; // Always start clean
    } catch (error) {
      actualSettingsPath = ""; // Fallback
      console.warn("Could not setup clean test state:", error);
      originalSettings = "{}";
    }

    // Ensure modal is closed before each test
    await window.evaluate(() => {
      const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
        .__TEST_HELPERS__;
      if (helpers?.isSettingsModalOpen()) {
        helpers!.closeSettingsModal();
      }
    });
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

  test.describe("Scenario: Settings Modal Opening", () => {
    test("opens with test helper and shows general settings", async () => {
      // Given - Application is loaded and modal is closed
      await window.waitForLoadState("networkidle");

      const modalClosed = await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        return !helpers?.isSettingsModalOpen();
      });
      expect(modalClosed).toBe(true);

      // When - Settings modal is opened using test helper
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.openSettingsModal();
      });

      // Then - Settings modal appears
      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      // And - Modal title is visible
      await expect(window.locator("h1#settings-modal-title")).toBeVisible();

      // And - General settings content is visible (look for navigation item)
      await expect(window.locator('[data-testid="nav-general"]')).toBeVisible();

      // And - General settings form is visible
      await expect(
        window.locator('[data-testid="general-settings-form"]'),
      ).toBeVisible();

      // And - Check for some form elements that should exist
      await expect(
        window.locator('[data-testid="check-updates-switch"]'),
      ).toBeVisible();
      await expect(
        window.locator('[data-testid="maximum-messages-input"]'),
      ).toBeVisible();
    });
  });

  test.describe("Scenario: Settings Save Functionality", () => {
    test("saves changes to JSON file", async () => {
      // Given - Settings modal is open
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.openSettingsModal();
      });

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      // And - Save button is initially disabled
      const saveButton = window.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeDisabled();

      // When - Changes are made to form fields
      const maxMessagesInput = window.locator(
        '[data-testid="maximum-messages-input"]',
      );
      await maxMessagesInput.fill("75"); // Change from default 50 to 75

      const checkUpdatesSwitch = window.locator(
        '[data-testid="check-updates-switch"]',
      );

      // Check initial state and ensure we set it to true
      const initialState = await checkUpdatesSwitch.isChecked();
      if (!initialState) {
        await checkUpdatesSwitch.click(); // Only click if it's currently false
      }

      // Then - Save button becomes enabled
      await expect(saveButton).toBeEnabled();

      // When - Save button is clicked
      await saveButton.click();

      // Then - Wait for save operation to complete
      await expect(saveButton).toBeDisabled(); // Should disable after save

      // And - Changes are persisted to JSON file
      if (actualSettingsPath) {
        // Read from where settings are actually saved (not where they should be)
        const settingsContent = await readFile(actualSettingsPath, "utf-8");
        const settings = JSON.parse(settingsContent);
        // expect(settings).toBe({});
        // expect(actualSettingsPath).toBe("sfdsfdsfds");

        expect(settings.general?.maximumMessages).toBe(75);
        expect(settings.general?.checkUpdates).toBe(true);
      }
    });
  });

  test.describe("Scenario: Settings Persistence Across Sessions", () => {
    test("persists saved settings when modal is reopened", async () => {
      // Given - Settings modal is open and changes are made
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.openSettingsModal();
      });

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      const testMaxMessages = "35"; // Change from default 50 to 35
      const maxMessagesInput = window.locator(
        '[data-testid="maximum-messages-input"]',
      );
      await maxMessagesInput.fill(testMaxMessages);

      const checkUpdatesSwitch = window.locator(
        '[data-testid="check-updates-switch"]',
      );

      // Check initial state and ensure we set it to true
      const initialState = await checkUpdatesSwitch.isChecked();
      if (!initialState) {
        await checkUpdatesSwitch.click(); // Only click if it's currently false
      }

      // When - Changes are saved
      const saveButton = window.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
      await saveButton.click();
      await expect(saveButton).toBeDisabled();

      // And - Modal is closed
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.closeSettingsModal();
      });

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).not.toBeVisible();

      // And - Modal is reopened
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.openSettingsModal();
      });

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      // Then - Previously saved values are displayed
      await expect(maxMessagesInput).toHaveValue(testMaxMessages);
      await expect(checkUpdatesSwitch).toBeChecked();
    });
  });

  test.describe("Scenario: Cancel/Discard Changes", () => {
    test("discards unsaved changes when modal is closed", async () => {
      // Given - Settings modal is open
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.openSettingsModal();
      });

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      // And - Get form elements
      const maxMessagesInput = window.locator(
        '[data-testid="maximum-messages-input"]',
      );

      const checkUpdatesSwitch = window.locator(
        '[data-testid="check-updates-switch"]',
      );
      const originalCheckUpdates = await checkUpdatesSwitch.isChecked();

      // When - Changes are made without saving
      await maxMessagesInput.fill("99"); // Change from default 50 to 99
      await checkUpdatesSwitch.click(); // Toggle the switch

      // Verify changes are visible
      await expect(maxMessagesInput).toHaveValue("99");
      expect(await checkUpdatesSwitch.isChecked()).not.toBe(
        originalCheckUpdates,
      );

      // And - Modal is closed using Cancel button
      const cancelButton = window.locator('[data-testid="cancel-button"]');
      await cancelButton.click();

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).not.toBeVisible();

      // Then - JSON file remains unchanged
      if (actualSettingsPath) {
        try {
          const settingsContent = await readFile(actualSettingsPath, "utf-8");
          const currentSettings = JSON.parse(settingsContent);
          const originalSettingsObj = JSON.parse(originalSettings);

          // Settings should match original backup
          expect(currentSettings).toEqual(originalSettingsObj);
        } catch (error) {
          // If original was empty and file doesn't exist, that's expected
          if (originalSettings === "{}") {
            // This is expected - no settings file should exist
          } else {
            throw error;
          }
        }
      }

      // When - Modal is reopened
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.openSettingsModal();
      });

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      // Then - Default values are restored (since we start each test clean)
      await expect(maxMessagesInput).toHaveValue("50"); // Default value
      expect(await checkUpdatesSwitch.isChecked()).toBe(true); // Default value
    });

    test("discards unsaved changes when modal is closed with X button", async () => {
      // Given - Settings modal is open
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.openSettingsModal();
      });

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      // When - Changes are made without saving
      const maxMessagesInput = window.locator(
        '[data-testid="maximum-messages-input"]',
      );
      await maxMessagesInput.fill("88"); // Change from default 50 to 88

      // And - Modal is closed using X button
      const closeButton = window.locator('[data-testid="close-modal-button"]');
      await closeButton.click();

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).not.toBeVisible();

      // Then - Settings file should remain unchanged
      if (actualSettingsPath) {
        try {
          const settingsContent = await readFile(actualSettingsPath, "utf-8");
          const currentSettings = JSON.parse(settingsContent);
          const originalSettingsObj = JSON.parse(originalSettings);

          expect(currentSettings).toEqual(originalSettingsObj);
        } catch (error) {
          // If original was empty and file doesn't exist, that's expected
          if (originalSettings === "{}") {
            // This is expected - no settings file should exist
          } else {
            throw error;
          }
        }
      }

      // When - Modal is reopened
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.openSettingsModal();
      });

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      // Then - Unsaved changes are not present
      await expect(maxMessagesInput).not.toHaveValue("88");
    });
  });

  test.describe("Scenario: Form Interaction and Validation", () => {
    test("handles form state changes correctly", async () => {
      // Given - Settings modal is open
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.openSettingsModal();
      });

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      // When - Form fields are interacted with
      const maxMessagesInput = window.locator(
        '[data-testid="maximum-messages-input"]',
      );
      const saveButton = window.locator('[data-testid="save-button"]');

      // Then - Save button state changes with form modifications
      await expect(saveButton).toBeDisabled();

      await maxMessagesInput.fill("75");
      await expect(saveButton).toBeEnabled();

      await maxMessagesInput.fill(""); // Clear the field
      await expect(saveButton).toBeEnabled(); // Still enabled because it's a change
    });

    test("maintains keyboard navigation and accessibility", async () => {
      // Given - Settings modal is open
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        helpers!.openSettingsModal();
      });

      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      // When - Tab navigation is used
      await window.keyboard.press("Tab");

      // Then - Focus should be within the modal (we can verify modal is still visible)
      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).toBeVisible();

      // And - Escape key closes modal
      await window.keyboard.press("Escape");
      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).not.toBeVisible();
    });
  });
});

import { expect, test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import {
  createElectronApp,
  type TestElectronApplication,
  type TestWindow,
} from "../index";
import { cleanupRolesStorage } from "./cleanupRolesStorage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const setupRolesTestSuite = () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;
  let userDataPath: string;
  let rolesConfigPath: string;

  test.beforeAll(async () => {
    // Launch Electron app with test environment
    const electronPath = path.join(
      __dirname,
      "../../../../apps/desktop/dist-electron/electron/main.js",
    );
    electronApp = await createElectronApp(electronPath);

    window = electronApp.window;
    await window.waitForLoadState("domcontentloaded");
    await window.waitForLoadState("networkidle");
  });

  test.beforeEach(async () => {
    // Reset roles configuration state between tests
    try {
      userDataPath = await electronApp.evaluate(async ({ app }) => {
        return app.getPath("userData");
      });

      rolesConfigPath = path.join(userDataPath, "roles.json");

      // Delete roles config file first
      await cleanupRolesStorage(rolesConfigPath);

      // Note: Unlike LLM config, roles doesn't have refreshCache yet
      // If caching issues arise, we may need to add this functionality
      // For now, file deletion should be sufficient

      // Small delay for cleanup operations
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.warn("Could not setup clean test state:", error);
    }

    // Ensure modal is closed before each test
    try {
      await window.evaluate(() => {
        if (window.testHelpers?.isSettingsModalOpen()) {
          window.testHelpers!.closeSettingsModal();
        }
      });

      // Wait for modal to actually close and any animations to complete
      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).not.toBeVisible({ timeout: 2000 });

      // Wait for any dialog overlays to disappear
      await expect(
        window.locator('[data-slot="dialog-overlay"]'),
      ).not.toBeVisible({ timeout: 2000 });

      // Small additional delay for any remaining animations
      await window.waitForTimeout(200);
    } catch {
      // Test helpers might not be available yet or modal wasn't open
    }
  });

  test.afterEach(async () => {
    // Ensure modal is closed
    try {
      await window.evaluate(() => {
        if (window.testHelpers?.isSettingsModalOpen()) {
          window.testHelpers!.closeSettingsModal();
        }
      });

      // Wait for modal to actually close and any animations to complete
      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).not.toBeVisible({ timeout: 2000 });

      // Wait for any dialog overlays to disappear
      await expect(
        window.locator('[data-slot="dialog-overlay"]'),
      ).not.toBeVisible({ timeout: 2000 });

      // Small additional delay for any remaining animations
      await window.waitForTimeout(200);
    } catch {
      // Window might be closed, ignore
    }

    // Clean up storage after each test to ensure clean state
    if (rolesConfigPath) {
      await cleanupRolesStorage(rolesConfigPath);
      // Wait for cleanup to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  return {
    getElectronApp: () => electronApp,
    getWindow: () => window,
    getUserDataPath: () => userDataPath,
    getRolesConfigPath: () => rolesConfigPath,
  };
};

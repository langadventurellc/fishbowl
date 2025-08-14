import { expect, test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import {
  createElectronApp,
  type TestElectronApplication,
  type TestWindow,
} from "../index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const setupRolesTestSuite = () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;
  let userDataPath: string;
  let rolesConfigPath: string;
  let cleanRolesData: string; // Store the clean default roles JSON

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

    // Get roles config path for tests
    userDataPath = await electronApp.evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
    rolesConfigPath = path.join(userDataPath, "roles.json");

    // Load clean default roles data directly from source (no data poisoning risk)
    try {
      const fs = await import("fs/promises");
      const defaultRolesSourcePath = path.join(
        __dirname,
        "../../../../packages/shared/src/data/defaultRoles.json",
      );
      cleanRolesData = await fs.readFile(defaultRolesSourcePath, "utf-8");
    } catch (error) {
      console.warn("Could not read default roles source data:", error);
      // Fallback - this should never happen in normal operation
      cleanRolesData = JSON.stringify({
        schemaVersion: "1.0.0",
        roles: [],
        lastUpdated: new Date().toISOString(),
      });
    }
  });

  test.beforeEach(async () => {
    // Restore clean default roles state before each test
    try {
      if (rolesConfigPath && cleanRolesData) {
        const fs = await import("fs/promises");
        await fs.writeFile(rolesConfigPath, cleanRolesData, "utf-8");
      }
    } catch (error) {
      console.warn("Could not restore clean roles state:", error);
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

    // No need to clean up storage - beforeEach restores clean state
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

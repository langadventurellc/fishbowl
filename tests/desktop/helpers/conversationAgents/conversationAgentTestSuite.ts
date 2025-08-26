import { expect, test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { createElectronApp } from "../createElectronApp";
import { resetDatabase } from "../database";
import { cleanupAgentsStorage } from "../settings/cleanupAgentsStorage";
import type { TestElectronApplication } from "../TestElectronApplication";
import type { TestWindow } from "../TestWindow";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Test suite setup specifically for conversation agent tests
 * Provides proper lifecycle management with conversation_agents table cleanup
 * and integration with database reset and conversation agent cleanup patterns.
 */
export const setupConversationAgentTestSuite = () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;
  let userDataPath: string;
  let agentsConfigPath: string;

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

    // Wait for database migrations to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  test.beforeEach(async () => {
    // Reset database to clean state including conversation_agents table
    await resetDatabase(electronApp);

    // Reset agent configuration state between tests
    try {
      userDataPath = await electronApp.evaluate(async ({ app }) => {
        return app.getPath("userData");
      });

      agentsConfigPath = path.join(userDataPath, "agents.json");

      // Delete agents config file
      await cleanupAgentsStorage(agentsConfigPath);

      // Clear the in-memory cache in the Electron main process
      await window.evaluate(async () => {
        const electronAPI = (
          globalThis as {
            electronAPI?: {
              agents?: { refreshCache?: () => Promise<void> };
            };
          }
        ).electronAPI;
        if (electronAPI?.agents?.refreshCache) {
          await electronAPI.agents.refreshCache();
        }
      });

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

    // Ensure conversation agent modal is closed
    try {
      const addAgentModal = window.locator('[role="dialog"]').filter({
        hasText: "Add Agent to Conversation",
      });
      await expect(addAgentModal).not.toBeVisible({ timeout: 1000 });
    } catch {
      // Modal wasn't open, continue
    }

    // Wait for app to be ready for testing
    await window.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    // Ensure all modals are closed
    try {
      await window.evaluate(() => {
        if (window.testHelpers?.isSettingsModalOpen()) {
          window.testHelpers!.closeSettingsModal();
        }
      });

      // Wait for modals to actually close
      await expect(
        window.locator('[data-testid="settings-modal"]'),
      ).not.toBeVisible({ timeout: 2000 });

      await expect(
        window.locator('[data-slot="dialog-overlay"]'),
      ).not.toBeVisible({ timeout: 2000 });

      // Ensure conversation agent modal is closed
      const addAgentModal = window.locator('[role="dialog"]').filter({
        hasText: "Add Agent to Conversation",
      });
      await expect(addAgentModal).not.toBeVisible({ timeout: 1000 });

      await window.waitForTimeout(200);
    } catch {
      // Window might be closed, ignore
    }

    // Clean up storage after each test
    if (agentsConfigPath) {
      await cleanupAgentsStorage(agentsConfigPath);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Reset database including conversation_agents cleanup
    if (electronApp) {
      await resetDatabase(electronApp);
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
    getAgentsConfigPath: () => agentsConfigPath,
  };
};

import { expect, test } from "@playwright/test";
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

test.describe("Simple Modal Test", () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeAll(async () => {
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
        NODE_ENV: "test",
      },
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState("domcontentloaded");
    await window.waitForLoadState("networkidle");
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test("should open settings modal", async () => {
    // Open the modal
    await window.evaluate(() => {
      const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
        .__TEST_HELPERS__;
      helpers!.openSettingsModal();
    });

    // Check if modal appears
    await expect(
      window.locator('[data-testid="settings-modal"]'),
    ).toBeVisible();

    // Look for the specific Settings title in the modal header
    await expect(window.locator("h1#settings-modal-title")).toBeVisible();

    // Close the modal
    await window.evaluate(() => {
      const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
        .__TEST_HELPERS__;
      helpers!.closeSettingsModal();
    });

    // Verify modal is closed
    await expect(
      window.locator('[data-testid="settings-modal"]'),
    ).not.toBeVisible();
  });
});

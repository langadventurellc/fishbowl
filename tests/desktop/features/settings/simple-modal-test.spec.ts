import { expect, test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

import {
  createElectronApp,
  type TestElectronApplication,
  type TestWindow,
} from "../../helpers";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Simple Modal Test", () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;

  test.beforeAll(async () => {
    const electronPath = path.join(
      __dirname,
      "../../../../apps/desktop/dist-electron/electron/main.js",
    );
    electronApp = await createElectronApp(electronPath);

    window = electronApp.window;
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
      window.testHelpers!.openSettingsModal();
    });

    // Check if modal appears
    await expect(
      window.locator('[data-testid="settings-modal"]'),
    ).toBeVisible();

    // Look for the specific Settings title in the modal header
    await expect(window.locator("h1#settings-modal-title")).toBeVisible();

    // Close the modal
    await window.evaluate(() => {
      window.testHelpers!.closeSettingsModal();
    });

    // Verify modal is closed
    await expect(
      window.locator('[data-testid="settings-modal"]'),
    ).not.toBeVisible();
  });
});

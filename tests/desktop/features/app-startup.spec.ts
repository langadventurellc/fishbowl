import { expect, test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

import {
  createElectronApp,
  type TestElectronApplication,
  type TestWindow,
} from "../helpers";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Feature: Application Startup", () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;

  test.beforeAll(async () => {
    // Given - Fresh application state
    const electronPath = path.join(
      __dirname,
      "../../../apps/desktop/dist-electron/electron/main.js",
    );
    electronApp = await createElectronApp(electronPath);

    // Wait for the first window to be ready
    window = electronApp.window;
    await window.waitForLoadState("domcontentloaded");
  });

  test.afterAll(async () => {
    // Cleanup - Close the application
    if (electronApp) {
      await electronApp.close();
    }
  });

  test.describe("Scenario: Application shutdown", () => {
    test("should close gracefully", async () => {
      // Given - Application is running
      expect(electronApp).toBeDefined();

      // When - Application close is requested
      const closePromise = electronApp.close();

      // Then - Application should close without errors
      await expect(closePromise).resolves.toBeUndefined();
    });
  });
});

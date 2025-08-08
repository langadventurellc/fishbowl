import { expect, test } from "@playwright/test";
import path from "path";
import type { ElectronApplication, Page } from "playwright";
import playwright from "playwright";
import { fileURLToPath } from "url";

const { _electron: electron } = playwright;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Feature: Application Startup", () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeAll(async () => {
    // Given - Fresh application state
    const electronPath = path.join(
      __dirname,
      "../../../apps/desktop/dist-electron/electron/main.js",
    );

    // Prepare launch args with no-sandbox for CI
    const launchArgs = [electronPath];
    if (process.env.CI) {
      launchArgs.push("--no-sandbox");
    }

    electronApp = await electron.launch({
      args: launchArgs,
      timeout: 30000,
    });

    // Wait for the first window to be ready
    window = await electronApp.firstWindow();
    await window.waitForLoadState("domcontentloaded");
  });

  test.afterAll(async () => {
    // Cleanup - Close the application
    if (electronApp) {
      await electronApp.close();
    }
  });

  test.describe("Scenario: First application launch", () => {
    test("should display application window with correct title", async () => {
      // Given - Fresh application state (handled in beforeAll)

      // When - Application is launched (handled in beforeAll)
      await window.waitForLoadState("networkidle");

      // Then - Application window is visible with correct title
      const title = await window.title();
      expect(title).toContain("Fishbowl");
    });
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

import { test, expect } from "@playwright/test";
import playwright from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import type { ElectronApplication, Page } from "playwright";

const { _electron: electron } = playwright;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Feature: Application Startup", () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeAll(async () => {
    // Given - Fresh application state
    const electronPath = path.join(
      __dirname,
      "../../../../apps/desktop/dist-electron/main.js",
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

    test("should display Hello World message", async () => {
      // Given - Application is running
      expect(window).toBeDefined();

      // When - Main content loads
      await window.waitForLoadState("networkidle");
      await window.waitForSelector("h1");

      // Then - Hello World message is visible
      const content = await window.textContent("body");
      expect(content).toContain("Welcome to Fishbowl Desktop");
    });

    test("should have proper window dimensions", async () => {
      // Given - Application window is open
      expect(window).toBeDefined();

      // When - Window dimensions are checked
      const viewport = window.viewportSize();

      // Then - Window has expected minimum dimensions
      expect(viewport).toBeDefined();
      if (viewport) {
        expect(viewport.width).toBeGreaterThanOrEqual(800);
        expect(viewport.height).toBeGreaterThanOrEqual(600);
      }
    });

    test("should respond to user interactions", async () => {
      // Given - Application is fully loaded
      await window.waitForLoadState("networkidle");

      // When - User attempts to interact with the window
      // Click on the body to ensure the window is interactive
      await window.click("body");

      // Then - Window should remain responsive
      const title = await window.title();
      expect(title).toBeDefined();
      expect(title.length).toBeGreaterThan(0);
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

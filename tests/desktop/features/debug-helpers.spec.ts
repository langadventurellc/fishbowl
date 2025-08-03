import { test, expect } from "@playwright/test";
import playwright from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import type { ElectronApplication, Page } from "playwright";

const { _electron: electron } = playwright;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Debug: Test Helpers", () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeAll(async () => {
    const electronPath = path.join(
      __dirname,
      "../../../apps/desktop/dist-electron/electron/main.js",
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
        NODE_ENV: "test", // Ensure test environment
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

  test("should expose test helpers", async () => {
    // Debug what's available on window
    const windowProps = await window.evaluate(() => {
      return {
        hasTestHelpers: "__TEST_HELPERS__" in window,
        windowKeys: Object.keys(window).filter((key) => key.includes("TEST")),
        testHelpersType: typeof (window as { __TEST_HELPERS__?: unknown })
          .__TEST_HELPERS__,
      };
    });

    console.log("Window properties:", windowProps);

    // Check if helpers exist
    const helpersExist = await window.evaluate(() => {
      return (
        (window as { __TEST_HELPERS__?: unknown }).__TEST_HELPERS__ !==
        undefined
      );
    });

    expect(helpersExist).toBe(true);
  });
});

import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

import {
  createElectronApp,
  type TestElectronApplication,
  type TestWindow,
} from "../helpers";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Debug: Test Helpers", () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;

  test.beforeAll(async () => {
    const electronPath = path.join(
      __dirname,
      "../../../apps/desktop/dist-electron/electron/main.js",
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

import playwright from "playwright";

import type { TestElectronApplication } from "./TestElectronApplication";
import type { TestWindow } from "./TestWindow";

const { _electron: electron } = playwright;

/**
 * Creates an Electron application instance with standardized test configuration
 * @param electronPath - The path to the electron main.js file
 * @returns Promise<TestElectronApplication>
 */
export async function createElectronApp(
  electronPath: string,
): Promise<TestElectronApplication> {
  const launchArgs = [electronPath];
  if (process.env.CI) {
    launchArgs.push("--no-sandbox");
  }

  let app = (await electron.launch({
    args: launchArgs,
    timeout: 30000,
    env: {
      ...process.env,
      NODE_ENV: "test", // Enable test helpers
    },
  })) as TestElectronApplication;

  const window = await app.firstWindow();

  // Wait for the app to initialize and inject testHelpers into browser window
  await window.waitForLoadState("domcontentloaded");
  await window.evaluate(() => {
    // Make __TEST_HELPERS__ also available as testHelpers for cleaner API
    (
      window as typeof window & {
        testHelpers?: unknown;
        __TEST_HELPERS__?: unknown;
      }
    ).testHelpers = (
      window as typeof window & { __TEST_HELPERS__?: unknown }
    ).__TEST_HELPERS__;
  });

  app.window = window as TestWindow;
  return app;
}

import { test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import {
  createElectronApp,
  type TestElectronApplication,
  type TestWindow,
} from "../index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const setupPersonalitiesTestSuite = () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;
  let userDataPath: string;
  let personalitiesConfigPath: string;
  let cleanPersonalitiesData: string; // Store the clean default personalities JSON

  test.beforeAll(async () => {
    // Load clean default personalities data directly from source (no data poisoning risk)
    try {
      const fs = await import("fs/promises");
      const defaultPersonalitiesSourcePath = path.join(
        __dirname,
        "../../../../packages/shared/src/data/defaultPersonalities.json",
      );
      cleanPersonalitiesData = await fs.readFile(
        defaultPersonalitiesSourcePath,
        "utf-8",
      );
    } catch (error) {
      console.warn("Could not read default personalities source data:", error);
      // Fallback - this should never happen in normal operation
      cleanPersonalitiesData = JSON.stringify({
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: new Date().toISOString(),
      });
    }
  });

  test.beforeEach(async () => {
    // Create fresh Electron app instance for each test
    const electronPath = path.join(
      __dirname,
      "../../../../apps/desktop/dist-electron/electron/main.js",
    );
    electronApp = await createElectronApp(electronPath);

    window = electronApp.window;
    await window.waitForLoadState("domcontentloaded");
    await window.waitForLoadState("networkidle");

    // Get personalities config path for this test instance
    userDataPath = await electronApp.evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
    personalitiesConfigPath = path.join(userDataPath, "personalities.json");

    // Restore clean default personalities state before each test
    try {
      if (personalitiesConfigPath && cleanPersonalitiesData) {
        const fs = await import("fs/promises");
        await fs.writeFile(
          personalitiesConfigPath,
          cleanPersonalitiesData,
          "utf-8",
        );
      }
    } catch (error) {
      console.warn("Could not restore clean personalities state:", error);
    }
  });

  test.afterEach(async () => {
    // Close the Electron app instance after each test
    if (electronApp) {
      try {
        await electronApp.close();
      } catch (error) {
        console.warn("Could not close Electron app:", error);
      }
    }

    // Delete the personalities.json file from user data path
    if (personalitiesConfigPath) {
      try {
        const fs = await import("fs/promises");
        await fs.unlink(personalitiesConfigPath);
      } catch (error) {
        // File might not exist, which is fine
        console.warn("Could not delete personalities.json file:", error);
      }
    }
  });

  return {
    getElectronApp: () => electronApp,
    getWindow: () => window,
    getUserDataPath: () => userDataPath,
    getPersonalitiesConfigPath: () => personalitiesConfigPath,
  };
};

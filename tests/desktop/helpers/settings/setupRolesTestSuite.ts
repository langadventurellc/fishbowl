import { test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import {
  createElectronApp,
  type TestElectronApplication,
  type TestWindow,
} from "../index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const setupRolesTestSuite = () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;
  let userDataPath: string;
  let rolesConfigPath: string;
  let cleanRolesData: string; // Store the clean default roles JSON

  test.beforeAll(async () => {
    // Load clean default roles data directly from source (no data poisoning risk)
    try {
      const fs = await import("fs/promises");
      const defaultRolesSourcePath = path.join(
        __dirname,
        "../../../../packages/shared/src/data/defaultRoles.json",
      );
      cleanRolesData = await fs.readFile(defaultRolesSourcePath, "utf-8");
    } catch (error) {
      console.warn("Could not read default roles source data:", error);
      // Fallback - this should never happen in normal operation
      cleanRolesData = JSON.stringify({
        schemaVersion: "1.0.0",
        roles: [],
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

    // Get roles config path for this test instance
    userDataPath = await electronApp.evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
    rolesConfigPath = path.join(userDataPath, "roles.json");

    // Restore clean default roles state before each test
    try {
      if (rolesConfigPath && cleanRolesData) {
        const fs = await import("fs/promises");
        await fs.writeFile(rolesConfigPath, cleanRolesData, "utf-8");
      }
    } catch (error) {
      console.warn("Could not restore clean roles state:", error);
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

    // Delete the roles.json file from user data path
    if (rolesConfigPath) {
      try {
        const fs = await import("fs/promises");
        await fs.unlink(rolesConfigPath);
      } catch (error) {
        // File might not exist, which is fine
        console.warn("Could not delete roles.json file:", error);
      }
    }
  });

  return {
    getElectronApp: () => electronApp,
    getWindow: () => window,
    getUserDataPath: () => userDataPath,
    getRolesConfigPath: () => rolesConfigPath,
  };
};

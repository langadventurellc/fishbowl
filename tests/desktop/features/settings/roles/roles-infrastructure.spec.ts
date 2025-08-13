import { expect, test } from "@playwright/test";
import { setupRolesTestSuite } from "./setupRolesTestSuite";

test.describe("Roles Test Suite Infrastructure", () => {
  const { getElectronApp, getWindow, getUserDataPath, getRolesConfigPath } =
    setupRolesTestSuite();

  test.describe("Infrastructure Validation", () => {
    test("should provide access to electron app", () => {
      const app = getElectronApp();
      expect(app).toBeDefined();
    });

    test("should provide access to window", () => {
      const window = getWindow();
      expect(window).toBeDefined();
    });

    test("should provide user data path", () => {
      const userDataPath = getUserDataPath();
      expect(userDataPath).toBeDefined();
      expect(typeof userDataPath).toBe("string");
    });

    test("should provide roles config path", () => {
      const rolesConfigPath = getRolesConfigPath();
      expect(rolesConfigPath).toBeDefined();
      expect(typeof rolesConfigPath).toBe("string");
      expect(rolesConfigPath).toMatch(/roles\.json$/);
    });

    test("should have window ready for interaction", async () => {
      const window = getWindow();
      await expect(window.locator("body")).toBeVisible();
    });
  });
});

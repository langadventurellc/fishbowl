import { expect, test } from "@playwright/test";
import { setupAgentsTestSuite } from "../../../helpers/settings/setupAgentsTestSuite";

test.describe("Feature: Agent Test Infrastructure - Verification", () => {
  const testSuite = setupAgentsTestSuite();

  test("infrastructure setup works correctly", async () => {
    const window = testSuite.getWindow();

    // Verify we can get the window and it's functional
    expect(window).toBeDefined();

    // Verify basic DOM is loaded
    await expect(window.locator("body")).toBeVisible();

    // Verify paths are accessible
    const userDataPath = testSuite.getUserDataPath();
    const agentsConfigPath = testSuite.getAgentsConfigPath();

    expect(userDataPath).toBeDefined();
    expect(agentsConfigPath).toBeDefined();
    expect(agentsConfigPath).toContain("agents.json");
  });
});

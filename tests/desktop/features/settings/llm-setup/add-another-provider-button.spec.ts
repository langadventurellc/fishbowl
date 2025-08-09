import { expect, test } from "@playwright/test";
import {
  setupLlmTestSuite,
  openLlmSetupSection,
  waitForEmptyState,
  createMockOpenAiConfig,
} from "./index";

test.describe("Feature: LLM Setup Configuration - Add Another Provider Button Behavior", () => {
  const testSuite = setupLlmTestSuite();

  test("Add Another Provider button appears after first configuration", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Verify button is not visible in empty state
    const addAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });
    await expect(addAnotherButton).not.toBeVisible();

    // Create first configuration
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator('[role="dialog"].llm-config-modal');
    const config = createMockOpenAiConfig();
    await modal.locator('[name="customName"]').fill(config.customName);
    await modal.locator('[name="apiKey"]').fill(config.apiKey);

    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await saveButton.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Verify button appears after first configuration
    await expect(addAnotherButton).toBeVisible();
  });

  test("Add Another Provider button persists with multiple configurations", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create first configuration
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator('[role="dialog"].llm-config-modal');
    const firstConfig = createMockOpenAiConfig();
    await modal.locator('[name="customName"]').fill(firstConfig.customName);
    await modal.locator('[name="apiKey"]').fill(firstConfig.apiKey);

    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await saveButton.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    const addAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });
    await expect(addAnotherButton).toBeVisible();

    // Create second configuration
    await addAnotherButton.click();

    const secondModal = window.locator('[role="dialog"].llm-config-modal');
    const secondConfig = createMockOpenAiConfig();
    await secondModal
      .locator('[name="customName"]')
      .fill(secondConfig.customName);
    await secondModal.locator('[name="apiKey"]').fill(secondConfig.apiKey);

    const secondSaveButton = secondModal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await secondSaveButton.click();
    await expect(secondModal).not.toBeVisible({ timeout: 5000 });

    // Verify button is still visible
    await expect(addAnotherButton).toBeVisible();
  });
});

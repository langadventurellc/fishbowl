import { expect, test } from "@playwright/test";
import {
  setupLlmTestSuite,
  openLlmSetupSection,
  waitForEmptyState,
  createMockOpenAiConfig,
} from "./index";

test.describe("Feature: LLM Setup Configuration - Handling Many Configurations", () => {
  const testSuite = setupLlmTestSuite();

  test("handles multiple configurations gracefully", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create 5 configurations to test UI responsiveness
    const configs = Array.from({ length: 5 }, (_, i) =>
      createMockOpenAiConfig({ customName: `Config ${i + 1}` }),
    );

    // Create first config
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    let modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await modal.locator('[name="customName"]').fill(configs[0]!.customName);
    await modal.locator('[name="apiKey"]').fill(configs[0]!.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Create remaining configs
    const addAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });

    for (let i = 1; i < configs.length; i++) {
      await addAnotherButton.click();

      modal = window.locator(
        '[role="dialog"]:has([name="customName"], [name="apiKey"])',
      );
      await modal.locator('[name="customName"]').fill(configs[i]!.customName);
      await modal.locator('[name="apiKey"]').fill(configs[i]!.apiKey);
      await modal
        .locator("button")
        .filter({ hasText: "Add Configuration" })
        .click();
      await expect(modal).not.toBeVisible({ timeout: 5000 });
    }

    // Verify all configurations are visible
    const allCards = window.locator('[role="article"]');
    await expect(allCards).toHaveCount(5);

    // Verify each card is interactive
    for (let i = 0; i < 5; i++) {
      const card = allCards.nth(i);
      await expect(card).toContainText(`Config ${i + 1}`);
      await expect(card.locator('[aria-label*="Edit"]')).toBeVisible();
      await expect(card.locator('[aria-label*="Delete"]')).toBeVisible();
    }

    // Verify UI remains responsive
    await expect(addAnotherButton).toBeVisible();
  });
});

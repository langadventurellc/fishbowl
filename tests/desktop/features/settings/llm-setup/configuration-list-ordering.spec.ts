import { expect, test } from "@playwright/test";
import {
  setupLlmTestSuite,
  openLlmSetupSection,
  waitForEmptyState,
  createMockOpenAiConfig,
  createMockAnthropicConfig,
} from "./index";

test.describe("Feature: LLM Setup Configuration - Configuration List Ordering", () => {
  const testSuite = setupLlmTestSuite();

  test("maintains configuration creation order", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create configurations in specific order
    const configs = [
      createMockOpenAiConfig({ customName: "First Config" }),
      createMockAnthropicConfig({ customName: "Second Config" }),
      createMockOpenAiConfig({ customName: "Third Config" }),
    ];

    // Create first config (OpenAI)
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    let modal = window.locator('[role="dialog"].llm-config-modal');
    await modal.locator('[name="customName"]').fill(configs[0]!.customName);
    await modal.locator('[name="apiKey"]').fill(configs[0]!.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Create second config (Anthropic)
    const addAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });
    await expect(addAnotherButton).toBeVisible();

    const providerDropdown = window.locator(
      '[aria-label="Select LLM provider"]',
    );
    await providerDropdown.click();
    const anthropicOption = window
      .locator('[role="option"]')
      .filter({ hasText: "Anthropic" });
    await anthropicOption.click();
    await addAnotherButton.click();

    modal = window.locator('[role="dialog"].llm-config-modal');
    await modal.locator('[name="customName"]').fill(configs[1]!.customName);
    await modal.locator('[name="apiKey"]').fill(configs[1]!.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Create third config (OpenAI)
    await addAnotherButton.click();

    modal = window.locator('[role="dialog"].llm-config-modal');
    await modal.locator('[name="customName"]').fill(configs[2]!.customName);
    await modal.locator('[name="apiKey"]').fill(configs[2]!.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Verify order matches creation order
    const allCards = window.locator('[role="article"]');
    await expect(allCards).toHaveCount(3);

    await expect(allCards.nth(0)).toContainText("First Config");
    await expect(allCards.nth(1)).toContainText("Second Config");
    await expect(allCards.nth(2)).toContainText("Third Config");
  });

  test("order remains unchanged after editing configuration", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create two configurations
    const firstConfig = createMockOpenAiConfig({ customName: "First" });
    const secondConfig = createMockOpenAiConfig({ customName: "Second" });

    // Create first
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    let modal = window.locator('[role="dialog"].llm-config-modal');
    await modal.locator('[name="customName"]').fill(firstConfig.customName);
    await modal.locator('[name="apiKey"]').fill(firstConfig.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Create second
    const addAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });
    await addAnotherButton.click();

    modal = window.locator('[role="dialog"].llm-config-modal');
    await modal.locator('[name="customName"]').fill(secondConfig.customName);
    await modal.locator('[name="apiKey"]').fill(secondConfig.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Verify initial order
    const allCards = window.locator('[role="article"]');
    await expect(allCards.nth(0)).toContainText("First");
    await expect(allCards.nth(1)).toContainText("Second");

    // Edit the first configuration
    const firstCard = allCards.nth(0);
    const editButton = firstCard.locator('[aria-label*="Edit"]');
    await editButton.click();

    modal = window.locator('[role="dialog"].llm-config-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.locator('[name="customName"]').clear();
    await modal.locator('[name="customName"]').fill("First Edited");

    // Find save button - could be "Save Changes" or "Save Configuration"
    const editSaveButton = modal
      .locator("button")
      .filter({
        hasText: /Save|Update/,
      })
      .first();
    await expect(editSaveButton).toBeVisible();
    await editSaveButton.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Verify order hasn't changed
    await expect(allCards.nth(0)).toContainText("First Edited");
    await expect(allCards.nth(1)).toContainText("Second");
  });
});

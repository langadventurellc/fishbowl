import { expect, test } from "@playwright/test";
import {
  setupLlmTestSuite,
  openLlmSetupSection,
  waitForEmptyState,
  waitForConfigurationList,
  createMockOpenAiConfig,
  createMockAnthropicConfig,
} from "./index";

test.describe("Feature: LLM Setup Configuration - Provider Selection After Creation", () => {
  const testSuite = setupLlmTestSuite();

  test("provider dropdown behavior with existing configurations", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create first OpenAI configuration
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    const firstConfig = createMockOpenAiConfig({
      customName: "First OpenAI",
    });
    await modal.locator('[name="customName"]').fill(firstConfig.customName);
    await modal.locator('[name="apiKey"]').fill(firstConfig.apiKey);

    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await saveButton.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    await waitForConfigurationList(window);

    // Click "Add Another Provider" to test dropdown behavior
    const addAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });
    await expect(addAnotherButton).toBeVisible();

    // Verify provider dropdown still shows all options
    const providerDropdown = window.locator(
      '[aria-label="Select LLM provider"]',
    );
    await providerDropdown.click();

    // Verify both OpenAI and Anthropic options are still available
    const openAiOption = window
      .locator('[role="option"]')
      .filter({ hasText: "OpenAI" });
    const anthropicOption = window
      .locator('[role="option"]')
      .filter({ hasText: "Anthropic" });

    await expect(openAiOption).toBeVisible();
    await expect(anthropicOption).toBeVisible();

    // Select OpenAI to create multiple of same provider
    await openAiOption.click();
    await addAnotherButton.click();

    // Fill second OpenAI configuration
    const secondModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(secondModal).toBeVisible({ timeout: 5000 });

    const secondConfig = createMockOpenAiConfig({
      customName: "Second OpenAI",
    });
    await secondModal
      .locator('[name="customName"]')
      .fill(secondConfig.customName);
    await secondModal.locator('[name="apiKey"]').fill(secondConfig.apiKey);

    const secondSaveButton = secondModal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await secondSaveButton.click();
    await expect(secondModal).not.toBeVisible({ timeout: 5000 });

    // Verify both OpenAI configurations exist
    const allCards = window.locator('[role="article"]');
    await expect(allCards).toHaveCount(2);

    const openAiCards = allCards.filter({ hasText: "OpenAI" });
    await expect(openAiCards).toHaveCount(2);

    await expect(openAiCards.nth(0)).toContainText("First OpenAI");
    await expect(openAiCards.nth(1)).toContainText("Second OpenAI");

    // Test dropdown behavior again after creating multiple configs
    await providerDropdown.click();
    await expect(openAiOption).toBeVisible();
    await expect(anthropicOption).toBeVisible();

    // Select Anthropic to test cross-provider creation
    await anthropicOption.click();
    await addAnotherButton.click();

    const thirdModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    const anthropicConfig = createMockAnthropicConfig({
      customName: "Test Anthropic",
    });
    await thirdModal
      .locator('[name="customName"]')
      .fill(anthropicConfig.customName);
    await thirdModal.locator('[name="apiKey"]').fill(anthropicConfig.apiKey);

    const thirdSaveButton = thirdModal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await thirdSaveButton.click();
    await expect(thirdModal).not.toBeVisible({ timeout: 5000 });

    // Verify we now have mixed provider configurations
    await expect(allCards).toHaveCount(3);
    await expect(openAiCards).toHaveCount(2);

    const anthropicCards = allCards.filter({ hasText: "Anthropic" });
    await expect(anthropicCards).toHaveCount(1);
  });
});

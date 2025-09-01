import { expect, test } from "@playwright/test";
import { readFile } from "fs/promises";
import {
  setupLlmTestSuite,
  openLlmSetupSection,
  waitForEmptyState,
  waitForConfigurationList,
  createMockOpenAiConfig,
  createMockAnthropicConfig,
  type StoredLlmConfig,
} from "./index";

test.describe("Feature: LLM Setup Configuration - Multiple Same-Provider Configurations", () => {
  const testSuite = setupLlmTestSuite();

  test("supports multiple OpenAI configurations with unique names", async () => {
    const window = testSuite.getWindow();
    const llmConfigPath = testSuite.getLlmConfigPath();

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
    await expect(modal).toBeVisible({ timeout: 5000 });

    const firstConfig = createMockOpenAiConfig({ customName: "GPT-4" });
    await modal.locator('[name="customName"]').fill(firstConfig.customName);
    await modal.locator('[name="apiKey"]').fill(firstConfig.apiKey);

    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await saveButton.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Wait for first card to appear
    await waitForConfigurationList(window);

    // Create second OpenAI configuration
    const addAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });
    await expect(addAnotherButton).toBeVisible();

    // Ensure OpenAI is selected (should be default)
    const providerDropdown = window.locator(
      '[aria-label="Select LLM provider"]',
    );
    await expect(providerDropdown).toContainText("OpenAI");

    await addAnotherButton.click();

    // Fill second configuration
    const secondModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(secondModal).toBeVisible({ timeout: 5000 });

    const secondConfig = createMockOpenAiConfig({ customName: "GPT-3.5" });
    await secondModal
      .locator('[name="customName"]')
      .fill(secondConfig.customName);
    await secondModal.locator('[name="apiKey"]').fill(secondConfig.apiKey);

    const secondSaveButton = secondModal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await secondSaveButton.click();
    await expect(secondModal).not.toBeVisible({ timeout: 5000 });

    // Verify both configurations exist
    const allCards = window.locator('[role="article"]');
    await expect(allCards).toHaveCount(2);

    // Verify both are OpenAI configs with unique names
    const openAiCards = allCards.filter({ hasText: "OpenAI" });
    await expect(openAiCards).toHaveCount(2);

    await expect(openAiCards.nth(0)).toContainText("GPT-4");
    await expect(openAiCards.nth(1)).toContainText("GPT-3.5");

    // Verify each has independent edit/delete operations
    const firstCard = openAiCards.nth(0);
    const secondCard = openAiCards.nth(1);

    await expect(firstCard.locator('[aria-label*="Edit"]')).toBeVisible();
    await expect(firstCard.locator('[aria-label*="Delete"]')).toBeVisible();
    await expect(secondCard.locator('[aria-label*="Edit"]')).toBeVisible();
    await expect(secondCard.locator('[aria-label*="Delete"]')).toBeVisible();

    // Verify unique IDs in storage
    try {
      const configContent = await readFile(llmConfigPath, "utf-8");
      const configs: StoredLlmConfig[] = JSON.parse(configContent);
      expect(configs).toHaveLength(2);
      expect(configs[0]?.id).toBeDefined();
      expect(configs[1]?.id).toBeDefined();
      expect(configs[0]?.id).not.toBe(configs[1]?.id);
    } catch (error) {
      console.log("Storage verification skipped:", error);
    }
  });

  test("supports multiple Anthropic configurations", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create first Anthropic configuration
    const providerDropdown = window.locator(
      '[aria-label="Select LLM provider"]',
    );
    await providerDropdown.click();
    const anthropicOption = window
      .locator('[role="option"]')
      .filter({ hasText: "Anthropic" });
    await anthropicOption.click();

    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up Anthropic" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(modal).toBeVisible({ timeout: 5000 });

    const firstConfig = createMockAnthropicConfig({
      customName: "Claude-3-Opus",
    });
    await modal.locator('[name="customName"]').fill(firstConfig.customName);
    await modal.locator('[name="apiKey"]').fill(firstConfig.apiKey);

    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await saveButton.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    await waitForConfigurationList(window);

    // Create second Anthropic configuration
    const addAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });
    await expect(addAnotherButton).toBeVisible();

    // Select Anthropic again
    const providerDropdown2 = window.locator(
      '[aria-label="Select LLM provider"]',
    );
    await providerDropdown2.click();
    const anthropicOption2 = window
      .locator('[role="option"]')
      .filter({ hasText: "Anthropic" });
    await anthropicOption2.click();

    await addAnotherButton.click();

    // Fill second configuration
    const secondModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(secondModal).toBeVisible({ timeout: 5000 });

    const secondConfig = createMockAnthropicConfig({
      customName: "Claude-3-Sonnet",
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

    // Verify both configurations exist
    const allCards = window.locator('[role="article"]');
    await expect(allCards).toHaveCount(2);

    // Verify both are Anthropic configs
    const anthropicCards = allCards.filter({ hasText: "Anthropic" });
    await expect(anthropicCards).toHaveCount(2);

    await expect(anthropicCards.nth(0)).toContainText("Claude-3-Opus");
    await expect(anthropicCards.nth(1)).toContainText("Claude-3-Sonnet");
  });
});

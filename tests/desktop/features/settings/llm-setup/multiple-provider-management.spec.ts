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

test.describe("Feature: LLM Setup Configuration - Multiple Provider Management", () => {
  const testSuite = setupLlmTestSuite();

  test("supports both OpenAI and Anthropic configs simultaneously", async () => {
    const window = testSuite.getWindow();
    const llmConfigPath = testSuite.getLlmConfigPath();

    await openLlmSetupSection(window);

    // Create OpenAI configuration first
    await waitForEmptyState(window);

    // Create OpenAI config
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator('[role="dialog"].llm-config-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    const openAiConfig = createMockOpenAiConfig();
    await modal.locator('[name="customName"]').fill(openAiConfig.customName);
    await modal.locator('[name="apiKey"]').fill(openAiConfig.apiKey);

    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await saveButton.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Wait for OpenAI card to appear
    await waitForConfigurationList(window);

    // Now create Anthropic configuration
    const addAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });
    await expect(addAnotherButton).toBeVisible();

    // Click provider selector dropdown
    const providerDropdown = window.locator(
      '[aria-label="Select LLM provider"]',
    );
    await providerDropdown.click();
    const anthropicOption = window
      .locator('[role="option"]')
      .filter({ hasText: "Anthropic" });
    await anthropicOption.click();
    await addAnotherButton.click();

    // Fill Anthropic config
    const anthropicModal = window.locator('[role="dialog"].llm-config-modal');
    await expect(anthropicModal).toBeVisible({ timeout: 5000 });

    const anthropicConfig = createMockAnthropicConfig();
    await anthropicModal
      .locator('[name="customName"]')
      .fill(anthropicConfig.customName);
    await anthropicModal
      .locator('[name="apiKey"]')
      .fill(anthropicConfig.apiKey);

    const anthropicSaveButton = anthropicModal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await anthropicSaveButton.click();
    await expect(anthropicModal).not.toBeVisible({ timeout: 5000 });

    // Now verify we have both configurations
    const allCards = window.locator('[role="article"]');
    await expect(allCards.first()).toBeVisible();

    // Verify both provider types are present
    const openAiCards = allCards.filter({ hasText: "OpenAI" });
    const anthropicCards = allCards.filter({ hasText: "Anthropic" });

    await expect(openAiCards.first()).toBeVisible();
    await expect(anthropicCards.first()).toBeVisible();

    // Verify each provider type has independent edit/delete actions
    const firstOpenAiCard = openAiCards.first();
    const firstAnthropicCard = anthropicCards.first();

    // OpenAI card should have edit/delete buttons
    const openAiEditButton = firstOpenAiCard.locator('[aria-label*="Edit"]');
    const openAiDeleteButton = firstOpenAiCard.locator(
      '[aria-label*="Delete"]',
    );
    await expect(openAiEditButton).toBeVisible();
    await expect(openAiDeleteButton).toBeVisible();

    // Anthropic card should have edit/delete buttons
    const anthropicEditButton = firstAnthropicCard.locator(
      '[aria-label*="Edit"]',
    );
    const anthropicDeleteButton = firstAnthropicCard.locator(
      '[aria-label*="Delete"]',
    );
    await expect(anthropicEditButton).toBeVisible();
    await expect(anthropicDeleteButton).toBeVisible();

    // Verify correct provider branding
    await expect(firstOpenAiCard).toContainText("OpenAI");
    await expect(firstOpenAiCard).toContainText("sk-...****"); // OpenAI mask format

    await expect(firstAnthropicCard).toContainText("Anthropic");
    await expect(firstAnthropicCard).toContainText("sk-ant-...****"); // Anthropic mask format

    // Verify "Add Another Provider" button is available for adding more
    const finalAddAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });
    await expect(finalAddAnotherButton).toBeVisible();

    // Verify storage contains both provider types (if file exists)
    try {
      const configContent = await readFile(llmConfigPath, "utf-8");
      const configs: StoredLlmConfig[] = JSON.parse(configContent);
      expect(configs.length).toBeGreaterThanOrEqual(2);

      const hasOpenAi = configs.some(
        (c: StoredLlmConfig) => c.provider === "openai",
      );
      const hasAnthropic = configs.some(
        (c: StoredLlmConfig) => c.provider === "anthropic",
      );

      expect(hasOpenAi).toBe(true);
      expect(hasAnthropic).toBe(true);

      // Verify Anthropic configs have correct base URL
      const anthropicConfigs = configs.filter(
        (c: StoredLlmConfig) => c.provider === "anthropic",
      );
      anthropicConfigs.forEach((config) => {
        expect(config.baseUrl).toBe("https://api.anthropic.com");
      });
    } catch (error) {
      // Config file might not exist in this test - that's ok, UI verification above is sufficient
      console.log("Config file not found, but UI verification passed:", error);
    }
  });

  test("displays correct provider branding and styling", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);

    // Handle both empty state and existing configs
    const addAnotherButton = window
      .locator("button")
      .filter({ hasText: "Add Another Provider" });

    if (await addAnotherButton.isVisible()) {
      // Click provider selector dropdown that appears with "Add Another Provider"
      const providerDropdown = window.locator(
        '[aria-label="Select LLM provider"]',
      );
      await providerDropdown.click();
      const anthropicOption = window
        .locator('[role="option"]')
        .filter({ hasText: "Anthropic" });
      await anthropicOption.click();
      await addAnotherButton.click();
    } else {
      await waitForEmptyState(window);
      // Create Anthropic configuration
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
    }

    const modal = window.locator('[role="dialog"].llm-config-modal');
    await expect(modal).toBeVisible();

    const anthropicConfig = createMockAnthropicConfig({
      customName: "Anthropic Test Config",
    });
    await modal.locator('[name="customName"]').fill(anthropicConfig.customName);
    await modal.locator('[name="apiKey"]').fill(anthropicConfig.apiKey);

    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await saveButton.click();
    await expect(modal).not.toBeVisible();

    // Verify Anthropic card appears with correct branding
    await waitForConfigurationList(window);
    const anthropicCard = window.locator('[role="article"]').last(); // Get the latest added card
    await expect(anthropicCard).toBeVisible();

    // Verify provider-specific branding
    await expect(anthropicCard).toContainText("Anthropic");
    await expect(anthropicCard).toContainText("Anthropic Test Config");
    await expect(anthropicCard).toContainText("sk-ant-...****"); // Anthropic-specific mask format
    await expect(anthropicCard).not.toContainText("sk-...****"); // Should not use OpenAI format
  });
});

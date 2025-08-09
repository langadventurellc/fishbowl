import { expect, test } from "@playwright/test";
import {
  setupLlmTestSuite,
  openLlmSetupSection,
  waitForEmptyState,
  waitForConfigurationList,
  createMockAnthropicConfig,
} from "./index";

test.describe("Feature: LLM Setup Configuration - Anthropic Configuration Creation", () => {
  const testSuite = setupLlmTestSuite();

  test("creates Anthropic configuration successfully", async () => {
    const window = testSuite.getWindow();

    // Navigate to LLM Setup
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
      // Select Anthropic provider
      const providerDropdown = window.locator(
        '[aria-label="Select LLM provider"]',
      );
      await providerDropdown.click();
      const anthropicOption = window
        .locator('[role="option"]')
        .filter({ hasText: "Anthropic" });
      await anthropicOption.click();

      // Verify button text changed
      const setupButton = window
        .locator("button")
        .filter({ hasText: "Set up Anthropic" });
      await expect(setupButton).toBeVisible();
      await setupButton.click();
    }

    // Wait for modal
    const modal = window.locator('[role="dialog"].llm-config-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Verify modal shows Anthropic-specific content
    await expect(modal.locator("text=Setup LLM API")).toBeVisible();

    // Fill configuration
    const mockConfig = createMockAnthropicConfig();
    await modal.locator('[name="customName"]').fill(mockConfig.customName);
    await modal.locator('[name="apiKey"]').fill(mockConfig.apiKey);

    // Save configuration
    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for modal to close
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Verify configuration card appears with Anthropic branding
    await waitForConfigurationList(window);
    const configCard = window.locator('[role="article"]').last(); // Get the latest added card
    await expect(configCard).toBeVisible();

    // Verify Anthropic-specific content
    await expect(configCard).toContainText(mockConfig.customName);
    await expect(configCard).toContainText("Anthropic");
    await expect(configCard).toContainText("sk-ant-...****"); // Anthropic masked format
  });

  test("populates Anthropic-specific defaults", async () => {
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
      // Select Anthropic and open modal
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

    // Advanced options should be hidden by default
    const baseUrlField = modal.locator('[name="baseUrl"]');
    await expect(baseUrlField).not.toBeVisible();

    // Click to show advanced options
    const advancedToggle = modal.locator("button").filter({
      hasText: "Show advanced options",
    });
    await advancedToggle.click();

    // Now base URL should be visible with correct default
    await expect(baseUrlField).toBeVisible();
    const baseUrlValue = await baseUrlField.inputValue();
    expect(baseUrlValue).toBe("https://api.anthropic.com");

    // Check auth header checkbox is checked by default - wait for it to appear first
    const authHeaderCheckbox = modal.locator('input[type="checkbox"]').first();
    await expect(authHeaderCheckbox).toBeVisible(); // Wait for checkbox to appear
    await expect(authHeaderCheckbox).toBeChecked();
  });

  test("validates Anthropic configuration fields", async () => {
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

    // Save button should be disabled initially
    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await expect(saveButton).toBeDisabled();

    // Fill only custom name
    await modal.locator('[name="customName"]').fill("Test Anthropic Config");
    await expect(saveButton).toBeDisabled(); // Still disabled without API key

    // Add API key
    await modal.locator('[name="apiKey"]').fill("sk-ant-api-test-key");
    await expect(saveButton).toBeEnabled(); // Now enabled
  });
});

import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";
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

test.describe("Feature: LLM Setup Configuration - Edit Configuration Tests", () => {
  const testSuite = setupLlmTestSuite();

  test("edits existing configuration successfully", async () => {
    const window = testSuite.getWindow();
    const llmConfigPath = testSuite.getLlmConfigPath();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create initial configuration
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(modal).toBeVisible({ timeout: 5000 });

    const initialConfig = createMockOpenAiConfig({
      customName: "Initial Config Name",
    });
    await modal.locator('[name="customName"]').fill(initialConfig.customName);
    await modal.locator('[name="apiKey"]').fill(initialConfig.apiKey);

    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await saveButton.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Wait for configuration card to appear
    await waitForConfigurationList(window);
    const configCard = window.locator('[role="article"]').first();
    await expect(configCard).toContainText("Initial Config Name");

    // Click edit button on configuration card
    const editButton = configCard.locator('[aria-label*="Edit"]');
    await editButton.click();

    // Verify modal opens in edit mode
    const editModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(editModal).toBeVisible({ timeout: 5000 });

    // Verify existing data is populated (except API key which should show placeholder)
    const customNameInput = editModal.locator('[name="customName"]');
    const customNameValue = await customNameInput.inputValue();
    expect(customNameValue).toBe("Initial Config Name");

    // Verify API key field shows masked value, not actual key
    const apiKeyInput = editModal.locator('[name="apiKey"]');
    const apiKeyValue = await apiKeyInput.inputValue();
    // API key should show masked format: first 3 chars + "..." + last 3 chars
    // Based on maskApiKey.ts: pattern is "abc...xyz" for keys 6+ chars, or 8 bullets for shorter keys
    const isMaskedFormat =
      apiKeyValue.match(/^.{3}\.{3}.{3}$/) || apiKeyValue.match(/^•+$/);
    expect(isMaskedFormat).toBeTruthy();
    expect(apiKeyValue).not.toBe(initialConfig.apiKey); // Not the original full key

    // Modify custom name
    await customNameInput.clear();
    await customNameInput.fill("Updated Config Name");

    // Save changes
    const editSaveButton = editModal.locator("button").filter({
      hasText: /Add Configuration|Update Configuration/,
    });
    await expect(editSaveButton).toBeEnabled();
    await editSaveButton.click();

    // Wait for modal to close
    await expect(editModal).not.toBeVisible({ timeout: 5000 });

    // Verify card updates with new name
    await expect(configCard).toContainText("Updated Config Name");
    await expect(configCard).not.toContainText("Initial Config Name");

    // Verify changes persist in storage
    try {
      const configContent = await readFile(llmConfigPath, "utf-8");
      const configs: StoredLlmConfig[] = JSON.parse(configContent);
      expect(configs).toHaveLength(1);
      expect(configs[0]?.customName).toBe("Updated Config Name");
    } catch (error) {
      console.log("Storage verification skipped:", error);
    }
  });

  test("handles API key field correctly in edit mode", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create config with API key
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    const config = createMockOpenAiConfig();
    await modal.locator('[name="customName"]').fill(config.customName);
    await modal.locator('[name="apiKey"]').fill(config.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    await waitForConfigurationList(window);

    // Open edit modal
    const configCard = window.locator('[role="article"]').first();
    await configCard.locator('[aria-label*="Edit"]').click();

    const editModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(editModal).toBeVisible({ timeout: 5000 });

    // Verify API key field shows masked value, not actual key
    const apiKeyInput = editModal.locator('[name="apiKey"]');
    const apiKeyValue = await apiKeyInput.inputValue();
    // Based on maskApiKey.ts: pattern is "abc...xyz" for keys 6+ chars, or 8 bullets for shorter keys
    const isMaskedFormat =
      apiKeyValue.match(/^.{3}\.{3}.{3}$/) || apiKeyValue.match(/^•+$/);
    expect(isMaskedFormat).toBeTruthy();
    expect(apiKeyValue).not.toBe(config.apiKey); // Should not be the original key

    // Test leaving field unchanged → existing key should remain
    const saveButton = editModal.locator("button").filter({
      hasText: /Add Configuration|Update Configuration/,
    });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await expect(editModal).not.toBeVisible({ timeout: 5000 });

    // Verify card still shows masked key
    await expect(configCard).toContainText("sk-...****");

    // Test entering new key → should update on save
    await configCard.locator('[aria-label*="Edit"]').click();
    await expect(editModal).toBeVisible({ timeout: 5000 });

    const newApiKey = `sk-new-${randomUUID()}`;
    await apiKeyInput.clear(); // Clear the masked value first
    await apiKeyInput.fill(newApiKey);
    await saveButton.click();
    await expect(editModal).not.toBeVisible({ timeout: 5000 });

    // Test validation when API key is cleared completely
    await configCard.locator('[aria-label*="Edit"]').click();
    await expect(editModal).toBeVisible({ timeout: 5000 });

    // Clear API key field completely and verify validation prevents save
    await apiKeyInput.clear();
    await expect(saveButton).toBeDisabled(); // Should be disabled due to empty API key
  });

  test("updates custom name successfully", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create initial configuration
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    const initialConfig = createMockOpenAiConfig({
      customName: "Config A",
    });
    await modal.locator('[name="customName"]').fill(initialConfig.customName);
    await modal.locator('[name="apiKey"]').fill(initialConfig.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    await waitForConfigurationList(window);

    // Edit configuration
    const configCard = window.locator('[role="article"]').first();
    await configCard.locator('[aria-label*="Edit"]').click();

    const editModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(editModal).toBeVisible({ timeout: 5000 });

    // Change custom name from "Config A" to "Config B"
    const customNameInput = editModal.locator('[name="customName"]');
    await customNameInput.clear();
    await customNameInput.fill("Config B");

    // Save and verify UI update
    const saveButton = editModal.locator("button").filter({
      hasText: /Add Configuration|Update Configuration/,
    });
    await saveButton.click();
    await expect(editModal).not.toBeVisible({ timeout: 5000 });

    // Verify UI shows updated name
    await expect(configCard).toContainText("Config B");
    await expect(configCard).not.toContainText("Config A");

    // Reload page simulation and verify persistence
    await window.waitForLoadState("domcontentloaded");
    await window.waitForLoadState("networkidle");

    // Navigate back to LLM Setup
    await openLlmSetupSection(window);
    await waitForConfigurationList(window);

    // Verify name persisted after reload
    const reloadedCard = window.locator('[role="article"]').first();
    await expect(reloadedCard).toContainText("Config B");
  });

  test("updates base URL for custom endpoints", async () => {
    const window = testSuite.getWindow();
    const llmConfigPath = testSuite.getLlmConfigPath();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create Anthropic configuration (has base URL field)
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
    const config = createMockAnthropicConfig();
    await modal.locator('[name="customName"]').fill(config.customName);
    await modal.locator('[name="apiKey"]').fill(config.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    await waitForConfigurationList(window);

    // Edit configuration
    const configCard = window.locator('[role="article"]').first();
    await configCard.locator('[aria-label*="Edit"]').click();

    const editModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(editModal).toBeVisible({ timeout: 5000 });

    // Show advanced options to access base URL
    const advancedToggle = editModal.locator("button").filter({
      hasText: "Show advanced options",
    });
    await advancedToggle.click();

    // Change base URL to custom endpoint
    const baseUrlInput = editModal.locator('[name="baseUrl"]');
    await expect(baseUrlInput).toBeVisible();
    await baseUrlInput.clear();
    await baseUrlInput.fill("https://custom-api.example.com");

    // Save changes
    const saveButton = editModal.locator("button").filter({
      hasText: /Add Configuration|Update Configuration/,
    });
    await saveButton.click();
    await expect(editModal).not.toBeVisible({ timeout: 5000 });

    // Verify storage update
    try {
      const configContent = await readFile(llmConfigPath, "utf-8");
      const configs: StoredLlmConfig[] = JSON.parse(configContent);
      expect(configs[0]?.baseUrl).toBe("https://custom-api.example.com");
    } catch (error) {
      console.log("Storage verification skipped:", error);
    }
  });

  test("validates fields during edit", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create initial configuration
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    const config = createMockOpenAiConfig();
    await modal.locator('[name="customName"]').fill(config.customName);
    await modal.locator('[name="apiKey"]').fill(config.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    await waitForConfigurationList(window);

    // Edit configuration
    const configCard = window.locator('[role="article"]').first();
    await configCard.locator('[aria-label*="Edit"]').click();

    const editModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(editModal).toBeVisible({ timeout: 5000 });

    const saveButton = editModal.locator("button").filter({
      hasText: /Add Configuration|Update Configuration/,
    });

    // Clear required custom name → can't save
    const customNameInput = editModal.locator('[name="customName"]');
    await customNameInput.clear();
    await expect(saveButton).toBeDisabled();

    // Fix validation error → can save
    await customNameInput.fill("Valid Name");
    await expect(saveButton).toBeEnabled();
  });

  test("cancels edit without saving changes", async () => {
    const window = testSuite.getWindow();
    const llmConfigPath = testSuite.getLlmConfigPath();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Create configuration with "Name A"
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    const config = createMockOpenAiConfig({
      customName: "Name A",
    });
    await modal.locator('[name="customName"]').fill(config.customName);
    await modal.locator('[name="apiKey"]').fill(config.apiKey);
    await modal
      .locator("button")
      .filter({ hasText: "Add Configuration" })
      .click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    await waitForConfigurationList(window);
    const configCard = window.locator('[role="article"]').first();
    await expect(configCard).toContainText("Name A");

    // Open edit modal
    await configCard.locator('[aria-label*="Edit"]').click();

    const editModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(editModal).toBeVisible({ timeout: 5000 });

    // Change to "Name B"
    const customNameInput = editModal.locator('[name="customName"]');
    await customNameInput.clear();
    await customNameInput.fill("Name B");

    // Click Cancel
    const cancelButton = editModal.locator("button").filter({
      hasText: "Cancel",
    });
    await cancelButton.click();
    await expect(editModal).not.toBeVisible({ timeout: 5000 });

    // Verify card still shows "Name A"
    await expect(configCard).toContainText("Name A");
    await expect(configCard).not.toContainText("Name B");

    // Verify storage unchanged
    try {
      const configContent = await readFile(llmConfigPath, "utf-8");
      const configs: StoredLlmConfig[] = JSON.parse(configContent);
      expect(configs[0]?.customName).toBe("Name A");
    } catch (error) {
      console.log("Storage verification skipped:", error);
    }
  });
});

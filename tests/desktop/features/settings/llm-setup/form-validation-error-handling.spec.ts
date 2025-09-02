import { expect, test } from "@playwright/test";
import {
  openLlmSetupSection,
  setupLlmTestSuite,
  waitForEmptyState,
} from "./index";

test.describe("Feature: LLM Setup Configuration - Form Validation and Error Handling", () => {
  const testSuite = setupLlmTestSuite();

  test("validates required fields on save attempt", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Open configuration modal
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Save button should be disabled initially
    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await expect(saveButton).toBeDisabled();

    // Fill only custom name → still should be disabled (API key missing)
    await modal.locator('[name="customName"]').fill("Test Config");
    await expect(saveButton).toBeDisabled();

    // Clear custom name and fill only API key → still should be disabled (custom name missing)
    await modal.locator('[name="customName"]').clear();
    await modal.locator('[name="apiKey"]').fill("sk-test123");
    await expect(saveButton).toBeDisabled();

    // Fill both required fields → should be enabled
    await modal.locator('[name="customName"]').fill("Test Config");
    await expect(saveButton).toBeEnabled();
  });

  test("validates custom name field", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(modal).toBeVisible({ timeout: 5000 });

    const customNameInput = modal.locator('[name="customName"]');
    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });

    // Test empty name → save button disabled
    await customNameInput.clear();
    await modal.locator('[name="apiKey"]').fill("sk-test123");
    await expect(saveButton).toBeDisabled();

    // Test whitespace only → form accepts this as valid input
    await customNameInput.fill("   ");
    await expect(saveButton).toBeEnabled();

    // Test valid name with special characters → should be accepted
    await customNameInput.fill("Test Config @#$%");
    await expect(saveButton).toBeEnabled();

    // Test very long name → should be accepted (no length limit imposed)
    const longName = "a".repeat(200);
    await customNameInput.fill(longName);
    await expect(saveButton).toBeEnabled();
  });

  test("validates API key field", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(modal).toBeVisible({ timeout: 5000 });

    const apiKeyInput = modal.locator('[name="apiKey"]');
    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });

    // Fill custom name first
    await modal.locator('[name="customName"]').fill("Test Config");

    // Test empty API key → save button disabled
    await apiKeyInput.clear();
    await expect(saveButton).toBeDisabled();

    // Test whitespace only → form accepts this as valid input
    await apiKeyInput.fill("   ");
    await expect(saveButton).toBeEnabled();

    // Test valid API key → should be enabled
    await apiKeyInput.fill("sk-test-valid-key-123");
    await expect(saveButton).toBeEnabled();

    // Test very long API key → should be accepted
    const longKey = "sk-" + "a".repeat(500);
    await apiKeyInput.fill(longKey);
    await expect(saveButton).toBeEnabled();
  });

  test("validates Anthropic base URL format", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Select Anthropic provider since it has advanced options including base URL
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

    // Fill required fields first
    await modal.locator('[name="customName"]').fill("Test Config");
    await modal.locator('[name="apiKey"]').fill("sk-ant-test123");

    // Show advanced options to access base URL field
    const advancedToggle = modal.locator("button").filter({
      hasText: "Show advanced options",
    });
    await advancedToggle.click();

    const baseUrlInput = modal.locator('[name="baseUrl"]');
    await expect(baseUrlInput).toBeVisible();

    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });

    // Test valid URLs - should remain enabled
    const validUrls = [
      "https://api.anthropic.com",
      "http://localhost:3000",
      "https://192.168.1.1:8080",
      "https://api.custom-provider.com",
      "https://api.anthropic.com/", // trailing slash
    ];

    for (const url of validUrls) {
      await baseUrlInput.clear();
      await baseUrlInput.fill(url);
      // Should remain enabled for valid URLs
      await expect(saveButton).toBeEnabled();
    }

    // Base URL should have default value and be optional
    await baseUrlInput.clear();
    await expect(saveButton).toBeEnabled();
  });

  test("save button enables/disables based on form validity", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(modal).toBeVisible({ timeout: 5000 });

    const customNameInput = modal.locator('[name="customName"]');
    const apiKeyInput = modal.locator('[name="apiKey"]');
    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });

    // Initial state → save disabled
    await expect(saveButton).toBeDisabled();

    // Fill custom name → still disabled (missing API key)
    await customNameInput.fill("Test Config");
    await expect(saveButton).toBeDisabled();

    // Fill API key → should enable
    await apiKeyInput.fill("sk-test123");
    await expect(saveButton).toBeEnabled();

    // Clear custom name → should disable again
    await customNameInput.clear();
    await expect(saveButton).toBeDisabled();

    // Re-fill custom name → should enable again
    await customNameInput.fill("Test Config");
    await expect(saveButton).toBeEnabled();

    // Clear API key → should disable
    await apiKeyInput.clear();
    await expect(saveButton).toBeDisabled();
  });

  test("maintains form state after validation errors", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    const modal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(modal).toBeVisible({ timeout: 5000 });

    const customNameInput = modal.locator('[name="customName"]');
    const apiKeyInput = modal.locator('[name="apiKey"]');

    // Fill form with valid data
    const testName = "Test Configuration";
    const testKey = "sk-test-api-key-123";

    await customNameInput.fill(testName);
    await apiKeyInput.fill(testKey);

    // Simulate clearing a field to trigger validation error
    await customNameInput.clear();

    // Verify API key field retains its value
    const apiKeyValue = await apiKeyInput.inputValue();
    expect(apiKeyValue).toBe(testKey);

    // Re-fill custom name and verify form becomes valid again
    await customNameInput.fill(testName);

    const saveButton = modal.locator("button").filter({
      hasText: "Add Configuration",
    });
    await expect(saveButton).toBeEnabled();

    // Verify both fields retain their values
    const finalCustomName = await customNameInput.inputValue();
    const finalApiKey = await apiKeyInput.inputValue();
    expect(finalCustomName).toBe(testName);
    expect(finalApiKey).toBe(testKey);
  });
});

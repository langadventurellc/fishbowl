import { expect, test } from "@playwright/test";
import {
  setupLlmTestSuite,
  openLlmSetupSection,
  waitForEmptyState,
} from "./index";

test.describe("Feature: LLM Setup Configuration - Empty State Interaction", () => {
  const testSuite = setupLlmTestSuite();

  test("displays empty state when no configurations exist", async () => {
    const window = testSuite.getWindow();

    // Navigate to LLM Setup tab
    await openLlmSetupSection(window);

    // Verify EmptyLlmState component is visible
    await waitForEmptyState(window);

    // Check for descriptive text
    await expect(
      window.locator(
        "text=Connect your preferred LLM provider to start using AI features",
      ),
    ).toBeVisible();

    // Check for provider dropdown presence
    const providerDropdown = window.locator(
      '[aria-label="Select LLM provider"]',
    );
    await expect(providerDropdown).toBeVisible();

    // Verify setup button exists
    const setupButton = window.locator("button").filter({ hasText: /Set up/ });
    await expect(setupButton).toBeVisible();
  });

  test("provider dropdown shows available options", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Click provider dropdown trigger
    const providerDropdown = window.locator(
      '[aria-label="Select LLM provider"]',
    );
    await providerDropdown.click();

    // Wait for dropdown content to be visible
    await window.waitForTimeout(100); // Small delay for animation

    // Verify OpenAI option is present
    const openAiOption = window
      .locator('[role="option"]')
      .filter({ hasText: "OpenAI" });
    await expect(openAiOption).toBeVisible();

    // Verify Anthropic option is present
    const anthropicOption = window
      .locator('[role="option"]')
      .filter({ hasText: "Anthropic" });
    await expect(anthropicOption).toBeVisible();

    // Select OpenAI and verify selection updates
    await openAiOption.click();
    await expect(providerDropdown).toContainText("OpenAI");

    // Re-open dropdown
    await providerDropdown.click();
    await window.waitForTimeout(100);

    // Select Anthropic and verify selection updates
    await anthropicOption.click();
    await expect(providerDropdown).toContainText("Anthropic");
  });

  test("setup button text changes based on selected provider", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Initial state should show OpenAI (default)
    let setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await expect(setupButton).toBeVisible();

    // Click provider dropdown
    const providerDropdown = window.locator(
      '[aria-label="Select LLM provider"]',
    );
    await providerDropdown.click();

    // Select Anthropic
    const anthropicOption = window
      .locator('[role="option"]')
      .filter({ hasText: "Anthropic" });
    await anthropicOption.click();

    // Verify button text changes to "Set up Anthropic"
    setupButton = window
      .locator("button")
      .filter({ hasText: "Set up Anthropic" });
    await expect(setupButton).toBeVisible();

    // Switch back to OpenAI
    await providerDropdown.click();
    const openAiOption = window
      .locator('[role="option"]')
      .filter({ hasText: "OpenAI" });
    await openAiOption.click();

    // Verify button text changes back to "Set up OpenAI"
    setupButton = window.locator("button").filter({ hasText: "Set up OpenAI" });
    await expect(setupButton).toBeVisible();
  });

  test("opens configuration modal when setup button clicked", async () => {
    const window = testSuite.getWindow();

    await openLlmSetupSection(window);
    await waitForEmptyState(window);

    // Select OpenAI provider (should be default)
    const setupButton = window
      .locator("button")
      .filter({ hasText: "Set up OpenAI" });
    await setupButton.click();

    // Verify LLM config modal opens
    const llmConfigModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(llmConfigModal).toBeVisible({ timeout: 5000 });

    // Verify modal has correct title
    await expect(llmConfigModal.locator("text=Setup LLM API")).toBeVisible();

    // Close modal
    const closeButton = llmConfigModal
      .locator("button")
      .filter({ hasText: "Cancel" });
    await closeButton.click();

    // Test with Anthropic provider
    const providerDropdown = window.locator(
      '[aria-label="Select LLM provider"]',
    );
    await providerDropdown.click();
    const anthropicOption = window
      .locator('[role="option"]')
      .filter({ hasText: "Anthropic" });
    await anthropicOption.click();

    const anthropicSetupButton = window
      .locator("button")
      .filter({ hasText: "Set up Anthropic" });
    await anthropicSetupButton.click();

    // Verify Anthropic modal opens
    const anthropicModal = window.locator(
      '[role="dialog"]:has([name="customName"], [name="apiKey"])',
    );
    await expect(anthropicModal).toBeVisible({ timeout: 5000 });

    // Verify modal has correct title
    await expect(anthropicModal.locator("text=Setup LLM API")).toBeVisible();
  });
});

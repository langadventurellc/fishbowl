import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";
import { openLlmSetupSection } from "./openLlmSetupSection";
import { waitForEmptyState } from "./waitForEmptyState";
import { createMockAnthropicConfig } from "./createMockAnthropicConfig";
import { waitForConfigurationList } from "./waitForConfigurationList";

/**
 * Creates an LLM configuration for agent tests
 * This is needed because agent creation requires existing LLM configs to populate the model dropdown
 */
export const createLlmConfigForAgentTests = async (window: TestWindow) => {
  // Navigate to LLM Setup
  await openLlmSetupSection(window);

  // Check if we already have configurations
  const addAnotherButton = window
    .locator("button")
    .filter({ hasText: "Add Another Provider" });

  if (await addAnotherButton.isVisible()) {
    // Configurations already exist, we can just return
    const mockConfig = createMockAnthropicConfig();
    return mockConfig;
  }

  // Wait for empty state (no existing configs)
  await waitForEmptyState(window);

  // Select Anthropic provider
  const providerDropdown = window.locator('[aria-label="Select LLM provider"]');
  await providerDropdown.click();
  const anthropicOption = window
    .locator('[role="option"]')
    .filter({ hasText: "Anthropic" });
  await anthropicOption.click();

  // Click setup button
  const setupButton = window
    .locator("button")
    .filter({ hasText: "Set up Anthropic" });
  await expect(setupButton).toBeVisible();
  await setupButton.click();

  // Wait for modal
  const modal = window.locator(
    '[role="dialog"]:has([name="customName"], [name="apiKey"])',
  );
  await expect(modal).toBeVisible({ timeout: 5000 });

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

  // Verify configuration was created
  await waitForConfigurationList(window);

  return mockConfig;
};

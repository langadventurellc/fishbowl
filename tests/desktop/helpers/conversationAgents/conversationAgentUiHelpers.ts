import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

/**
 * Click the Add Agent button in AgentLabelsContainerDisplay.
 * Verifies button is visible and enabled before clicking.
 */
export const clickAddAgentButton = async (
  window: TestWindow,
): Promise<void> => {
  const addButton = window.locator(".add-agent-button");

  // Verify button exists and is visible
  await expect(addButton).toBeVisible({ timeout: 5000 });

  // Verify button is enabled (not disabled due to no conversation selected)
  await expect(addButton).toBeEnabled({ timeout: 1000 });

  // Click the button
  await addButton.click();
};

/**
 * Wait for Add Agent Modal to appear or disappear.
 * Uses dialog role selector to detect modal state.
 */
export const waitForAddAgentModal = async (
  window: TestWindow,
  shouldBeVisible: boolean = true,
): Promise<void> => {
  const modalSelector = '[role="dialog"]';

  if (shouldBeVisible) {
    // Wait for the modal to be visible
    await expect(window.locator(modalSelector)).toBeVisible({ timeout: 5000 });

    // Wait for modal content to be fully loaded - check for agent select trigger
    await expect(
      window.locator('[data-slot="select-trigger"]').first(),
    ).toBeVisible({ timeout: 1000 });

    // Verify modal title is present
    await expect(
      window.locator('text="Add Agent to Conversation"'),
    ).toBeVisible({ timeout: 1000 });
  } else {
    // Wait for modal to disappear
    await expect(window.locator(modalSelector)).not.toBeVisible({
      timeout: 5000,
    });
  }
};

/**
 * Select agent from dropdown in modal.
 * Handles dropdown opening, option selection, and verification.
 */
export const selectAgentInModal = async (
  window: TestWindow,
  agentName: string,
): Promise<void> => {
  // First ensure the modal is visible
  await expect(window.locator('[role="dialog"]')).toBeVisible();

  // Click the select trigger to open dropdown
  const selectTrigger = window.locator('[data-slot="select-trigger"]');
  await expect(selectTrigger).toBeVisible({ timeout: 1000 });
  await selectTrigger.click();

  // Wait for dropdown content to appear
  await expect(
    window.locator('[role="listbox"], [role="option"]').first(),
  ).toBeVisible({ timeout: 2000 });

  // Find and click the specific agent option
  const agentOption = window.locator(`[role="option"]`).filter({
    hasText: agentName,
  });

  await expect(agentOption).toBeVisible({ timeout: 1000 });
  await agentOption.click();

  // Verify selection was successful - the trigger should now show the selected agent
  await expect(selectTrigger).toContainText(agentName, { timeout: 1000 });
};

/**
 * Verify agent pill exists in AgentLabelsContainerDisplay.
 * Looks for agent pill components by agent name.
 * Agent pills show format: "AgentName | AgentRole"
 */
export const verifyAgentPillExists = async (
  window: TestWindow,
  agentName: string,
): Promise<void> => {
  // Look for div elements with rounded-full class (AgentPill styling) containing the agent name
  // AgentPill component renders as: <div className="...rounded-full..."><span>AgentName | AgentRole</span></div>
  const agentPill = window.locator("div").filter({
    hasText: new RegExp(`${agentName}\\s*\\|`, "i"), // Match "AgentName |" format
  });

  await expect(agentPill.first()).toBeVisible({ timeout: 5000 });
};

/**
 * Check if Add Agent button is visible and enabled.
 * Returns state information for asserting button behavior.
 */
export const checkAddAgentButtonState = async (
  window: TestWindow,
): Promise<{ visible: boolean; enabled: boolean }> => {
  const addButton = window.locator(".add-agent-button");

  try {
    // Check visibility with short timeout
    await expect(addButton).toBeVisible({ timeout: 1000 });

    // Check if enabled
    const isEnabled = await addButton.isEnabled();

    return { visible: true, enabled: isEnabled };
  } catch {
    return { visible: false, enabled: false };
  }
};

/**
 * Wait for agent to appear in conversation display.
 * Uses polling pattern to wait for agent pill to be visible.
 */
export const waitForAgentInConversationDisplay = async (
  window: TestWindow,
  agentName: string,
  timeout: number = 5000,
): Promise<void> => {
  // Wait for any loading states to complete first
  try {
    const loadingSpinner = window.locator(".animate-spin");
    if (await loadingSpinner.isVisible({ timeout: 500 })) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 3000 });
    }
  } catch {
    // No loading spinner present, continue
  }

  // Look for the agent pill in the agent labels container using the correct format
  const agentInDisplay = window.locator("div").filter({
    hasText: new RegExp(`${agentName}\\s*\\|`, "i"), // Match "AgentName | AgentRole" format
  });

  await expect(agentInDisplay.first()).toBeVisible({ timeout });
};

/**
 * Wait for "No available agents" state in modal.
 * Useful for testing edge cases when no agents are configured.
 */
export const waitForNoAvailableAgentsState = async (
  window: TestWindow,
): Promise<void> => {
  // Ensure modal is visible first
  await expect(window.locator('[role="dialog"]')).toBeVisible();

  // Look for the "No available agents to add" message
  const noAgentsMessage = window.locator('text="No available agents to add"');

  await expect(noAgentsMessage).toBeVisible({ timeout: 2000 });
};

/**
 * Click the Add button in the modal to confirm agent selection.
 * Verifies the button is enabled before clicking.
 */
export const clickAddButtonInModal = async (
  window: TestWindow,
): Promise<void> => {
  // Find the Add Agent button (not Cancel) - exact text match "Add Agent"
  const addButton = window
    .locator('[role="dialog"] button')
    .filter({ hasText: "Add Agent" });

  await expect(addButton).toBeVisible({ timeout: 1000 });
  await expect(addButton).toBeEnabled({ timeout: 1000 });

  await addButton.click();
};

/**
 * Click the Cancel button in the modal.
 * Handles modal dismissal.
 */
export const clickCancelButtonInModal = async (
  window: TestWindow,
): Promise<void> => {
  const cancelButton = window
    .locator('[role="dialog"] button')
    .filter({ hasText: "Cancel" });

  await expect(cancelButton).toBeVisible({ timeout: 1000 });
  await cancelButton.click();
};

/**
 * Wait for modal error message to appear.
 * Useful for testing error states in agent addition.
 */
export const waitForModalError = async (
  window: TestWindow,
  errorText?: string,
): Promise<void> => {
  const errorSelector = window.locator(".text-destructive");

  await expect(errorSelector.first()).toBeVisible({ timeout: 3000 });

  if (errorText) {
    await expect(errorSelector).toContainText(errorText);
  }
};

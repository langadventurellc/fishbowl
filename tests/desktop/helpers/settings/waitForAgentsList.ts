import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

/**
 * Wait for the agents list to be visible and loaded.
 * Handles both populated list and loading states.
 */
export const waitForAgentsList = async (
  window: TestWindow,
  shouldHaveAgents: boolean = true,
) => {
  // First, wait for any loading spinner to disappear
  try {
    const loadingSpinner = window.locator(".animate-spin");
    if (await loadingSpinner.isVisible({ timeout: 500 })) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    }
  } catch {
    // No loading spinner present, continue
  }

  // Wait for agents section to be visible first
  await expect(window.locator(".agents-section")).toBeVisible({
    timeout: 5000,
  });

  if (shouldHaveAgents) {
    // Look for agent cards using role="article" (based on AgentCard component)
    const agentCards = window.locator('[role="article"]');

    try {
      // Wait for at least one agent card to be visible
      await expect(agentCards.first()).toBeVisible({ timeout: 5000 });

      // Debug: Log the number of agents found
      const agentCount = await agentCards.count();
      if (agentCount === 0) {
        console.log("Warning: No agent cards found");
      }
    } catch {
      // Agent cards not found - debug output
      console.log("Agent cards not found. Page content:");
      const agentsSection = await window
        .locator(".agents-section")
        .textContent();
      console.log(agentsSection);

      // Re-throw with better error message
      throw new Error(
        "Failed to find agent cards. The agents section may not have loaded properly.",
      );
    }
  } else {
    // Wait for empty state
    try {
      // Look for common empty state indicators
      const emptyState = window.locator(
        'text=/no agents/i, text=/create.*first.*agent/i, [data-testid*="empty"]',
      );
      await expect(emptyState.first()).toBeVisible({ timeout: 5000 });
    } catch {
      // If no specific empty state found, ensure no agent cards are present
      const agentCards = window.locator('[data-testid*="agent-"]');
      await expect(agentCards).toHaveCount(0, { timeout: 2000 });
    }
  }

  // Small delay for grid layout to stabilize
  await window.waitForTimeout(200);
};

/**
 * Wait specifically for the empty state (no agents).
 * Useful for testing after clearing all agents.
 */
export const waitForAgentsEmptyState = async (window: TestWindow) => {
  // Wait for loading to complete first
  try {
    const loadingSpinner = window.locator(".animate-spin");
    if (await loadingSpinner.isVisible({ timeout: 500 })) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    }
  } catch {
    // No loading spinner, continue
  }

  // Wait for empty state indicators
  const emptyStateSelectors = [
    "text=/no agents/i",
    "text=/create.*first.*agent/i",
    "text=/get started.*creating.*agent/i",
    '[data-testid*="empty"]',
  ];

  let emptyStateFound = false;
  for (const selector of emptyStateSelectors) {
    try {
      await expect(window.locator(selector)).toBeVisible({ timeout: 2000 });
      emptyStateFound = true;
      break;
    } catch {
      // Try next selector
    }
  }

  if (!emptyStateFound) {
    // If no specific empty state message, ensure no agent cards are present
    const agentCards = window.locator('[data-testid*="agent-"]');
    await expect(agentCards).toHaveCount(0);
  }

  // Verify the "Create New Agent" button is present
  await expect(
    window.locator("button").filter({ hasText: /create.*agent/i }),
  ).toBeVisible();
};

/**
 * Wait for a specific agent to appear in the list by name.
 * Useful for verifying agent creation or updates.
 */
export const waitForAgent = async (window: TestWindow, agentName: string) => {
  // First ensure the list is loaded
  await waitForAgentsList(window, true);

  // Find the specific agent by name using role="article" (AgentCard)
  const agentCard = window.locator('[role="article"]').filter({
    hasText: agentName,
  });

  await expect(agentCard).toBeVisible({ timeout: 5000 });
};

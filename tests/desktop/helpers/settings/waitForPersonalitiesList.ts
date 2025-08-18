import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

/**
 * Wait for the personalities list to be visible and loaded.
 * Handles both populated list and loading states.
 */
export const waitForPersonalitiesList = async (window: TestWindow) => {
  // First, wait for any loading spinner to disappear
  try {
    const loadingSpinner = window.locator(".animate-spin");
    if (await loadingSpinner.isVisible({ timeout: 500 })) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    }
  } catch {
    // No loading spinner present, continue
  }

  // Check if we have a populated list or empty state
  const personalitiesList = window.locator('[role="list"]');
  const emptyState = window.locator("text=No personalities configured");

  try {
    // Try to find the personalities list first (most common case with 5 default personalities)
    await expect(personalitiesList).toBeVisible({ timeout: 2000 });

    // Verify at least one personality item is present (should have 5 defaults)
    const personalityItems = window.locator('[role="listitem"]');
    await expect(personalityItems.first()).toBeVisible({ timeout: 3000 });

    // Debug: Log the number of personalities found
    const personalityCount = await personalityItems.count();
    if (personalityCount === 0) {
      console.log(
        "Warning: Personalities list is visible but contains no items",
      );
    }
  } catch {
    // If no list found, check for empty state
    try {
      await expect(emptyState).toBeVisible({ timeout: 2000 });
    } catch {
      // Neither list nor empty state found - debug output
      console.log(
        "Neither personalities list nor empty state found. Page content:",
      );
      const personalitiesSection = await window
        .locator(".personalities-section")
        .textContent();
      console.log(personalitiesSection);

      // Re-throw with better error message
      throw new Error(
        "Failed to find personalities list or empty state. The personalities section may not have loaded properly.",
      );
    }
  }
};

/**
 * Wait specifically for the empty state (no personalities).
 * Useful for testing after clearing all personalities.
 */
export const waitForPersonalitiesEmptyState = async (window: TestWindow) => {
  // Wait for loading to complete first
  try {
    const loadingSpinner = window.locator(".animate-spin");
    if (await loadingSpinner.isVisible({ timeout: 500 })) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    }
  } catch {
    // No loading spinner, continue
  }

  // Wait for the empty state message
  await expect(window.locator("text=No personalities configured")).toBeVisible({
    timeout: 5000,
  });

  // Verify the "Create First Personality" button is present
  await expect(
    window.locator("button").filter({ hasText: "Create First Personality" }),
  ).toBeVisible();
};

/**
 * Wait for a specific personality to appear in the list by name.
 * Useful for verifying personality creation or updates.
 */
export const waitForPersonality = async (
  window: TestWindow,
  personalityName: string,
) => {
  // First ensure the list is loaded
  await waitForPersonalitiesList(window);

  // Find the specific personality by name
  const personalityCard = window.locator('[role="listitem"]').filter({
    has: window.locator("text=" + personalityName),
  });

  await expect(personalityCard).toBeVisible({ timeout: 5000 });
};

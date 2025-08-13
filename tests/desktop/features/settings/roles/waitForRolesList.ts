import { expect } from "@playwright/test";
import type { TestWindow } from "../../../helpers/TestWindow";

/**
 * Wait for the roles list to be visible and loaded.
 * Handles both populated list and loading states.
 */
export const waitForRolesList = async (window: TestWindow) => {
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
  const rolesList = window.locator('[role="list"]');
  const emptyState = window.locator("text=No roles configured");

  try {
    // Try to find the roles list first (most common case with 4 default roles)
    await expect(rolesList).toBeVisible({ timeout: 2000 });

    // Verify at least one role item is present (should have 4 defaults)
    const roleItems = window.locator('[role="listitem"]');
    await expect(roleItems.first()).toBeVisible({ timeout: 3000 });

    // Debug: Log the number of roles found
    const roleCount = await roleItems.count();
    if (roleCount === 0) {
      console.log("Warning: Roles list is visible but contains no items");
    }
  } catch {
    // If no list found, check for empty state
    try {
      await expect(emptyState).toBeVisible({ timeout: 2000 });
    } catch {
      // Neither list nor empty state found - debug output
      console.log("Neither roles list nor empty state found. Page content:");
      const rolesSection = await window.locator(".roles-section").textContent();
      console.log(rolesSection);

      // Re-throw with better error message
      throw new Error(
        "Failed to find roles list or empty state. The roles section may not have loaded properly.",
      );
    }
  }
};

/**
 * Wait specifically for the empty state (no roles).
 * Useful for testing after clearing all roles.
 */
export const waitForRolesEmptyState = async (window: TestWindow) => {
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
  await expect(window.locator("text=No roles configured")).toBeVisible({
    timeout: 5000,
  });

  // Verify the "Create First Role" button is present
  await expect(
    window.locator("button").filter({ hasText: "Create First Role" }),
  ).toBeVisible();
};

/**
 * Wait for a specific role to appear in the list by name.
 * Useful for verifying role creation or updates.
 */
export const waitForRole = async (window: TestWindow, roleName: string) => {
  // First ensure the list is loaded
  await waitForRolesList(window);

  // Find the specific role by name
  const roleCard = window.locator('[role="listitem"]').filter({
    has: window.locator("text=" + roleName),
  });

  await expect(roleCard).toBeVisible({ timeout: 5000 });
};

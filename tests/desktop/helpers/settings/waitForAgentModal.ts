import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

/**
 * Wait for the agent modal (create/edit) to be visible and ready for interaction.
 */
export const waitForAgentModal = async (
  window: TestWindow,
  shouldBeVisible: boolean = true,
) => {
  if (shouldBeVisible) {
    // Wait for the agent form modal to be visible using title-based pattern (same as roles tests)
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator(
        'h2:has-text("Create New Agent"), h2:has-text("Edit Agent")',
      ),
    });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Wait for modal content to be fully loaded - check for key form elements
    await expect(
      window
        .locator('input[name="name"], input[placeholder*="name" i]')
        .first(),
    ).toBeVisible({ timeout: 5000 });
  } else {
    // Wait for modal to disappear
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator(
        'h2:has-text("Create New Agent"), h2:has-text("Edit Agent")',
      ),
    });
    await expect(modal).not.toBeVisible({
      timeout: 1000,
    });
  }
};

/**
 * Wait for any agent modal to close completely.
 */
export const waitForAgentModalToClose = async (window: TestWindow) => {
  // Wait for agent form modal to disappear using title-based selector
  const modal = window.locator('[role="dialog"]').filter({
    has: window.locator(
      'h2:has-text("Create New Agent"), h2:has-text("Edit Agent")',
    ),
  });
  await expect(modal).not.toBeVisible({
    timeout: 3000,
  });

  // Additional wait for animations
  await window.waitForTimeout(200);
};

/**
 * Wait for the agent delete confirmation dialog to be visible.
 */
export const waitForAgentDeleteDialog = async (window: TestWindow) => {
  // Wait for delete confirmation dialog using the same pattern as roles deletion
  const confirmDialog = window.locator('[role="alertdialog"]');
  await expect(confirmDialog).toBeVisible({ timeout: 1000 });

  // Verify Cancel and Delete buttons are present
  await expect(
    confirmDialog.locator("button").filter({ hasText: "Cancel" }),
  ).toBeVisible();

  await expect(
    confirmDialog.locator("button").filter({ hasText: "Delete" }),
  ).toBeVisible();
};

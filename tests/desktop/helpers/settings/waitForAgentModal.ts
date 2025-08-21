import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

/**
 * Wait for the agent modal (create/edit) to be visible and ready for interaction.
 */
export const waitForAgentModal = async (
  window: TestWindow,
  shouldBeVisible: boolean = true,
) => {
  const modalSelector = ".agent-form-modal";

  if (shouldBeVisible) {
    // Wait for the agent form modal to be visible
    await expect(window.locator(modalSelector)).toBeVisible({ timeout: 5000 });

    // Wait for modal content to be fully loaded - check for key form elements
    await expect(
      window
        .locator('input[name="name"], input[placeholder*="name" i]')
        .first(),
    ).toBeVisible({ timeout: 3000 });
  } else {
    // Wait for modal to disappear
    await expect(window.locator(modalSelector)).not.toBeVisible({
      timeout: 5000,
    });
  }
};

/**
 * Wait for any agent modal to close completely.
 */
export const waitForAgentModalToClose = async (window: TestWindow) => {
  // Wait for agent form modal to disappear
  await expect(window.locator(".agent-form-modal")).not.toBeVisible({
    timeout: 3000,
  });

  // Additional wait for animations
  await window.waitForTimeout(200);
};

/**
 * Wait for the agent delete confirmation dialog to be visible.
 */
export const waitForAgentDeleteDialog = async (window: TestWindow) => {
  // Wait for the dialog overlay
  await expect(window.locator('[data-slot="dialog-overlay"]')).toBeVisible({
    timeout: 3000,
  });

  // Wait for delete confirmation content
  await expect(
    window.locator('[role="alertdialog"], [role="dialog"]').filter({
      has: window.locator("text=/delete.*agent/i"),
    }),
  ).toBeVisible({ timeout: 2000 });

  // Verify Cancel and Delete buttons are present
  await expect(
    window.locator("button").filter({ hasText: "Cancel" }),
  ).toBeVisible();

  await expect(
    window.locator("button").filter({ hasText: "Delete" }),
  ).toBeVisible();
};

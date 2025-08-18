import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

/**
 * Wait for the personality modal (create/edit) to be visible and ready for interaction.
 */
export const waitForPersonalityModal = async (
  window: TestWindow,
  mode: "create" | "edit" = "create",
) => {
  const modalTitle =
    mode === "create" ? "Create Personality" : "Edit Personality";
  // Wait for the personality modal with the specified title
  await expect(
    window.locator('[role="dialog"]').filter({
      has: window.locator(`h2:has-text("${modalTitle}")`),
    }),
  ).toBeVisible({ timeout: 5000 });
};

/**
 * Wait for the delete confirmation dialog to be visible.
 */
export const waitForDeleteDialog = async (window: TestWindow) => {
  // Wait for the dialog overlay
  await expect(window.locator('[data-slot="dialog-overlay"]')).toBeVisible({
    timeout: 3000,
  });

  // Wait for delete confirmation content
  await expect(
    window.locator('[role="alertdialog"], [role="dialog"]').filter({
      has: window.locator("text=/delete.*personality/i"),
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

/**
 * Wait for any modal to close completely.
 */
export const waitForModalToClose = async (window: TestWindow) => {
  // Wait for personality modals (either Create or Edit) to disappear
  await expect(
    window.locator('[role="dialog"]').filter({
      has: window.locator(
        'h2:has-text("Create Personality"), h2:has-text("Edit Personality")',
      ),
    }),
  ).not.toBeVisible({ timeout: 3000 });

  // Additional wait for animations
  await window.waitForTimeout(200);
};

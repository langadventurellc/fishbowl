import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

/**
 * Wait for the personality modal (create/edit) to be visible and ready for interaction.
 */
export const waitForPersonalityModal = async (window: TestWindow) => {
  // Wait for modal to be present in DOM
  const modal = window.locator('[data-testid="personality-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  // Wait for modal content to be stable
  await window.waitForTimeout(300);

  // Verify essential form elements are present
  await expect(window.locator('input[name="name"]')).toBeVisible();
  await expect(
    window.locator('textarea[name="customInstructions"]'),
  ).toBeVisible();

  // Verify save button is present
  await expect(
    window.locator("button").filter({ hasText: "Save" }),
  ).toBeVisible();
};

/**
 * Wait for the delete confirmation dialog to be visible.
 */
export const waitForDeleteDialog = async (window: TestWindow) => {
  // Wait for the delete confirmation dialog
  const deleteDialog = window.locator('[role="dialog"]').filter({
    has: window.locator("text=Delete Personality"),
  });

  await expect(deleteDialog).toBeVisible({ timeout: 3000 });

  // Verify delete confirmation button is present
  await expect(
    window.locator("button").filter({ hasText: "Delete" }),
  ).toBeVisible();
};

/**
 * Wait for any modal to close completely.
 */
export const waitForModalToClose = async (window: TestWindow) => {
  // Wait for personality modal to disappear
  try {
    await expect(
      window.locator('[data-testid="personality-modal"]'),
    ).not.toBeVisible({ timeout: 3000 });
  } catch {
    // Modal wasn't open, continue
  }

  // Wait for delete dialog to disappear
  try {
    await expect(
      window.locator('[role="dialog"]').filter({
        has: window.locator("text=Delete Personality"),
      }),
    ).not.toBeVisible({ timeout: 3000 });
  } catch {
    // Dialog wasn't open, continue
  }

  // Wait for any overlay to disappear
  try {
    await expect(
      window.locator('[data-slot="dialog-overlay"]'),
    ).not.toBeVisible({ timeout: 2000 });
  } catch {
    // No overlay present, continue
  }
};

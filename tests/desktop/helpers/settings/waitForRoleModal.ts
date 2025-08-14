import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

/**
 * Wait for the role creation/editing modal to appear.
 */
export const waitForRoleModal = async (window: TestWindow) => {
  // Wait for the role creation modal with "Create Role" title
  await expect(
    window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    }),
  ).toBeVisible({ timeout: 5000 });
};

/**
 * Wait for the role deletion confirmation dialog.
 */
export const waitForDeleteDialog = async (window: TestWindow) => {
  // Wait for the dialog overlay
  await expect(window.locator('[data-slot="dialog-overlay"]')).toBeVisible({
    timeout: 3000,
  });

  // Wait for delete confirmation content
  await expect(
    window.locator('[role="alertdialog"], [role="dialog"]').filter({
      has: window.locator("text=/delete.*role/i"),
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
  // Wait for the role creation modal to disappear
  await expect(
    window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    }),
  ).not.toBeVisible({ timeout: 3000 });

  // Additional wait for animations
  await window.waitForTimeout(200);
};

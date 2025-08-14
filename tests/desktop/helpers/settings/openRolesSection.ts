import { expect } from "@playwright/test";
import { TestWindow } from "../TestWindow";

export async function openRolesSection(window: TestWindow) {
  // Ensure no modals are open before starting
  try {
    await window.evaluate(() => {
      if (window.testHelpers?.isSettingsModalOpen()) {
        window.testHelpers!.closeSettingsModal();
      }
    });

    // Wait for any existing modal to close
    await expect(
      window.locator('[data-testid="settings-modal"]'),
    ).not.toBeVisible({ timeout: 2000 });

    // Wait for any dialog overlays to disappear
    await expect(
      window.locator('[data-slot="dialog-overlay"]'),
    ).not.toBeVisible({ timeout: 2000 });

    // Small additional delay for any remaining animations
    await window.waitForTimeout(200);
  } catch {
    // No modal was open, continue
  }

  // Open settings modal
  await window.evaluate(() => {
    window.testHelpers!.openSettingsModal();
  });

  // Wait for settings modal to be fully visible and stable
  await expect(window.locator('[data-testid="settings-modal"]')).toBeVisible();

  // Wait a bit for modal animations to settle
  await window.waitForTimeout(300);

  // Navigate to Roles tab - wait for it to be clickable
  const rolesNavItem = window.locator("button").filter({ hasText: "Roles" });

  await expect(rolesNavItem).toBeVisible();
  await expect(rolesNavItem).toBeEnabled();
  await rolesNavItem.click();

  // Wait for roles section to be visible
  await expect(window.locator("h1").filter({ hasText: "Roles" })).toBeVisible();

  // Ensure the roles section container is visible
  await expect(window.locator(".roles-section")).toBeVisible();
}

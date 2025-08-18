import { expect } from "@playwright/test";
import { TestWindow } from "../TestWindow";

export async function openPersonalitiesSection(window: TestWindow) {
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

  // Navigate to Personalities tab - wait for it to be clickable
  const personalitiesNavItem = window
    .locator("button")
    .filter({ hasText: "Personalities" });

  await expect(personalitiesNavItem).toBeVisible();
  await expect(personalitiesNavItem).toBeEnabled();
  await personalitiesNavItem.click();

  // Wait for personalities section to be visible
  await expect(
    window.locator("h1").filter({ hasText: "Personalities" }),
  ).toBeVisible();

  // Ensure the personalities section container is visible
  await expect(window.locator(".personalities-section")).toBeVisible();
}

import { expect } from "@playwright/test";
import { TestWindow } from "helpers/TestWindow";

export async function openAppearanceSettings(window: TestWindow) {
  // Open settings modal
  await window.evaluate(() => {
    window.testHelpers!.openSettingsModal();
  });

  await expect(window.locator('[data-testid="settings-modal"]')).toBeVisible();

  // Navigate to appearance settings - the nav items use the section name
  const appearanceNavItem = window
    .locator("button")
    .filter({ hasText: "Appearance" });
  await appearanceNavItem.click();

  // Wait for appearance form to be visible
  await expect(
    window.locator("h1").filter({ hasText: "Appearance" }),
  ).toBeVisible();
}

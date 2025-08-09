import { expect } from "@playwright/test";
import { TestWindow } from "helpers/TestWindow";

export async function openAdvancedSettings(window: TestWindow) {
  // Open settings modal
  await window.evaluate(() => {
    window.testHelpers!.openSettingsModal();
  });

  await expect(window.locator('[data-testid="settings-modal"]')).toBeVisible();

  // Navigate to Advanced settings tab
  const advancedNavItem = window
    .locator("button")
    .filter({ hasText: "Advanced" });
  await advancedNavItem.click();

  // Wait for advanced form to be visible
  await expect(
    window.locator("h1").filter({ hasText: "Advanced Settings" }),
  ).toBeVisible();
}

import { expect } from "@playwright/test";
import type { TestWindow } from "../../../helpers";

export const waitForConfigurationList = async (window: TestWindow) => {
  await expect(window.locator('[role="article"]').first()).toBeVisible({
    timeout: 5000,
  });
};

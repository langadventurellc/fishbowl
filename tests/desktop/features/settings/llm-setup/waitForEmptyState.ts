import { expect } from "@playwright/test";
import type { TestWindow } from "../../../helpers";

export const waitForEmptyState = async (window: TestWindow) => {
  // Debug what's actually on the page if empty state not found
  try {
    await expect(
      window.locator("text=No LLM providers configured"),
    ).toBeVisible({ timeout: 2000 });
  } catch {
    console.log("Empty state not found. Page content:");
    const pageContent = await window.locator("main").textContent();
    console.log(pageContent);

    // Check if there are any configuration cards present
    const configCards = await window.locator('[role="article"]').count();
    console.log(`Number of configuration cards found: ${configCards}`);

    await expect(
      window.locator("text=No LLM providers configured"),
    ).toBeVisible({ timeout: 5000 });
  }
};

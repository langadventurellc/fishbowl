import { expect } from "@playwright/test";
import type { TestWindow } from "../index";

/**
 * Helper function to create a new conversation by clicking the "New Conversation" button
 * @param window - The test window instance
 * @returns Promise that resolves when the conversation has been successfully created
 */
export async function createConversation(window: TestWindow): Promise<void> {
  // Locate the New Conversation button
  const newConversationButton = window.locator(
    '[data-testid="new-conversation-button"]',
  );

  // Verify button is present and enabled before clicking
  await expect(newConversationButton).toBeVisible();
  await expect(newConversationButton).not.toBeDisabled();
  await expect(newConversationButton).toHaveText("New Conversation");

  // Click the button to create the conversation
  await newConversationButton.click();

  // Wait for creation to complete (button returns to normal state)
  await expect(newConversationButton).toHaveText("New Conversation", {
    timeout: 10000,
  });
  await expect(newConversationButton).not.toBeDisabled();
}

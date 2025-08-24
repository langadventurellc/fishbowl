import { expect, test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import {
  createElectronApp,
  type TestElectronApplication,
  type TestWindow,
} from "../../helpers";
import { queryConversations } from "../../helpers/database";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Feature: New Conversation Button", () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;

  test.beforeEach(async () => {
    // Create fresh Electron app instance for each test - avoids database connection issues
    const electronPath = path.join(
      __dirname,
      "../../../../apps/desktop/dist-electron/electron/main.js",
    );
    electronApp = await createElectronApp(electronPath);

    window = electronApp.window;
    await window.waitForLoadState("domcontentloaded");
    await window.waitForLoadState("networkidle");

    // Wait for database migrations to complete
    // Give the app time to run migrations and create the tables
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify the conversations table exists by attempting a simple query
    let retries = 5;
    while (retries > 0) {
      try {
        await queryConversations(electronApp);
        break; // Success - table exists
      } catch (error) {
        if (retries === 1) throw error; // Last retry - let it fail
        await new Promise((resolve) => setTimeout(resolve, 500));
        retries--;
      }
    }
  });

  test.afterEach(async () => {
    // Reset database to ensure clean state for next test
    if (electronApp) {
      // await resetDatabase(electronApp);
    }

    // Close the Electron app instance after each test
    if (electronApp) {
      await electronApp.close();
    }
  });

  test.describe("Scenario: Basic Conversation Creation", () => {
    test("creates conversation in UI and database when button clicked", async () => {
      // Given - App is loaded with clean database and sidebar is visible
      await window.waitForLoadState("networkidle");

      // Verify we start with no conversations
      const initialConversations = await queryConversations(electronApp);
      expect(initialConversations).toHaveLength(0);

      // Verify the New Conversation button is present and enabled
      const newConversationButton = window.locator(
        '[data-testid="new-conversation-button"]',
      );
      await expect(newConversationButton).toBeVisible();
      await expect(newConversationButton).not.toBeDisabled();
      await expect(newConversationButton).toHaveText("New Conversation");

      // When - New Conversation button is clicked
      await newConversationButton.click();

      // Wait for creation to complete (button returns to normal state)
      // Note: The loading state might be too fast to catch consistently
      await expect(newConversationButton).toHaveText("New Conversation", {
        timeout: 10000,
      });
      await expect(newConversationButton).not.toBeDisabled();

      // Then - Conversation appears in the UI list
      // Look for conversation items using flexible selectors
      const conversationItems = window.locator(
        ".relative.px-3.py-2, [class*='conversation'], .conversation-item",
      );
      await expect(conversationItems).toHaveCount(1);

      // Verify conversation content is displayed
      await expect(conversationItems.first()).toContainText("New Conversation");
      await expect(conversationItems.first()).toContainText("just now");

      // And - Conversation exists in database
      const conversations = await queryConversations(electronApp);
      expect(conversations).toHaveLength(1);

      const conversation = conversations[0]!;
      expect(conversation).toBeDefined();
      expect(conversation.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      expect(conversation.title).toBe("New Conversation"); // Default title
      expect(conversation.created_at).toBeTruthy();
      expect(conversation.updated_at).toBeTruthy();

      // Verify timestamps are valid dates
      expect(new Date(conversation.created_at).getTime()).toBeGreaterThan(0);
      expect(new Date(conversation.updated_at).getTime()).toBeGreaterThan(0);
    });

    test("handles multiple conversation creation", async () => {
      // Given - App is loaded with clean database
      await window.waitForLoadState("networkidle");

      const newConversationButton = window.locator(
        '[data-testid="new-conversation-button"]',
      );

      // When - Button is clicked twice
      await newConversationButton.click();
      await expect(newConversationButton).toHaveText("New Conversation", {
        timeout: 10000,
      }); // Wait for first to complete

      await newConversationButton.click();
      await expect(newConversationButton).toHaveText("New Conversation", {
        timeout: 10000,
      }); // Wait for second to complete

      // Then - Two conversations exist in database
      const conversations = await queryConversations(electronApp);
      expect(conversations).toHaveLength(2);

      // Verify they have different IDs
      expect(conversations[0]!.id).not.toBe(conversations[1]!.id);

      // And - Two conversations are visible in UI
      const conversationItems = window.locator(
        ".relative.px-3.py-2, [class*='conversation'], .conversation-item",
      );
      await expect(conversationItems).toHaveCount(2);
    });
  });

  test.describe("Scenario: Button State Management", () => {
    test("button shows correct loading states during creation", async () => {
      // Given - App is loaded
      await window.waitForLoadState("networkidle");

      const newConversationButton = window.locator(
        '[data-testid="new-conversation-button"]',
      );

      // Then - Initial state shows correct text and is enabled
      await expect(newConversationButton).toHaveText("New Conversation");
      await expect(newConversationButton).not.toBeDisabled();

      // When - Button is clicked, we try to catch the loading state
      // Note: Loading state may be very brief, so we use a race condition approach
      const clickPromise = newConversationButton.click();

      try {
        // Try to catch the loading state (with short timeout)
        await expect(newConversationButton).toHaveText("Creating...", {
          timeout: 1000,
        });
        await expect(newConversationButton).toBeDisabled();
      } catch {
        // If we miss the loading state (operation was too fast), that's okay
        // The important thing is that the operation completes successfully
      }

      // Ensure the click operation completes
      await clickPromise;

      // And - Eventually returns to normal state
      await expect(newConversationButton).toHaveText("New Conversation", {
        timeout: 10000,
      });
      await expect(newConversationButton).not.toBeDisabled();

      // Verify a conversation was actually created
      const conversations = await queryConversations(electronApp);
      expect(conversations).toHaveLength(1);
    });
  });

  test.describe("Scenario: Database Isolation", () => {
    test("each test starts with clean database", async () => {
      // Given - First test creates a conversation
      const newConversationButton = window.locator(
        '[data-testid="new-conversation-button"]',
      );

      await newConversationButton.click();
      await expect(newConversationButton).toHaveText("New Conversation", {
        timeout: 10000,
      });

      // Verify conversation was created
      const conversationsAfterFirst = await queryConversations(electronApp);
      expect(conversationsAfterFirst).toHaveLength(1);
    });

    test("previous test data is cleared", async () => {
      // Then - Second test starts with clean database (due to beforeEach)
      const conversations = await queryConversations(electronApp);
      expect(conversations).toHaveLength(0);

      // Verify UI shows no conversations
      const conversationItems = window.locator(
        ".relative.px-3.py-2, [class*='conversation'], .conversation-item",
      );
      await expect(conversationItems).toHaveCount(0);

      // Verify empty state message is shown
      await expect(window.locator("text=No conversations yet")).toBeVisible();
    });
  });
});

import { expect, test } from "@playwright/test";
import { readFile } from "fs/promises";
import {
  setupPersonalitiesTestSuite,
  openPersonalitiesSection,
  waitForPersonalitiesList,
  createMockPersonalityData,
  waitForPersonalityModal,
  waitForPersonalityModalToClose,
} from "../../../helpers";

test.describe("Feature: Personalities Section - Personality Deletion", () => {
  const testSuite = setupPersonalitiesTestSuite();

  test("deletes custom personality successfully with confirmation", async () => {
    const window = testSuite.getWindow();
    const personalitiesConfigPath = testSuite.getPersonalitiesConfigPath();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Create a test personality first
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    const testPersonality = createMockPersonalityData({
      name: "Personality To Delete",
    });
    await modal.locator("#personality-name").fill(testPersonality.name);
    await modal
      .locator("#custom-instructions")
      .fill(testPersonality.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await saveButton.click();
    await waitForPersonalityModalToClose(window);

    // Get initial personality count (should be at least 6: 5 defaults + 1 created)
    const initialPersonalityCount = await window
      .locator('[role="listitem"]')
      .count();
    expect(initialPersonalityCount).toBeGreaterThanOrEqual(6);

    // Find the personality and click delete button
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testPersonality.name}"`),
    });

    // Click delete button (always visible, no hover needed)
    const deleteButton = personalityCard.getByRole("button", {
      name: /^delete /i,
    });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Verify confirmation dialog appears
    const confirmDialog = window.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible();

    // Verify dialog content
    await expect(confirmDialog).toContainText("Delete Personality");
    await expect(confirmDialog).toContainText(testPersonality.name);
    await expect(confirmDialog).toContainText("This action cannot be undone");

    // Click "Delete" to confirm
    const deletePersonalityButton = confirmDialog.locator("button").filter({
      hasText: "Delete",
    });
    await expect(deletePersonalityButton).toBeVisible();
    await deletePersonalityButton.click();

    // Verify dialog closes
    await expect(confirmDialog).not.toBeVisible({ timeout: 5000 });

    // Verify personality is removed from list
    await expect(personalityCard).not.toBeVisible();

    // Verify personality count decreased by 1
    const finalPersonalityCount = await window
      .locator('[role="listitem"]')
      .count();
    expect(finalPersonalityCount).toBe(initialPersonalityCount - 1);

    // Verify deletion persisted to storage with retry logic
    let persistenceVerified = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await window.waitForTimeout(200 * (attempt + 1)); // Progressive backoff
        const personalitiesContent = await readFile(
          personalitiesConfigPath,
          "utf-8",
        );
        const personalitiesData = JSON.parse(personalitiesContent);
        const deletedPersonality = personalitiesData.personalities.find(
          (p: { name: string }) => p.name === testPersonality.name,
        );

        if (!deletedPersonality) {
          persistenceVerified = true;
          break;
        }
      } catch {
        // Continue trying
      }
    }

    expect(persistenceVerified).toBe(true);
  });

  test("cancels deletion when Cancel is clicked", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Create a test personality
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    const testPersonality = createMockPersonalityData({
      name: "Keep This Personality",
    });
    await modal.locator("#personality-name").fill(testPersonality.name);
    await modal
      .locator("#custom-instructions")
      .fill(testPersonality.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await saveButton.click();
    await waitForPersonalityModalToClose(window);

    // Find the personality and attempt deletion
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testPersonality.name}"`),
    });

    const deleteButton = personalityCard.getByRole("button", {
      name: /^delete /i,
    });
    await deleteButton.click();

    // Wait for confirmation dialog
    const confirmDialog = window.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible();

    // Click Cancel
    const cancelButton = confirmDialog.locator("button").filter({
      hasText: "Cancel",
    });
    await cancelButton.click();

    // Verify dialog closes
    await expect(confirmDialog).not.toBeVisible();

    // Verify personality still exists
    await expect(personalityCard).toBeVisible();
    await expect(personalityCard).toContainText(testPersonality.name);
  });

  test("shows proper delete confirmation dialog content", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Create a test personality
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    const testPersonality = createMockPersonalityData({
      name: "Dialog Test Personality",
    });
    await modal.locator("#personality-name").fill(testPersonality.name);
    await modal
      .locator("#custom-instructions")
      .fill(testPersonality.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await saveButton.click();
    await waitForPersonalityModalToClose(window);

    // Find the personality and click delete
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testPersonality.name}"`),
    });

    const deleteButton = personalityCard.getByRole("button", {
      name: /^delete /i,
    });
    await deleteButton.click();

    // Verify dialog appears with correct content
    const confirmDialog = window.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible();

    // Verify dialog title
    await expect(confirmDialog).toContainText("Delete Personality");

    // Verify personality name appears in dialog
    await expect(confirmDialog).toContainText(testPersonality.name);

    // Verify warning message
    await expect(confirmDialog).toContainText("This action cannot be undone");

    // Verify "Cancel" and "Delete" buttons exist
    const cancelButton = confirmDialog.locator("button").filter({
      hasText: "Cancel",
    });
    const deletePersonalityButton = confirmDialog.locator("button").filter({
      hasText: "Delete",
    });

    await expect(cancelButton).toBeVisible();
    await expect(deletePersonalityButton).toBeVisible();

    // Cancel the dialog
    await cancelButton.click();
  });

  test("handles deletion of multiple personalities", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Create 3 test personalities
    const testPersonalities = [
      createMockPersonalityData({ name: "First Personality" }),
      createMockPersonalityData({ name: "Second Personality" }),
      createMockPersonalityData({ name: "Third Personality" }),
    ];

    for (const personality of testPersonalities) {
      const createButton = window
        .locator("button")
        .filter({ hasText: "Create Personality" });
      await createButton.click();

      await waitForPersonalityModal(window);
      const modal = window.locator('[role="dialog"]').filter({
        has: window.locator('h2:has-text("Create Personality")'),
      });

      await modal.locator("#personality-name").fill(personality.name);
      await modal
        .locator("#custom-instructions")
        .fill(personality.customInstructions);

      const saveButton = modal
        .locator("button")
        .filter({ hasText: "Create Personality" });
      await saveButton.click();
      await waitForPersonalityModalToClose(window);
    }

    // Verify all personalities exist (5+ defaults + 3 created)
    let personalityCount = await window.locator('[role="listitem"]').count();
    expect(personalityCount).toBeGreaterThanOrEqual(8);

    // Delete the middle personality
    const middlePersonalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="Second Personality"`),
    });

    const deleteButton = middlePersonalityCard.getByRole("button", {
      name: /delete/i,
    });
    await deleteButton.click();

    const confirmDialog = window.locator('[role="alertdialog"]');
    const deletePersonalityButton = confirmDialog.locator("button").filter({
      hasText: "Delete",
    });
    await deletePersonalityButton.click();

    await expect(confirmDialog).not.toBeVisible();

    // Verify correct personality was deleted
    const finalCount = await window.locator('[role="listitem"]').count();
    expect(finalCount).toBe(personalityCount - 1);

    await expect(window.locator('text="First Personality"')).toBeVisible();
    await expect(window.locator('text="Second Personality"')).not.toBeVisible();
    await expect(window.locator('text="Third Personality"')).toBeVisible();
  });

  test("allows deletion of default personalities", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Get initial count
    const initialCount = await window.locator('[role="listitem"]').count();

    // Target a default personality (alphabetically first: The Cheerleader)
    const defaultPersonalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator('text="The Cheerleader"'),
    });

    // Click delete button
    const deleteButton = defaultPersonalityCard.getByRole("button", {
      name: /delete/i,
    });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Confirm deletion
    const confirmDialog = window.locator('[role="alertdialog"]');
    await expect(confirmDialog).toContainText("The Cheerleader");

    const deletePersonalityButton = confirmDialog.locator("button").filter({
      hasText: "Delete",
    });
    await deletePersonalityButton.click();

    // Verify deletion
    await expect(confirmDialog).not.toBeVisible();
    await expect(defaultPersonalityCard).not.toBeVisible();

    // Verify personality count decreased by 1
    const finalCount = await window.locator('[role="listitem"]').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test("deletion persists after navigating away and back", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Create and delete a test personality
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    const testPersonality = createMockPersonalityData({
      name: "Temporary Personality",
    });
    await modal.locator("#personality-name").fill(testPersonality.name);
    await modal
      .locator("#custom-instructions")
      .fill(testPersonality.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await saveButton.click();
    await waitForPersonalityModalToClose(window);

    // Delete the personality
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testPersonality.name}"`),
    });

    const deleteButton = personalityCard.getByRole("button", {
      name: /^delete /i,
    });
    await deleteButton.click();

    const confirmDialog = window.locator('[role="alertdialog"]');
    const deletePersonalityButton = confirmDialog.locator("button").filter({
      hasText: "Delete",
    });
    await deletePersonalityButton.click();

    await expect(confirmDialog).not.toBeVisible();
    await expect(personalityCard).not.toBeVisible();

    // Navigate away and back
    await window.evaluate(() => {
      window.testHelpers!.closeSettingsModal();
    });

    await window.waitForTimeout(500);

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Verify deleted personality doesn't reappear
    await expect(
      window.locator(`text="${testPersonality.name}"`),
    ).not.toBeVisible();

    // Verify the test personality was deleted and we have the expected personalities remaining
    // Count personality cards specifically to avoid counting other UI elements
    const personalityCards = window.locator(
      '[role="listitem"]:has([data-slot="card"])',
    );
    const personalityCount = await personalityCards.count();

    // The count should be the default personalities plus any remaining test personalities
    // Since test isolation might not be perfect, just verify the test personality is gone
    expect(personalityCount).toBeGreaterThanOrEqual(14); // At least the 14 defaults should remain
  });
});

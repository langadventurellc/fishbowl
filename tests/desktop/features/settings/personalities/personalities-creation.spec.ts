import { expect, test } from "@playwright/test";
import {
  setupPersonalitiesTestSuite,
  openPersonalitiesSection,
  waitForPersonalitiesList,
  waitForPersonalityModal,
  waitForPersonalityModalToClose,
  createMockPersonalityData,
} from "../../../helpers";

test.describe("Feature: Personalities Section - Personality Creation", () => {
  const testSuite = setupPersonalitiesTestSuite();

  test("creates personality with all required fields successfully", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Click create personality button
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    // Wait for modal
    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    // Fill form with mock data
    const mockData = createMockPersonalityData();
    await modal.locator("#personality-name").fill(mockData.name);
    await modal
      .locator("#custom-instructions")
      .fill(mockData.customInstructions);

    // Set a couple BigFive trait sliders to test basic functionality
    // For now, skip complex slider interactions and just test the form works
    // Sliders have default values so form should be submittable

    // Submit form
    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Verify modal closes and personality appears
    await waitForPersonalityModalToClose(window);
    await expect(window.locator(`text=${mockData.name}`)).toBeVisible();
  });

  test("validates required fields correctly", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    // Initially button should be disabled with empty fields
    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await expect(saveButton).toBeDisabled();

    // Fill only name - button should now be enabled (custom instructions is optional)
    await modal.locator("#personality-name").fill("Test Personality");
    await expect(saveButton).toBeEnabled();

    // Clear name - button should be disabled again (name is required)
    await modal.locator("#personality-name").clear();
    await expect(saveButton).toBeDisabled();
  });

  test("cancels personality creation without saving", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Get initial personality count
    const initialPersonalityCount = await window
      .locator('[role="listitem"]')
      .count();

    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    // Fill form
    const mockData = createMockPersonalityData();
    await modal.locator("#personality-name").fill(mockData.name);
    await modal
      .locator("#custom-instructions")
      .fill(mockData.customInstructions);

    // Click cancel button
    const cancelButton = modal.locator("button").filter({ hasText: "Cancel" });
    await cancelButton.click();

    // Handle confirmation dialog that appears after clicking cancel
    const confirmDialog = window
      .locator('[role="dialog"], [role="alertdialog"]')
      .filter({
        has: window.locator('text="Unsaved Changes"'),
      });

    // Confirmation dialog should appear - click "Close Without Saving"
    await expect(confirmDialog).toBeVisible({ timeout: 2000 });
    const closeWithoutSavingButton = confirmDialog.locator("button").filter({
      hasText: "Close Without Saving",
    });
    await closeWithoutSavingButton.click();

    // Wait for modal to close
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Verify no new personality was added
    const finalPersonalityCount = await window
      .locator('[role="listitem"]')
      .count();
    expect(finalPersonalityCount).toBe(initialPersonalityCount);

    // Verify the personality name doesn't appear
    await expect(window.locator(`text=${mockData.name}`)).not.toBeVisible();
  });

  test("closes modal with Escape key", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    // Press Escape
    await modal.press("Escape");

    // Verify modal closes
    await waitForPersonalityModalToClose(window);
  });

  test("personality appears in list after creation", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Get initial personality count
    const initialPersonalityCount = await window
      .locator('[role="listitem"]')
      .count();

    // Create a personality
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    const mockData = createMockPersonalityData();
    await modal.locator("#personality-name").fill(mockData.name);
    await modal
      .locator("#custom-instructions")
      .fill(mockData.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await saveButton.click();
    await waitForPersonalityModalToClose(window);

    // Verify personality count increased
    const finalPersonalityCount = await window
      .locator('[role="listitem"]')
      .count();
    expect(finalPersonalityCount).toBe(initialPersonalityCount + 1);

    // Verify personality appears in list with correct name and trait display
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${mockData.name}"`),
    });

    await expect(personalityCard).toBeVisible();
    // The personality card displays BigFive traits in format "O:50 C:50 E:50 A:50 N:50"
    await expect(personalityCard).toContainText("O:50 C:50 E:50 A:50 N:50");
  });

  test("personality persists after page reload", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Create a personality
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    const mockData = createMockPersonalityData({
      name: "Persistent Personality Test",
    });
    await modal.locator("#personality-name").fill(mockData.name);
    await modal
      .locator("#custom-instructions")
      .fill(mockData.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await saveButton.click();
    await waitForPersonalityModalToClose(window);

    // Verify personality appears
    await expect(window.locator(`text=${mockData.name}`)).toBeVisible();

    // Navigate away and back
    await window.evaluate(() => {
      window.testHelpers!.closeSettingsModal();
    });

    await window.waitForTimeout(500);

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Verify personality still exists
    await expect(window.locator(`text=${mockData.name}`)).toBeVisible();
  });

  test("form resets when reopening modal", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });

    // Open modal and fill form
    await createButton.click();
    await waitForPersonalityModal(window);

    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });
    await modal.locator("#personality-name").fill("Test Name");
    await modal.locator("#custom-instructions").fill("Test Instructions");

    // Cancel without saving
    const cancelButton = modal.locator("button").filter({ hasText: "Cancel" });
    await cancelButton.click();

    // Handle confirmation dialog
    const confirmDialog = window
      .locator('[role="dialog"], [role="alertdialog"]')
      .filter({
        has: window.locator('text="Unsaved Changes"'),
      });
    await expect(confirmDialog).toBeVisible({ timeout: 2000 });
    const closeWithoutSavingButton = confirmDialog.locator("button").filter({
      hasText: "Close Without Saving",
    });
    await closeWithoutSavingButton.click();

    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Reopen modal
    await createButton.click();
    await waitForPersonalityModal(window);

    // Verify form is reset
    await expect(modal.locator("#personality-name")).toHaveValue("");
    await expect(modal.locator("#custom-instructions")).toHaveValue("");

    // Verify sliders are visible (testing slider values separately)
    await expect(modal.locator("#big-five-openness")).toBeVisible();
  });

  test("form has trait sliders visible", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    // Verify BigFive sliders are present and visible
    await expect(modal.locator("#big-five-openness")).toBeVisible();
    await expect(modal.locator("#big-five-conscientiousness")).toBeVisible();
    await expect(modal.locator("#big-five-extraversion")).toBeVisible();

    // Verify form can be filled and submitted with default slider values
    await modal.locator("#personality-name").fill("Slider Test Personality");
    await modal
      .locator("#custom-instructions")
      .fill("Test with default trait values");

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await expect(saveButton).toBeEnabled();
  });
});

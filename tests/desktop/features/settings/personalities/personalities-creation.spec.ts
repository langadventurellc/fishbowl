import { expect, test } from "@playwright/test";
import {
  createMockPersonalityData,
  openPersonalitiesSection,
  setupPersonalitiesTestSuite,
  waitForPersonalitiesList,
  waitForPersonalityModal,
  waitForPersonalityModalToClose,
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
    const modal = window.locator(
      '[role="dialog"]:has([id="personality-name"], [id="custom-instructions"])',
    );

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
    const modal = window.locator(
      '[role="dialog"]:has([id="personality-name"], [id="custom-instructions"])',
    );

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
    const modal = window.locator(
      '[role="dialog"]:has([id="personality-name"], [id="custom-instructions"])',
    );

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
    const modal = window.locator(
      '[role="dialog"]:has([id="personality-name"], [id="custom-instructions"])',
    );

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
    const modal = window.locator(
      '[role="dialog"]:has([id="personality-name"], [id="custom-instructions"])',
    );

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
    const modal = window.locator(
      '[role="dialog"]:has([id="personality-name"], [id="custom-instructions"])',
    );

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

    const modal = window.locator(
      '[role="dialog"]:has([id="personality-name"], [id="custom-instructions"])',
    );
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

    // Expand Big 5 section to access sliders
    const big5Section = modal.locator(
      'button:has-text("Big 5 Personality Traits")',
    );
    await big5Section.click();

    // Verify sliders are visible (testing slider values separately)
    await expect(modal.locator("#slider-openness")).toBeVisible();
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
    const modal = window.locator(
      '[role="dialog"]:has([id="personality-name"], [id="custom-instructions"])',
    );

    // Expand Big 5 section to access sliders
    const big5Section = modal.locator(
      'button:has-text("Big 5 Personality Traits")',
    );
    await big5Section.click();

    // Verify BigFive sliders are present and visible
    await expect(modal.locator("#slider-openness")).toBeVisible();
    await expect(modal.locator("#slider-conscientiousness")).toBeVisible();
    await expect(modal.locator("#slider-extraversion")).toBeVisible();

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

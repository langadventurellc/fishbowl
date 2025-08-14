import { expect, test } from "@playwright/test";
import {
  setupRolesTestSuite,
  openRolesSection,
  waitForRolesList,
  waitForRoleModal,
  waitForModalToClose,
  createMockRoleData,
  createSpecialCharRoleData,
} from "../../../helpers";

test.describe("Feature: Roles Section - Role Creation", () => {
  const testSuite = setupRolesTestSuite();

  test("creates role with all required fields successfully", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Click create role button
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    // Wait for modal
    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    // Fill form with mock data
    const mockData = createMockRoleData();
    await modal.locator("#role-name").fill(mockData.name);
    await modal.locator("#role-description").fill(mockData.description);
    await modal.locator("#role-system-prompt").fill(mockData.systemPrompt);

    // Submit form
    const saveButton = modal.locator("button").filter({ hasText: "Save Role" });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Verify modal closes and role appears
    await waitForModalToClose(window);
    await expect(window.locator(`text=${mockData.name}`)).toBeVisible();
  });

  test("validates required fields and shows errors", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    // Initially button should be disabled with empty fields
    const saveButton = modal.locator("button").filter({ hasText: "Save Role" });
    await expect(saveButton).toBeDisabled();

    // Fill only name - button still disabled
    await modal.locator("#role-name").fill("Test Role");
    await expect(saveButton).toBeDisabled();

    // Add description - button still disabled
    await modal.locator("#role-description").fill("Test description");
    await expect(saveButton).toBeDisabled();

    // Add system prompt - button now enabled
    await modal.locator("#role-system-prompt").fill("Test prompt");
    await expect(saveButton).toBeEnabled();

    // Clear name and try to save - should show error
    await modal.locator("#role-name").clear();
    await expect(saveButton).toBeDisabled();
  });

  test("cancels role creation without saving", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Get initial role count
    const initialRoleCount = await window.locator('[role="listitem"]').count();

    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    // Fill form
    const mockData = createMockRoleData();
    await modal.locator("#role-name").fill(mockData.name);
    await modal.locator("#role-description").fill(mockData.description);
    await modal.locator("#role-system-prompt").fill(mockData.systemPrompt);

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

    // Verify no new role was added
    const finalRoleCount = await window.locator('[role="listitem"]').count();
    expect(finalRoleCount).toBe(initialRoleCount);

    // Verify the role name doesn't appear
    await expect(window.locator(`text=${mockData.name}`)).not.toBeVisible();
  });

  test("closes modal with Escape key", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    // Press Escape
    await modal.press("Escape");

    // Verify modal closes
    await waitForModalToClose(window);
  });

  test("role appears in list after creation", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Get initial role count
    const initialRoleCount = await window.locator('[role="listitem"]').count();

    // Create a role
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    const mockData = createMockRoleData();
    await modal.locator("#role-name").fill(mockData.name);
    await modal.locator("#role-description").fill(mockData.description);
    await modal.locator("#role-system-prompt").fill(mockData.systemPrompt);

    const saveButton = modal.locator("button").filter({ hasText: "Save Role" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Verify role count increased
    const finalRoleCount = await window.locator('[role="listitem"]').count();
    expect(finalRoleCount).toBe(initialRoleCount + 1);

    // Verify role appears in list with correct name and description
    const roleCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${mockData.name}"`),
    });

    await expect(roleCard).toBeVisible();
    await expect(roleCard.locator("p.text-muted-foreground")).toContainText(
      mockData.description,
    );
  });

  test("role persists after page reload", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Create a role
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    const mockData = createMockRoleData({ name: "Persistent Role Test" });
    await modal.locator("#role-name").fill(mockData.name);
    await modal.locator("#role-description").fill(mockData.description);
    await modal.locator("#role-system-prompt").fill(mockData.systemPrompt);

    const saveButton = modal.locator("button").filter({ hasText: "Save Role" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Verify role appears
    await expect(window.locator(`text=${mockData.name}`)).toBeVisible();

    // Navigate away and back
    await window.evaluate(() => {
      window.testHelpers!.closeSettingsModal();
    });

    await window.waitForTimeout(500);

    await openRolesSection(window);
    await waitForRolesList(window);

    // Verify role still exists
    await expect(window.locator(`text=${mockData.name}`)).toBeVisible();
  });

  test("handles special characters in role fields", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    const specialCharData = createSpecialCharRoleData();
    await modal.locator("#role-name").fill(specialCharData.name);
    await modal.locator("#role-description").fill(specialCharData.description);
    await modal
      .locator("#role-system-prompt")
      .fill(specialCharData.systemPrompt);

    const saveButton = modal.locator("button").filter({ hasText: "Save Role" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Verify role with special characters appears correctly
    await expect(window.locator(`text=${specialCharData.name}`)).toBeVisible();
  });

  test("form resets when reopening modal", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });

    // Open modal and fill form
    await createButton.click();
    await waitForRoleModal(window);

    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });
    await modal.locator("#role-name").fill("Test Name");
    await modal.locator("#role-description").fill("Test Description");

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
    await waitForRoleModal(window);

    // Verify form is reset
    await expect(modal.locator("#role-name")).toHaveValue("");
    await expect(modal.locator("#role-description")).toHaveValue("");
    await expect(modal.locator("#role-system-prompt")).toHaveValue("");
  });
});

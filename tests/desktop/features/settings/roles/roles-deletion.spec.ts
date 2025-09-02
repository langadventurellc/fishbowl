import { expect, test } from "@playwright/test";
import { readFile } from "fs/promises";
import {
  setupRolesTestSuite,
  openRolesSection,
  waitForRolesList,
  createMockRoleData,
  waitForRoleModal,
  waitForModalToClose,
  waitForRole,
} from "../../../helpers";

test.describe("Feature: Roles Section - Role Deletion", () => {
  const testSuite = setupRolesTestSuite();

  test("deletes custom role successfully with confirmation", async () => {
    const window = testSuite.getWindow();
    const rolesConfigPath = testSuite.getRolesConfigPath();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Create a test role first
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    const testRole = createMockRoleData({ name: "Role To Delete" });
    await modal.locator("#role-name").fill(testRole.name);
    await modal.locator("#role-description").fill(testRole.description);
    await modal.locator("#role-system-prompt").fill(testRole.systemPrompt);

    const saveButton = modal.locator("button").filter({ hasText: "Save Role" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Wait for the new role to appear in the list before counting
    await waitForRole(window, testRole.name);

    // Get initial role count (should be 55: 54 defaults + 1 created)
    const initialRoleCount = await window.locator('[role="listitem"]').count();
    expect(initialRoleCount).toBe(55);

    // Find and hover over the role to show action buttons
    const roleCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testRole.name}"`),
    });
    await roleCard.hover();

    // Click delete button
    const deleteButton = roleCard.locator(
      `button[aria-label="Delete ${testRole.name}"]`,
    );
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Verify confirmation dialog appears
    const confirmDialog = window.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible();

    // Verify dialog content
    await expect(confirmDialog).toContainText("Delete Role");
    await expect(confirmDialog).toContainText(testRole.name);
    await expect(confirmDialog).toContainText("This action cannot be undone");

    // Click "Delete Role" to confirm
    const deleteRoleButton = confirmDialog.locator("button").filter({
      hasText: "Delete Role",
    });
    await expect(deleteRoleButton).toBeVisible();
    await deleteRoleButton.click();

    // Verify dialog closes
    await expect(confirmDialog).not.toBeVisible({ timeout: 5000 });

    // Verify role is removed from list
    await expect(roleCard).not.toBeVisible();

    // Verify role count decreased
    const finalRoleCount = await window.locator('[role="listitem"]').count();
    expect(finalRoleCount).toBe(54); // Back to 54 default roles

    // Verify deletion persisted to storage
    const rolesContent = await readFile(rolesConfigPath, "utf-8");
    const rolesData = JSON.parse(rolesContent);
    expect(
      rolesData.roles.find((r: { name: string }) => r.name === testRole.name),
    ).toBeUndefined();
  });

  test("cancels deletion when Cancel is clicked", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Create a test role
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    const testRole = createMockRoleData({ name: "Keep This Role" });
    await modal.locator("#role-name").fill(testRole.name);
    await modal.locator("#role-description").fill(testRole.description);
    await modal.locator("#role-system-prompt").fill(testRole.systemPrompt);

    const saveButton = modal.locator("button").filter({ hasText: "Save Role" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Find the role and attempt deletion
    const roleCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testRole.name}"`),
    });
    await roleCard.hover();

    const deleteButton = roleCard.locator(
      `button[aria-label="Delete ${testRole.name}"]`,
    );
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

    // Verify role still exists
    await expect(roleCard).toBeVisible();
    await expect(roleCard).toContainText(testRole.name);
  });

  test("shows proper delete confirmation dialog content", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Create a test role
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    const testRole = createMockRoleData({ name: "Dialog Test Role" });
    await modal.locator("#role-name").fill(testRole.name);
    await modal.locator("#role-description").fill(testRole.description);
    await modal.locator("#role-system-prompt").fill(testRole.systemPrompt);

    const saveButton = modal.locator("button").filter({ hasText: "Save Role" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Find the role and click delete
    const roleCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testRole.name}"`),
    });
    await roleCard.hover();

    const deleteButton = roleCard.locator(
      `button[aria-label="Delete ${testRole.name}"]`,
    );
    await deleteButton.click();

    // Verify dialog appears with correct content
    const confirmDialog = window.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible();

    // Verify dialog title
    await expect(confirmDialog).toContainText("Delete Role");

    // Verify role name appears in dialog
    await expect(confirmDialog).toContainText(testRole.name);

    // Verify warning message
    await expect(confirmDialog).toContainText("This action cannot be undone");
    await expect(confirmDialog).toContainText("permanently remove the role");

    // Verify "Cancel" and "Delete Role" buttons exist
    const cancelButton = confirmDialog.locator("button").filter({
      hasText: "Cancel",
    });
    const deleteRoleButton = confirmDialog.locator("button").filter({
      hasText: "Delete Role",
    });

    await expect(cancelButton).toBeVisible();
    await expect(deleteRoleButton).toBeVisible();

    // Cancel the dialog
    await cancelButton.click();
  });

  test("handles deletion of multiple roles", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Create 3 test roles
    const testRoles = [
      createMockRoleData({ name: "First Role" }),
      createMockRoleData({ name: "Second Role" }),
      createMockRoleData({ name: "Third Role" }),
    ];

    for (const role of testRoles) {
      const createButton = window
        .locator("button")
        .filter({ hasText: "Create Role" });
      await createButton.click();

      await waitForRoleModal(window);
      const modal = window.locator('[role="dialog"]').filter({
        has: window.locator('h2:has-text("Create Role")'),
      });

      await modal.locator("#role-name").fill(role.name);
      await modal.locator("#role-description").fill(role.description);
      await modal.locator("#role-system-prompt").fill(role.systemPrompt);

      const saveButton = modal
        .locator("button")
        .filter({ hasText: "Save Role" });
      await saveButton.click();
      await waitForModalToClose(window);
    }

    // Verify all 57 roles exist (54 default + 3 created)
    let roleCount = await window.locator('[role="listitem"]').count();
    expect(roleCount).toBe(57);

    // Delete the middle role
    const middleRoleCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="Second Role"`),
    });
    await middleRoleCard.hover();

    const deleteButton = middleRoleCard.locator(
      'button[aria-label="Delete Second Role"]',
    );
    await deleteButton.click();

    const confirmDialog = window.locator('[role="alertdialog"]');
    const deleteRoleButton = confirmDialog.locator("button").filter({
      hasText: "Delete Role",
    });
    await deleteRoleButton.click();

    await expect(confirmDialog).not.toBeVisible();

    // Verify correct role was deleted
    roleCount = await window.locator('[role="listitem"]').count();
    expect(roleCount).toBe(56);

    await expect(window.locator('text="First Role"')).toBeVisible();
    await expect(window.locator('text="Second Role"')).not.toBeVisible();
    await expect(window.locator('text="Third Role"')).toBeVisible();
  });

  test("allows deletion of default roles", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Target a default role
    const defaultRoleCard = window.locator('[role="listitem"]').filter({
      has: window.locator('text="Project Manager"'),
    });
    await defaultRoleCard.hover();

    // Click delete button
    const deleteButton = defaultRoleCard.locator(
      'button[aria-label="Delete Project Manager"]',
    );
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Confirm deletion
    const confirmDialog = window.locator('[role="alertdialog"]');
    await expect(confirmDialog).toContainText("Project Manager");

    const deleteRoleButton = confirmDialog.locator("button").filter({
      hasText: "Delete Role",
    });
    await deleteRoleButton.click();

    // Verify deletion
    await expect(confirmDialog).not.toBeVisible();
    await expect(defaultRoleCard).not.toBeVisible();

    // Verify only 53 default roles remain
    const roleCount = await window.locator('[role="listitem"]').count();
    expect(roleCount).toBe(53);
  });

  test("deletion persists after navigating away and back", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Create and delete a test role
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Role" });
    await createButton.click();

    await waitForRoleModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Role")'),
    });

    const testRole = createMockRoleData({ name: "Temporary Role" });
    await modal.locator("#role-name").fill(testRole.name);
    await modal.locator("#role-description").fill(testRole.description);
    await modal.locator("#role-system-prompt").fill(testRole.systemPrompt);

    const saveButton = modal.locator("button").filter({ hasText: "Save Role" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Delete the role
    const roleCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testRole.name}"`),
    });
    await roleCard.hover();

    const deleteButton = roleCard.locator(
      `button[aria-label="Delete ${testRole.name}"]`,
    );
    await deleteButton.click();

    const confirmDialog = window.locator('[role="alertdialog"]');
    const deleteRoleButton = confirmDialog.locator("button").filter({
      hasText: "Delete Role",
    });
    await deleteRoleButton.click();

    await expect(confirmDialog).not.toBeVisible();
    await expect(roleCard).not.toBeVisible();

    // Navigate away and back
    await window.evaluate(() => {
      window.testHelpers!.closeSettingsModal();
    });

    await window.waitForTimeout(500);

    await openRolesSection(window);
    await waitForRolesList(window);

    // Verify deleted role doesn't reappear
    await expect(window.locator(`text="${testRole.name}"`)).not.toBeVisible();

    // Verify we still have only default roles
    const roleCount = await window.locator('[role="listitem"]').count();
    expect(roleCount).toBe(54);
  });
});

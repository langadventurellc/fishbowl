import { expect, test } from "@playwright/test";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import {
  openRolesSection,
  setupRolesTestSuite,
  waitForRolesList,
} from "../../../helpers";

test.describe("Feature: Roles Section - Default Roles Loading", () => {
  const testSuite = setupRolesTestSuite();

  test("loads 54 default roles on first visit", async () => {
    const window = testSuite.getWindow();
    const rolesConfigPath = testSuite.getRolesConfigPath();

    // Navigate to roles section
    await openRolesSection(window);
    await waitForRolesList(window);

    // Verify exactly 54 role items are displayed
    const roleItems = window.locator('[role="listitem"]');
    await expect(roleItems).toHaveCount(54, { timeout: 2000 });

    // Verify we're not in empty state
    await expect(window.locator("text=No roles configured")).not.toBeVisible();

    const fileExists = existsSync(rolesConfigPath);
    console.log(`Roles config path: ${rolesConfigPath}, exists: ${fileExists}`);
  });

  test("displays correct role names and descriptions", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Verify some key default role names are present (alphabetically sorted)
    const expectedRoleNames = [
      "Creative Writer",
      "Data Analyst",
      "Project Manager",
      "Software Engineer",
    ];

    for (const roleName of expectedRoleNames) {
      // Find role card by name
      const roleCard = window.locator('[role="listitem"]').filter({
        has: window.locator(`text="${roleName}"`),
      });

      await expect(roleCard).toBeVisible({ timeout: 5000 });

      // Verify description is present (use more specific selector to avoid button conflict)
      const description = roleCard.locator(".text-muted-foreground");
      await expect(description).toBeVisible();

      // Verify description has some content
      const descriptionText = await description.textContent();
      expect(descriptionText).toBeTruthy();
      expect(descriptionText!.length).toBeGreaterThan(10);
    }
  });

  test("shows populated state instead of empty state", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Verify empty state is NOT shown
    const emptyStateIcon = window.locator(".lucide-user-plus");
    await expect(emptyStateIcon).not.toBeVisible();

    await expect(window.locator("text=No roles configured")).not.toBeVisible();

    await expect(
      window.locator("button").filter({ hasText: "Create First Role" }),
    ).not.toBeVisible();

    // Verify "Create Role" button is at bottom of list
    const createButton = window.locator("button").filter({
      hasText: "Create Role",
    });
    await expect(createButton).toBeVisible();
    await expect(createButton).toHaveText(/^Create Role$/); // Not "Create First Role"
  });

  test("role cards have proper structure and actions", async () => {
    const window = testSuite.getWindow();

    await openRolesSection(window);
    await waitForRolesList(window);

    // Get first role card for detailed inspection
    const firstRoleCard = window.locator('[role="listitem"]').first();

    // Hover to reveal action buttons
    await firstRoleCard.hover();

    // Verify Edit button exists and is accessible
    const editButton = firstRoleCard.locator('button[aria-label*="Edit"]');
    await expect(editButton).toBeVisible();

    // Verify Delete button exists and is accessible
    const deleteButton = firstRoleCard.locator('button[aria-label*="Delete"]');
    await expect(deleteButton).toBeVisible();

    // Verify card uses Card component structure (has group class for hover effects)
    const card = firstRoleCard.locator(".group");
    await expect(card).toBeVisible();
  });

  test("persists default roles to storage file", async () => {
    const window = testSuite.getWindow();
    const rolesConfigPath = testSuite.getRolesConfigPath();

    console.log(`Looking for roles file at: ${rolesConfigPath}`);

    await openRolesSection(window);
    await waitForRolesList(window);

    // Wait for file to be created and written (with retry logic)
    let fileExists = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!fileExists && attempts < maxAttempts) {
      await window.waitForTimeout(500);
      fileExists = existsSync(rolesConfigPath);
      if (attempts % 5 === 0) {
        console.log(
          `Attempt ${attempts + 1}/${maxAttempts}: File exists = ${fileExists}`,
        );
      }
      attempts++;
    }

    // Instead of skipping, assert that the file should exist
    expect(fileExists).toBe(true);

    // Read and verify roles.json content
    const rolesContent = await readFile(rolesConfigPath, "utf-8");
    const rolesData = JSON.parse(rolesContent);

    console.log(
      `Roles file content preview: ${JSON.stringify(rolesData, null, 2).substring(0, 200)}...`,
    );

    // Verify structure (be flexible about schema version)
    expect(rolesData).toHaveProperty("schemaVersion");
    expect(rolesData).toHaveProperty("roles");

    // Verify 54 roles exist (actual count found in storage)
    expect(rolesData.roles).toHaveLength(54);

    // Verify some key role IDs match defaults
    const roleIds = rolesData.roles.map((r: { id: string }) => r.id);
    expect(roleIds).toContain("project-manager");
    expect(roleIds).toContain("software-engineer");
    expect(roleIds).toContain("creative-writer");
    expect(roleIds).toContain("data-analyst");
  });
});

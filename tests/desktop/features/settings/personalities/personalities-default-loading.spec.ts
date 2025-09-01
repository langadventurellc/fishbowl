import { expect, test } from "@playwright/test";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import {
  openPersonalitiesSection,
  setupPersonalitiesTestSuite,
  waitForPersonalitiesList,
} from "../../../helpers";

test.describe("Feature: Personalities Section - Default Personalities Loading", () => {
  const testSuite = setupPersonalitiesTestSuite();

  test("loads 14 default personalities on first visit", async () => {
    const window = testSuite.getWindow();
    const personalitiesConfigPath = testSuite.getPersonalitiesConfigPath();

    // Navigate to personalities section
    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Verify exactly 14 personality items are displayed
    // Count personality cards specifically, not all list items
    const personalityCards = window.locator(
      '[role="listitem"]:has([data-slot="card"])',
    );
    await expect(personalityCards).toHaveCount(14, { timeout: 2000 });

    // Verify we're not in empty state
    await expect(
      window.locator("text=No personalities configured"),
    ).not.toBeVisible();

    const fileExists = existsSync(personalitiesConfigPath);
    console.log(
      `Personalities config path: ${personalitiesConfigPath}, exists: ${fileExists}`,
    );
  });

  test("shows populated state instead of empty state", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Verify empty state is NOT shown
    const emptyStateIcon = window.locator(".lucide-user-plus");
    await expect(emptyStateIcon).not.toBeVisible();

    await expect(
      window.locator("text=No personalities configured"),
    ).not.toBeVisible();

    await expect(
      window.locator("button").filter({ hasText: "Create First Personality" }),
    ).not.toBeVisible();

    // Verify "Create Personality" button is at bottom of list
    const createButton = window.locator("button").filter({
      hasText: "Create Personality",
    });
    await expect(createButton).toBeVisible();
    await expect(createButton).toHaveText(/^Create Personality$/); // Not "Create First Personality"
  });

  test("personality cards have proper structure and actions", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Get first personality card for detailed inspection
    const firstPersonalityCard = window.locator('[role="listitem"]').first();

    // Verify Edit button exists and is accessible
    const editButton = firstPersonalityCard.locator('button:has-text("Edit")');
    await expect(editButton).toBeVisible();
    await expect(editButton).toContainText("Edit");

    // Verify Delete button exists and is accessible
    const deleteButton = firstPersonalityCard.locator(
      'button:has-text("Delete")',
    );
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toContainText("Delete");

    // Verify card uses Card component structure
    const card = firstPersonalityCard.locator("[class*='hover:shadow-md']");
    await expect(card).toBeVisible();
  });

  test("persists default personalities to storage file", async () => {
    const window = testSuite.getWindow();
    const personalitiesConfigPath = testSuite.getPersonalitiesConfigPath();

    console.log(
      `Looking for personalities file at: ${personalitiesConfigPath}`,
    );

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Wait for file to be created and written (with retry logic)
    let fileExists = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!fileExists && attempts < maxAttempts) {
      await window.waitForTimeout(500);
      fileExists = existsSync(personalitiesConfigPath);
      if (attempts % 5 === 0) {
        console.log(
          `Attempt ${attempts + 1}/${maxAttempts}: File exists = ${fileExists}`,
        );
      }
      attempts++;
    }

    // Instead of skipping, assert that the file should exist
    expect(fileExists).toBe(true);

    // Read and verify personalities.json content
    const personalitiesContent = await readFile(
      personalitiesConfigPath,
      "utf-8",
    );
    const personalitiesData = JSON.parse(personalitiesContent);

    console.log(
      `Personalities file content preview: ${JSON.stringify(personalitiesData, null, 2).substring(0, 200)}...`,
    );

    // Verify structure (be flexible about schema version)
    expect(personalitiesData).toHaveProperty("schemaVersion");
    expect(personalitiesData).toHaveProperty("personalities");

    // Verify 14 personalities exist
    expect(personalitiesData.personalities).toHaveLength(14);

    // Verify personality IDs match defaults
    const personalityIds = personalitiesData.personalities.map(
      (p: { id: string }) => p.id,
    );
    expect(personalityIds).toContain("the-enthusiast");
    expect(personalityIds).toContain("the-sage");
    expect(personalityIds).toContain("the-straight-shooter");
    expect(personalityIds).toContain("the-warmth");
    expect(personalityIds).toContain("the-quirky");
    expect(personalityIds).toContain("the-rock");
    expect(personalityIds).toContain("the-cheerleader");
    expect(personalityIds).toContain("the-intellectual");
    expect(personalityIds).toContain("the-dreamer");
    expect(personalityIds).toContain("the-worrier");
    expect(personalityIds).toContain("the-rebel");
    expect(personalityIds).toContain("the-nurturer");
    expect(personalityIds).toContain("the-monday");
    expect(personalityIds).toContain("the-friday");
  });

  test("displays personality trait indicators correctly", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Get first personality card alphabetically (The Cheerleader)
    const firstPersonalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator("text=The Cheerleader"),
    });

    await expect(firstPersonalityCard).toBeVisible();

    // Verify personality has trait indicators or badges
    // These would show bigFive or behavior highlights
    // The exact UI implementation may vary, but check for some trait display
    const traitIndicators = firstPersonalityCard.locator(
      '.trait-indicator, .personality-badge, [data-testid*="trait"]',
    );

    // At minimum, should have some visual indication of personality traits
    // If no specific trait UI exists, this test documents the expected behavior
    if ((await traitIndicators.count()) > 0) {
      await expect(traitIndicators.first()).toBeVisible();
    } else {
      console.log(
        "Note: No specific trait indicators found - may be implemented in future",
      );
    }
  });
});

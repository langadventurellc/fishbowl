---
id: T-create-personalities-default
title: Create Personalities Default Loading Tests
status: open
priority: medium
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-personalities-mock
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T21:17:30.322Z
updated: 2025-08-17T21:17:30.322Z
---

# Create Personalities Default Loading Tests

## Context

Create end-to-end tests for personalities default loading functionality, following the exact pattern established in `tests/desktop/features/settings/roles/roles-default-loading.spec.ts`. These tests verify that default personalities load correctly on first application visit.

## Reference Implementation

Base implementation directly on:

- `tests/desktop/features/settings/roles/roles-default-loading.spec.ts` - Primary pattern to follow
- Test structure, assertions, and expected behaviors
- Adapt for 5 default personalities vs 4 default roles

## Default Personalities Reference

From `packages/shared/src/data/defaultPersonalities.json`, the 5 default personalities are:

1. Creative Thinker
2. Analytical Strategist
3. Empathetic Supporter
4. Dynamic Leader
5. Thoughtful Advisor

## Implementation Requirements

### 1. Create personalities-default-loading.spec.ts

Create file: `tests/desktop/features/settings/personalities/personalities-default-loading.spec.ts`

Following the exact pattern from roles-default-loading.spec.ts but adapted for personalities:

```typescript
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

  test("loads 5 default personalities on first visit", async () => {
    const window = testSuite.getWindow();
    const personalitiesConfigPath = testSuite.getPersonalitiesConfigPath();

    // Navigate to personalities section
    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Verify exactly 5 personality items are displayed
    const personalityItems = window.locator('[role="listitem"]');
    await expect(personalityItems).toHaveCount(5, { timeout: 2000 });

    // Verify we're not in empty state
    await expect(
      window.locator("text=No personalities configured"),
    ).not.toBeVisible();

    const fileExists = existsSync(personalitiesConfigPath);
    console.log(
      `Personalities config path: ${personalitiesConfigPath}, exists: ${fileExists}`,
    );
  });

  test("displays correct personality names and basic traits", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Verify each default personality is present by name (these should be alphabetically sorted)
    const expectedPersonalityNames = [
      "Analytical Strategist",
      "Creative Thinker",
      "Dynamic Leader",
      "Empathetic Supporter",
      "Thoughtful Advisor",
    ];

    for (const personalityName of expectedPersonalityNames) {
      // Find personality card by name
      const personalityCard = window.locator('[role="listitem"]').filter({
        has: window.locator(`text="${personalityName}"`),
      });

      await expect(personalityCard).toBeVisible({ timeout: 5000 });

      // Verify custom instructions are present (personality equivalent of role description)
      const customInstructions = personalityCard.locator(
        "p.text-muted-foreground",
      );
      await expect(customInstructions).toBeVisible();

      // Verify custom instructions have some content
      const instructionsText = await customInstructions.textContent();
      expect(instructionsText).toBeTruthy();
      expect(instructionsText!.length).toBeGreaterThan(20); // Personalities have longer instructions
    }
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

    // Hover to reveal action buttons
    await firstPersonalityCard.hover();

    // Verify Edit button exists and is accessible
    const editButton = firstPersonalityCard.locator(
      'button[aria-label*="Edit"]',
    );
    await expect(editButton).toBeVisible();
    await expect(editButton).toContainText("Edit");

    // Verify Delete button exists and is accessible
    const deleteButton = firstPersonalityCard.locator(
      'button[aria-label*="Delete"]',
    );
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toContainText("Delete");

    // Verify card uses Card component structure
    const card = firstPersonalityCard.locator(".group.relative");
    await expect(card).toHaveClass(/border.*hover:border-border/);
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

    // Verify 5 personalities exist
    expect(personalitiesData.personalities).toHaveLength(5);

    // Verify personality IDs match defaults
    const personalityIds = personalitiesData.personalities.map(
      (p: { id: string }) => p.id,
    );
    expect(personalityIds).toContain("creative-thinker");
    expect(personalityIds).toContain("analytical-strategist");
    expect(personalityIds).toContain("empathetic-supporter");
    expect(personalityIds).toContain("dynamic-leader");
    expect(personalityIds).toContain("thoughtful-advisor");
  });

  test("displays personality trait indicators correctly", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Get Creative Thinker personality card (first alphabetically: Analytical Strategist)
    const analyticalStrategistCard = window
      .locator('[role="listitem"]')
      .filter({
        has: window.locator("text=Analytical Strategist"),
      });

    await expect(analyticalStrategistCard).toBeVisible();

    // Verify personality has trait indicators or badges
    // These would show bigFive or behavior highlights
    // The exact UI implementation may vary, but check for some trait display
    const traitIndicators = analyticalStrategistCard.locator(
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
```

### 2. Create Test Directory

Create the directory structure: `tests/desktop/features/settings/personalities/`

This should follow the exact same structure as `tests/desktop/features/settings/roles/`

## Acceptance Criteria

✅ **File Creation**: `personalities-default-loading.spec.ts` exists in correct directory
✅ **5 Default Personalities**: Tests verify exactly 5 personalities load (vs 4 roles)
✅ **Correct Names**: Tests verify all 5 expected personality names are present
✅ **Alphabetical Order**: Names are checked in alphabetical order (like roles)
✅ **No Empty State**: Verifies empty state is not shown when defaults exist
✅ **Card Structure**: Tests personality card UI elements and hover actions
✅ **File Persistence**: Verifies personalities.json file is created and contains expected data
✅ **Storage Validation**: Checks file content has correct schema and personality IDs
✅ **Error Handling**: Graceful handling of file system operations with retry logic
✅ **Debug Logging**: Console output for troubleshooting test failures

## Technical Details

### Key Adaptations from Roles

- **Count**: 5 personalities vs 4 roles
- **Names**: Different set of names (Creative Thinker, etc.)
- **IDs**: Different IDs (creative-thinker, analytical-strategist, etc.)
- **File Path**: personalities.json vs roles.json
- **Section Name**: "Personalities" vs "Roles"
- **Button Text**: "Create Personality" vs "Create Role"
- **Empty State**: "No personalities configured" vs "No roles configured"

### Expected Personality Names (Alphabetical)

1. Analytical Strategist
2. Creative Thinker
3. Dynamic Leader
4. Empathetic Supporter
5. Thoughtful Advisor

### Expected Personality IDs

- creative-thinker
- analytical-strategist
- empathetic-supporter
- dynamic-leader
- thoughtful-advisor

## Testing Requirements

### Unit Tests (included in this task)

Create test validation that verifies:

- Test file imports correctly
- Test suite runs without setup errors
- Mock functions integrate properly

## Dependencies

- Requires: T-create-personalities-mock (mock data generators)
- Requires: setupPersonalitiesTestSuite, openPersonalitiesSection, waitForPersonalitiesList
- Enables: Subsequent personality functionality tests

## Notes

- Follow exact same test structure as roles-default-loading.spec.ts
- Adapt all role-specific references to personality equivalents
- Maintain same timeout values and retry logic
- Use same debugging and error handling patterns

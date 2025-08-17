---
id: T-create-personalities-deletion
title: Create Personalities Deletion Tests
status: open
priority: medium
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-personalities-editing
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T21:22:49.208Z
updated: 2025-08-17T21:22:49.208Z
---

# Create Personalities Deletion Tests

## Context

Create end-to-end tests for personality deletion functionality, following the exact pattern established in `tests/desktop/features/settings/roles/roles-deletion.spec.ts`. These tests verify personality deletion workflows, confirmation dialogs, data persistence, and empty state handling.

## Reference Implementation

Base implementation directly on:

- `tests/desktop/features/settings/roles/roles-deletion.spec.ts` - Primary pattern to follow
- Test structure, deletion workflows, confirmation dialogs, and persistence verification
- Adapt for personality data structure and count (5 default personalities vs 4 default roles)

## Personality Deletion Workflow

The deletion workflow should include:

1. **Create personality** (setup for deletion tests)
2. **Access delete mode** via hover + delete button
3. **Confirmation dialog** with personality name and warning
4. **Confirm/Cancel** deletion workflows
5. **UI updates** immediate removal from list
6. **Persistence verification** in storage file
7. **Empty state** after deleting all personalities

## Default Personalities Reference

From `packages/shared/src/data/defaultPersonalities.json`, the 5 default personalities are:

1. Creative Thinker
2. Analytical Strategist
3. Empathetic Supporter
4. Dynamic Leader
5. Thoughtful Advisor

## Implementation Requirements

### 1. Create personalities-deletion.spec.ts

Create file: `tests/desktop/features/settings/personalities/personalities-deletion.spec.ts`

Following the exact pattern from roles-deletion.spec.ts but adapted for personalities:

```typescript
import { expect, test } from "@playwright/test";
import { readFile } from "fs/promises";
import {
  setupPersonalitiesTestSuite,
  openPersonalitiesSection,
  waitForPersonalitiesList,
  waitForPersonalitiesEmptyState,
  createMockPersonalityData,
  waitForPersonalityModal,
  waitForModalToClose,
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
    await modal.locator('input[name="name"]').fill(testPersonality.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(testPersonality.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Save Personality" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Get initial personality count (should be 6: 5 defaults + 1 created)
    const initialPersonalityCount = await window
      .locator('[role="listitem"]')
      .count();
    expect(initialPersonalityCount).toBe(6);

    // Find and hover over the personality to show action buttons
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testPersonality.name}"`),
    });
    await personalityCard.hover();

    // Click delete button
    const deleteButton = personalityCard.locator(
      `button[aria-label="Delete ${testPersonality.name} personality"]`,
    );
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Verify confirmation dialog appears
    const confirmDialog = window.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible();

    // Verify dialog content
    await expect(confirmDialog).toContainText("Delete Personality");
    await expect(confirmDialog).toContainText(testPersonality.name);
    await expect(confirmDialog).toContainText("This action cannot be undone");

    // Click "Delete Personality" to confirm
    const deletePersonalityButton = confirmDialog.locator("button").filter({
      hasText: "Delete Personality",
    });
    await expect(deletePersonalityButton).toBeVisible();
    await deletePersonalityButton.click();

    // Verify dialog closes
    await expect(confirmDialog).not.toBeVisible({ timeout: 5000 });

    // Verify personality is removed from list
    await expect(personalityCard).not.toBeVisible();

    // Verify personality count decreased
    const finalPersonalityCount = await window
      .locator('[role="listitem"]')
      .count();
    expect(finalPersonalityCount).toBe(5); // Back to 5 default personalities

    // Verify deletion persisted to storage
    const personalitiesContent = await readFile(
      personalitiesConfigPath,
      "utf-8",
    );
    const personalitiesData = JSON.parse(personalitiesContent);
    expect(
      personalitiesData.personalities.find(
        (p: { name: string }) => p.name === testPersonality.name,
      ),
    ).toBeUndefined();
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
    await modal.locator('input[name="name"]').fill(testPersonality.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(testPersonality.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Save Personality" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Find the personality and attempt deletion
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testPersonality.name}"`),
    });
    await personalityCard.hover();

    const deleteButton = personalityCard.locator(
      `button[aria-label="Delete ${testPersonality.name} personality"]`,
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
    await modal.locator('input[name="name"]').fill(testPersonality.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(testPersonality.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Save Personality" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Find the personality and click delete
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testPersonality.name}"`),
    });
    await personalityCard.hover();

    const deleteButton = personalityCard.locator(
      `button[aria-label="Delete ${testPersonality.name} personality"]`,
    );
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
    await expect(confirmDialog).toContainText(
      "permanently remove the personality",
    );

    // Verify "Cancel" and "Delete Personality" buttons exist
    const cancelButton = confirmDialog.locator("button").filter({
      hasText: "Cancel",
    });
    const deletePersonalityButton = confirmDialog.locator("button").filter({
      hasText: "Delete Personality",
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

      await modal.locator('input[name="name"]').fill(personality.name);
      await modal
        .locator('textarea[name="customInstructions"]')
        .fill(personality.customInstructions);

      const saveButton = modal
        .locator("button")
        .filter({ hasText: "Save Personality" });
      await saveButton.click();
      await waitForModalToClose(window);
    }

    // Verify all 8 personalities exist (5 default + 3 created)
    let personalityCount = await window.locator('[role="listitem"]').count();
    expect(personalityCount).toBe(8);

    // Delete the middle personality
    const middlePersonalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="Second Personality"`),
    });
    await middlePersonalityCard.hover();

    const deleteButton = middlePersonalityCard.locator(
      'button[aria-label="Delete Second Personality personality"]',
    );
    await deleteButton.click();

    const confirmDialog = window.locator('[role="alertdialog"]');
    const deletePersonalityButton = confirmDialog.locator("button").filter({
      hasText: "Delete Personality",
    });
    await deletePersonalityButton.click();

    await expect(confirmDialog).not.toBeVisible();

    // Verify correct personality was deleted
    personalityCount = await window.locator('[role="listitem"]').count();
    expect(personalityCount).toBe(7);

    await expect(window.locator('text="First Personality"')).toBeVisible();
    await expect(window.locator('text="Second Personality"')).not.toBeVisible();
    await expect(window.locator('text="Third Personality"')).toBeVisible();
  });

  test("allows deletion of default personalities", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Target a default personality (alphabetically first: Analytical Strategist)
    const defaultPersonalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator('text="Analytical Strategist"'),
    });
    await defaultPersonalityCard.hover();

    // Click delete button
    const deleteButton = defaultPersonalityCard.locator(
      'button[aria-label="Delete Analytical Strategist personality"]',
    );
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Confirm deletion
    const confirmDialog = window.locator('[role="alertdialog"]');
    await expect(confirmDialog).toContainText("Analytical Strategist");

    const deletePersonalityButton = confirmDialog.locator("button").filter({
      hasText: "Delete Personality",
    });
    await deletePersonalityButton.click();

    // Verify deletion
    await expect(confirmDialog).not.toBeVisible();
    await expect(defaultPersonalityCard).not.toBeVisible();

    // Verify only 4 default personalities remain
    const personalityCount = await window.locator('[role="listitem"]').count();
    expect(personalityCount).toBe(4);
  });

  test("shows empty state after deleting all personalities", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Delete all 5 default personalities
    const defaultPersonalityNames = [
      "Analytical Strategist",
      "Creative Thinker",
      "Dynamic Leader",
      "Empathetic Supporter",
      "Thoughtful Advisor",
    ];

    for (const personalityName of defaultPersonalityNames) {
      const personalityCard = window.locator('[role="listitem"]').filter({
        has: window.locator(`text="${personalityName}"`),
      });
      await personalityCard.hover();

      const deleteButton = personalityCard.locator(
        `button[aria-label="Delete ${personalityName} personality"]`,
      );
      await deleteButton.click();

      const confirmDialog = window.locator('[role="alertdialog"]');
      const deletePersonalityButton = confirmDialog.locator("button").filter({
        hasText: "Delete Personality",
      });
      await deletePersonalityButton.click();

      await expect(confirmDialog).not.toBeVisible();
    }

    // Verify empty state appears
    await waitForPersonalitiesEmptyState(window);

    // Verify "Create First Personality" button is present
    await expect(
      window.locator("button").filter({ hasText: "Create First Personality" }),
    ).toBeVisible();

    // Verify empty state message
    await expect(
      window.locator("text=No personalities configured"),
    ).toBeVisible();
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
    await modal.locator('input[name="name"]').fill(testPersonality.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(testPersonality.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Save Personality" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Delete the personality
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testPersonality.name}"`),
    });
    await personalityCard.hover();

    const deleteButton = personalityCard.locator(
      `button[aria-label="Delete ${testPersonality.name} personality"]`,
    );
    await deleteButton.click();

    const confirmDialog = window.locator('[role="alertdialog"]');
    const deletePersonalityButton = confirmDialog.locator("button").filter({
      hasText: "Delete Personality",
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

    // Verify we still have only default personalities
    const personalityCount = await window.locator('[role="listitem"]').count();
    expect(personalityCount).toBe(5);
  });
});
```

## Acceptance Criteria

✅ **File Creation**: `personalities-deletion.spec.ts` exists in correct directory
✅ **Delete Workflow**: Tests complete deletion workflow with confirmation dialog
✅ **Confirmation Content**: Tests dialog shows personality name and warning message
✅ **Cancel Functionality**: Tests cancel preserves personality
✅ **UI Updates**: Tests immediate removal from list after deletion
✅ **Storage Persistence**: Tests deletion persists in personalities.json file
✅ **Multiple Deletions**: Tests deleting multiple personalities works correctly
✅ **Default Personality Deletion**: Tests default personalities can be deleted
✅ **Empty State**: Tests empty state appears after deleting all personalities
✅ **Navigation Persistence**: Tests deletion persists across page navigation

## Technical Details

### Count Adaptations from Roles

- Initial count: 6 personalities (5 default + 1 created) vs 5 roles (4 default + 1 created)
- Final count after deletion: 5 personalities vs 4 roles
- Empty state reached after deleting: 5 personalities vs 4 roles

### Button/Label Changes

- "Delete Role" → "Delete Personality"
- "Delete {name} role" → "Delete {name} personality"
- Dialog title: "Delete Role" → "Delete Personality"
- Empty state: "Create First Role" → "Create First Personality"
- Empty message: "No roles configured" → "No personalities configured"

### Default Personality Names (Alphabetical)

1. Analytical Strategist
2. Creative Thinker
3. Dynamic Leader
4. Empathetic Supporter
5. Thoughtful Advisor

### File Path Changes

- `rolesConfigPath` → `personalitiesConfigPath`
- `roles.json` → `personalities.json`
- `rolesData.roles` → `personalitiesData.personalities`

### Selector Adaptations

- `'button[aria-label="Delete ${name} role"]'` → `'button[aria-label="Delete ${name} personality"]'`
- `"Delete Role"` button text → `"Delete Personality"`
- `waitForRolesEmptyState` → `waitForPersonalitiesEmptyState`

## Testing Requirements

### Unit Tests (included in this task)

Create validation tests that verify:

- Test file imports correctly
- Deletion workflow integrates properly
- Confirmation dialogs work as expected

## Dependencies

- Requires: T-create-personalities-editing (editing tests)
- Requires: All helper functions, mock data generators, and infrastructure
- Enables: Infrastructure validation tests

## Notes

- Follow exact same test patterns as roles-deletion.spec.ts
- Adapt all counts, names, and labels for personality equivalents
- Maintain same confirmation dialog and persistence verification patterns
- Test empty state thoroughly with 5 default personalities

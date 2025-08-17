---
id: T-create-personalities-editing
title: Create Personalities Editing Tests
status: open
priority: medium
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-personalities-creation
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T21:21:10.359Z
updated: 2025-08-17T21:21:10.359Z
---

# Create Personalities Editing Tests

## Context

Create end-to-end tests for personality editing functionality, following the exact pattern established in `tests/desktop/features/settings/roles/roles-editing.spec.ts`. These tests verify personality editing workflows, form validation, data persistence, and both default and custom personality editing.

## Reference Implementation

Base implementation directly on:

- `tests/desktop/features/settings/roles/roles-editing.spec.ts` - Primary pattern to follow
- Test structure, editing workflows, validation testing, and persistence verification
- Adapt for personality data structure with trait sliders and customInstructions

## Personality Editing Workflow

The editing workflow should include:

1. **Create personality** (setup for editing tests)
2. **Access edit mode** via hover + edit button
3. **Form pre-population** with existing personality data
4. **Make changes** to name, customInstructions, and trait sliders
5. **Validation** during editing (required fields, ranges)
6. **Save/Cancel** workflows with unsaved changes handling
7. **Persistence verification** in UI and storage file

## Implementation Requirements

### 1. Create personalities-editing.spec.ts

Create file: `tests/desktop/features/settings/personalities/personalities-editing.spec.ts`

Following the exact pattern from roles-editing.spec.ts but adapted for personalities:

```typescript
import { expect, test } from "@playwright/test";
import { readFile } from "fs/promises";
import {
  createMockPersonalityData,
  openPersonalitiesSection,
  setupPersonalitiesTestSuite,
  waitForModalToClose,
  waitForPersonalityModal,
  waitForPersonalitiesList,
} from "../../../helpers";

test.describe("Feature: Personalities Section - Personality Editing", () => {
  const testSuite = setupPersonalitiesTestSuite();

  test("edits existing personality successfully", async () => {
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

    const originalData = createMockPersonalityData({
      name: "Original Personality Name",
    });
    await modal.locator('input[name="name"]').fill(originalData.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(originalData.customInstructions);

    // Set some distinctive trait values
    await modal
      .locator('input[name="bigFive.openness"]')
      .fill(originalData.bigFive.openness.toString());
    await modal
      .locator('input[name="behaviors.analytical"]')
      .fill(originalData.behaviors.analytical.toString());

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Save Personality" });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await waitForModalToClose(window);

    // Verify the personality appears in the UI
    await expect(window.locator(`text="${originalData.name}"`)).toBeVisible();

    // Find and hover over the personality to show action buttons
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${originalData.name}"`),
    });
    await personalityCard.hover();

    // Click edit button
    const editButton = personalityCard.locator(
      `button[aria-label="Edit ${originalData.name} personality"]`,
    );
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Wait for edit modal
    await waitForPersonalityModal(window, "edit");
    const editModal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Edit Personality")'),
    });

    // Make changes
    const updatedData = createMockPersonalityData({
      name: "Updated Personality Name",
    });
    await editModal.locator('input[name="name"]').clear();
    await editModal.locator('input[name="name"]').fill(updatedData.name);
    await editModal.locator('textarea[name="customInstructions"]').clear();
    await editModal
      .locator('textarea[name="customInstructions"]')
      .fill(updatedData.customInstructions);

    // Update some trait values
    await editModal.locator('input[name="bigFive.openness"]').fill("85");
    await editModal.locator('input[name="behaviors.creative"]').fill("90");

    // Wait for form to register as dirty
    await window.waitForTimeout(500);

    // Save changes
    const updateButton = editModal
      .locator("button")
      .filter({ hasText: "Update Personality" });
    await expect(updateButton).toBeEnabled();
    await updateButton.click();
    await waitForModalToClose(window);

    // Verify changes appear in UI immediately
    await expect(window.locator(`text="${updatedData.name}"`)).toBeVisible();
    await expect(
      window.locator(`text="${originalData.name}"`),
    ).not.toBeVisible();

    // Verify custom instructions change in personality card
    const updatedPersonalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${updatedData.name}"`),
    });
    await expect(
      updatedPersonalityCard.locator("p.text-muted-foreground"),
    ).toContainText(updatedData.customInstructions.substring(0, 50)); // May be truncated

    // Verify persistence with retry logic (due to flaky test environment)
    let persistenceVerified = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await window.waitForTimeout(200 * (attempt + 1)); // Progressive backoff
        const personalitiesContent = await readFile(
          personalitiesConfigPath,
          "utf-8",
        );
        const personalitiesData = JSON.parse(personalitiesContent);

        const updatedPersonality = personalitiesData.personalities.find(
          (p: { name: string }) => p.name === updatedData.name,
        );

        if (
          updatedPersonality &&
          updatedPersonality.customInstructions ===
            updatedData.customInstructions &&
          updatedPersonality.bigFive.openness === 85
        ) {
          persistenceVerified = true;
          break;
        }
      } catch {
        // Continue trying
      }
    }

    expect(persistenceVerified).toBe(true);
  });

  test("pre-populates form with existing personality data", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Create a personality with specific data
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();

    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    const testData = createMockPersonalityData({
      name: "Pre-populated Test Personality",
      customInstructions:
        "This is a test personality for verifying form pre-population with trait values.",
    });

    await modal.locator('input[name="name"]').fill(testData.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(testData.customInstructions);

    // Set specific trait values to verify pre-population
    await modal.locator('input[name="bigFive.openness"]').fill("75");
    await modal.locator('input[name="bigFive.conscientiousness"]').fill("60");
    await modal.locator('input[name="behaviors.analytical"]').fill("80");
    await modal.locator('input[name="behaviors.creative"]').fill("65");

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Save Personality" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Open edit modal
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${testData.name}"`),
    });
    await personalityCard.hover();

    const editButton = personalityCard.locator(
      `button[aria-label="Edit ${testData.name} personality"]`,
    );
    await editButton.click();

    await waitForPersonalityModal(window, "edit");
    const editModal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Edit Personality")'),
    });

    // Verify all fields are pre-populated
    await expect(editModal.locator('input[name="name"]')).toHaveValue(
      testData.name,
    );
    await expect(
      editModal.locator('textarea[name="customInstructions"]'),
    ).toHaveValue(testData.customInstructions);

    // Verify trait sliders are pre-populated
    await expect(
      editModal.locator('input[name="bigFive.openness"]'),
    ).toHaveValue("75");
    await expect(
      editModal.locator('input[name="bigFive.conscientiousness"]'),
    ).toHaveValue("60");
    await expect(
      editModal.locator('input[name="behaviors.analytical"]'),
    ).toHaveValue("80");
    await expect(
      editModal.locator('input[name="behaviors.creative"]'),
    ).toHaveValue("65");
  });

  test("validates fields during editing", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Create two personalities for duplicate name testing
    const firstPersonality = createMockPersonalityData({
      name: "First Personality",
    });
    const secondPersonality = createMockPersonalityData({
      name: "Second Personality",
    });

    // Create first personality
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();
    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });
    await modal.locator('input[name="name"]').fill(firstPersonality.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(firstPersonality.customInstructions);
    await modal
      .locator("button")
      .filter({ hasText: "Save Personality" })
      .click();
    await waitForModalToClose(window);

    // Create second personality
    await createButton.click();
    await waitForPersonalityModal(window);
    await modal.locator('input[name="name"]').fill(secondPersonality.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(secondPersonality.customInstructions);
    await modal
      .locator("button")
      .filter({ hasText: "Save Personality" })
      .click();
    await waitForModalToClose(window);

    // Edit second personality
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${secondPersonality.name}"`),
    });
    await personalityCard.hover();
    const editButton = personalityCard.locator(
      `button[aria-label="Edit ${secondPersonality.name} personality"]`,
    );
    await editButton.click();

    await waitForPersonalityModal(window, "edit");
    const editModal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Edit Personality")'),
    });

    const saveButton = editModal
      .locator("button")
      .filter({ hasText: /Save|Update/ });

    // Test clearing required fields
    await editModal.locator('input[name="name"]').clear();
    await expect(saveButton).toBeDisabled();

    await editModal.locator('input[name="name"]').fill("Valid Name");
    await editModal.locator('textarea[name="customInstructions"]').clear();
    await expect(saveButton).toBeDisabled();

    // Restore valid data
    await editModal
      .locator('textarea[name="customInstructions"]')
      .fill("Valid instructions");
    await expect(saveButton).toBeEnabled();

    // Test trait range validation (if implemented)
    const opennessSlider = editModal.locator('input[name="bigFive.openness"]');
    await opennessSlider.fill("150"); // Invalid: above 100
    const opennessValue = await opennessSlider.inputValue();
    expect(parseInt(opennessValue)).toBeLessThanOrEqual(100);
  });

  test("cancels edit without saving changes", async () => {
    const window = testSuite.getWindow();
    const personalitiesConfigPath = testSuite.getPersonalitiesConfigPath();

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

    const originalData = createMockPersonalityData({
      name: "Cancel Test Personality",
    });
    await modal.locator('input[name="name"]').fill(originalData.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(originalData.customInstructions);
    await modal
      .locator("button")
      .filter({ hasText: "Save Personality" })
      .click();
    await waitForModalToClose(window);

    // Open edit modal
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${originalData.name}"`),
    });
    await personalityCard.hover();
    const editButton = personalityCard.locator(
      `button[aria-label="Edit ${originalData.name} personality"]`,
    );
    await editButton.click();

    await waitForPersonalityModal(window, "edit");
    const editModal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Edit Personality")'),
    });

    // Make changes
    await editModal.locator('input[name="name"]').clear();
    await editModal.locator('input[name="name"]').fill("Changed Name");
    await editModal.locator('textarea[name="customInstructions"]').clear();
    await editModal
      .locator('textarea[name="customInstructions"]')
      .fill("Changed Instructions");
    await editModal.locator('input[name="bigFive.openness"]').fill("95");

    // Click cancel
    const cancelButton = editModal
      .locator("button")
      .filter({ hasText: "Cancel" });
    await cancelButton.click();

    // Handle unsaved changes confirmation if it appears
    const confirmDialog = window
      .locator('[role="dialog"], [role="alertdialog"]')
      .filter({
        has: window.locator('text="Unsaved Changes"'),
      });

    try {
      await expect(confirmDialog).toBeVisible({ timeout: 2000 });
      const closeWithoutSavingButton = confirmDialog.locator("button").filter({
        hasText: "Close Without Saving",
      });
      await closeWithoutSavingButton.click();
    } catch {
      // No confirmation dialog appeared, which is also valid
    }

    await expect(editModal).not.toBeVisible({ timeout: 5000 });

    // Verify original data unchanged in UI
    await expect(window.locator(`text="${originalData.name}"`)).toBeVisible();
    await expect(window.locator('text="Changed Name"')).not.toBeVisible();

    // Verify original custom instructions still show in personality card
    const originalPersonalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${originalData.name}"`),
    });
    await expect(
      originalPersonalityCard.locator("p.text-muted-foreground"),
    ).toContainText(originalData.customInstructions.substring(0, 50));

    // Verify persistence - original data should remain unchanged with retry logic
    let persistenceVerified = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await window.waitForTimeout(200 * (attempt + 1));
        const personalitiesContent = await readFile(
          personalitiesConfigPath,
          "utf-8",
        );
        const personalitiesData = JSON.parse(personalitiesContent);
        const personality = personalitiesData.personalities.find(
          (p: { name: string }) => p.name === originalData.name,
        );

        if (
          personality &&
          personality.customInstructions === originalData.customInstructions
        ) {
          persistenceVerified = true;
          break;
        }
      } catch {
        // Continue trying
      }
    }

    expect(persistenceVerified).toBe(true);
  });

  test("changes persist after save and reload", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Create initial personality
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();
    await waitForPersonalityModal(window);
    const modal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    const originalData = createMockPersonalityData({
      name: "Persistence Test Personality",
    });
    await modal.locator('input[name="name"]').fill(originalData.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(originalData.customInstructions);
    await modal
      .locator("button")
      .filter({ hasText: "Save Personality" })
      .click();
    await waitForModalToClose(window);

    // Edit the personality
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${originalData.name}"`),
    });
    await personalityCard.hover();
    const editButton = personalityCard.locator(
      `button[aria-label="Edit ${originalData.name} personality"]`,
    );
    await editButton.click();

    await waitForPersonalityModal(window, "edit");
    const editModal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Edit Personality")'),
    });

    const updatedData = createMockPersonalityData({
      name: "Persisted Updated Personality",
      customInstructions:
        "Updated instructions that should persist across reloads",
    });
    await editModal.locator('input[name="name"]').clear();
    await editModal.locator('input[name="name"]').fill(updatedData.name);
    await editModal.locator('textarea[name="customInstructions"]').clear();
    await editModal
      .locator('textarea[name="customInstructions"]')
      .fill(updatedData.customInstructions);

    const saveButton = editModal
      .locator("button")
      .filter({ hasText: /Save|Update/ });
    await saveButton.click();
    await waitForModalToClose(window);

    // Navigate away and back
    await window.evaluate(() => {
      window.testHelpers!.closeSettingsModal();
    });
    await window.waitForTimeout(500);

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Verify changes persisted
    await expect(window.locator(`text="${updatedData.name}"`)).toBeVisible();
    await expect(
      window.locator(`text="${originalData.name}"`),
    ).not.toBeVisible();

    const updatedPersonalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${updatedData.name}"`),
    });
    await expect(
      updatedPersonalityCard.locator("p.text-muted-foreground"),
    ).toContainText(updatedData.customInstructions.substring(0, 50));
  });

  test("edits both default and custom personalities", async () => {
    const window = testSuite.getWindow();

    await openPersonalitiesSection(window);
    await waitForPersonalitiesList(window);

    // Test editing a default personality (Creative Thinker is first alphabetically)
    const defaultPersonalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator('text="Analytical Strategist"'),
    });
    await defaultPersonalityCard.hover();

    const defaultEditButton = defaultPersonalityCard.locator(
      'button[aria-label="Edit Analytical Strategist personality"]',
    );
    await expect(defaultEditButton).toBeVisible();
    await defaultEditButton.click();

    await waitForPersonalityModal(window, "edit");
    const editModal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Edit Personality")'),
    });

    // Verify default personality data is pre-populated
    await expect(editModal.locator('input[name="name"]')).toHaveValue(
      "Analytical Strategist",
    );
    await expect(
      editModal.locator('textarea[name="customInstructions"]'),
    ).not.toHaveValue("");

    // Make a change to default personality
    await editModal.locator('textarea[name="customInstructions"]').clear();
    await editModal
      .locator('textarea[name="customInstructions"]')
      .fill("Modified analytical strategist instructions");

    const saveButton = editModal
      .locator("button")
      .filter({ hasText: /Save|Update/ });
    await saveButton.click();
    await waitForModalToClose(window);

    // Verify default personality was updated
    await expect(
      defaultPersonalityCard.locator("p.text-muted-foreground"),
    ).toContainText("Modified analytical strategist instructions");

    // Test that custom personalities work the same way
    const createButton = window
      .locator("button")
      .filter({ hasText: "Create Personality" });
    await createButton.click();
    await waitForPersonalityModal(window);
    const createModal = window.locator('[role="dialog"]').filter({
      has: window.locator('h2:has-text("Create Personality")'),
    });

    const customPersonality = createMockPersonalityData({
      name: "Custom Test Personality",
    });
    await createModal
      .locator('input[name="name"]')
      .fill(customPersonality.name);
    await createModal
      .locator('textarea[name="customInstructions"]')
      .fill(customPersonality.customInstructions);
    await createModal
      .locator("button")
      .filter({ hasText: "Save Personality" })
      .click();
    await waitForModalToClose(window);

    // Edit custom personality
    const customPersonalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${customPersonality.name}"`),
    });
    await customPersonalityCard.hover();
    const customEditButton = customPersonalityCard.locator(
      `button[aria-label="Edit ${customPersonality.name} personality"]`,
    );
    await customEditButton.click();

    await waitForPersonalityModal(window, "edit");

    // Verify same editing capabilities
    await expect(editModal.locator('input[name="name"]')).toHaveValue(
      customPersonality.name,
    );
    await expect(
      editModal.locator('textarea[name="customInstructions"]'),
    ).toHaveValue(customPersonality.customInstructions);
  });
});
```

## Acceptance Criteria

✅ **File Creation**: `personalities-editing.spec.ts` exists in correct directory
✅ **Edit Workflow**: Tests complete edit workflow from button click to save
✅ **Form Pre-population**: Tests all fields pre-populate with existing personality data
✅ **Field Validation**: Tests required field validation and trait range constraints
✅ **Cancel Workflow**: Tests cancel with unsaved changes confirmation
✅ **Persistence Verification**: Tests changes persist in UI and storage file
✅ **Navigation Persistence**: Tests changes persist across page navigation
✅ **Default Personality Editing**: Tests editing default personalities works correctly
✅ **Custom Personality Editing**: Tests editing custom personalities works correctly
✅ **Trait Slider Validation**: Tests trait value constraints and persistence

## Technical Details

### Form Field Adaptations from Roles

- `#role-name` → `input[name="name"]`
- `#role-description` → `textarea[name="customInstructions"]`
- `#role-system-prompt` → removed (no equivalent)
- Added: trait slider validation for bigFive and behaviors
- Added: trait value persistence verification

### Button Text Changes

- "Update Role" → "Update Personality"
- Modal title: "Edit Role" → "Edit Personality"
- Button labels: "Edit {name} role" → "Edit {name} personality"

### Validation Adaptations

- Required fields: name + customInstructions (vs name + description + systemPrompt)
- Trait range validation: 0-100 for all sliders
- Form dirty state detection for trait changes

### Data Structure Differences

- Personality storage file: personalities.json vs roles.json
- Field validation: customInstructions vs description + systemPrompt
- Trait values: bigFive + behaviors objects vs simple text fields

## Testing Requirements

### Unit Tests (included in this task)

Create validation tests that verify:

- Test file imports correctly
- Edit workflow functions properly
- Mock data integrates with personality structure

## Dependencies

- Requires: T-create-personalities-creation (creation tests)
- Requires: All helper functions, mock data generators, and infrastructure
- Enables: Personality deletion tests

## Notes

- Follow exact same test patterns as roles-editing.spec.ts
- Adapt all form interactions for personality-specific fields
- Maintain same persistence verification and retry logic
- Test both default and custom personality editing thoroughly

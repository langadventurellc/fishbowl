---
id: T-create-personalities-creation
title: Create Personalities Creation Tests
status: open
priority: medium
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-personalities-default
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T21:19:09.460Z
updated: 2025-08-17T21:19:09.460Z
---

# Create Personalities Creation Tests

## Context

Create end-to-end tests for personality creation functionality, following the exact pattern established in `tests/desktop/features/settings/roles/roles-creation.spec.ts`. These tests verify personality creation workflows, form validation, and data persistence.

## Reference Implementation

Base implementation directly on:

- `tests/desktop/features/settings/roles/roles-creation.spec.ts` - Primary pattern to follow
- Test structure, form interactions, validation testing, and modal handling
- Adapt for personality data structure with trait sliders and customInstructions

## Personality Form Structure

Based on personality data structure, the form should include:

- **Name**: Text input (required)
- **Custom Instructions**: Textarea (required, equivalent to role systemPrompt)
- **BigFive Traits**: 5 sliders (openness, conscientiousness, extraversion, agreeableness, neuroticism)
- **Behavior Traits**: 14 sliders (analytical, empathetic, decisive, curious, patient, humorous, formal, optimistic, cautious, creative, logical, supportive, direct, enthusiastic)

## Implementation Requirements

### 1. Create personalities-creation.spec.ts

Create file: `tests/desktop/features/settings/personalities/personalities-creation.spec.ts`

Following the exact pattern from roles-creation.spec.ts but adapted for personalities:

```typescript
import { expect, test } from "@playwright/test";
import {
  setupPersonalitiesTestSuite,
  openPersonalitiesSection,
  waitForPersonalitiesList,
  waitForPersonalityModal,
  waitForModalToClose,
  createMockPersonalityData,
  createMinimalPersonalityData,
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
    await modal.locator('input[name="name"]').fill(mockData.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(mockData.customInstructions);

    // Set BigFive trait sliders
    for (const [trait, value] of Object.entries(mockData.bigFive)) {
      const slider = modal.locator(`input[name="bigFive.${trait}"]`);
      await slider.fill(value.toString());
    }

    // Set behavior trait sliders
    for (const [trait, value] of Object.entries(mockData.behaviors)) {
      const slider = modal.locator(`input[name="behaviors.${trait}"]`);
      await slider.fill(value.toString());
    }

    // Submit form
    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Save Personality" });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Verify modal closes and personality appears
    await waitForModalToClose(window);
    await expect(window.locator(`text=${mockData.name}`)).toBeVisible();
  });

  test("validates required fields and shows errors", async () => {
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
      .filter({ hasText: "Save Personality" });
    await expect(saveButton).toBeDisabled();

    // Fill only name - button still disabled (requires custom instructions)
    await modal.locator('input[name="name"]').fill("Test Personality");
    await expect(saveButton).toBeDisabled();

    // Add custom instructions - button now enabled (traits have defaults)
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill("Test personality instructions");
    await expect(saveButton).toBeEnabled();

    // Clear name and try to save - should show error
    await modal.locator('input[name="name"]').clear();
    await expect(saveButton).toBeDisabled();
  });

  test("validates trait score ranges", async () => {
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

    // Fill required fields
    await modal.locator('input[name="name"]').fill("Trait Test Personality");
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill("Test instructions");

    // Test invalid trait values (should be constrained to 0-100)
    const opennessSlider = modal.locator('input[name="bigFive.openness"]');

    // Try to set value above 100 - should be constrained
    await opennessSlider.fill("150");
    const opennessValue = await opennessSlider.inputValue();
    expect(parseInt(opennessValue)).toBeLessThanOrEqual(100);

    // Try to set value below 0 - should be constrained
    await opennessSlider.fill("-10");
    const opennessValueLow = await opennessSlider.inputValue();
    expect(parseInt(opennessValueLow)).toBeGreaterThanOrEqual(0);
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
    await modal.locator('input[name="name"]').fill(mockData.name);
    await modal
      .locator('textarea[name="customInstructions"]')
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
    await waitForModalToClose(window);
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
    await modal.locator('input[name="name"]').fill(mockData.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(mockData.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Save Personality" });
    await saveButton.click();
    await waitForModalToClose(window);

    // Verify personality count increased
    const finalPersonalityCount = await window
      .locator('[role="listitem"]')
      .count();
    expect(finalPersonalityCount).toBe(initialPersonalityCount + 1);

    // Verify personality appears in list with correct name and custom instructions
    const personalityCard = window.locator('[role="listitem"]').filter({
      has: window.locator(`text="${mockData.name}"`),
    });

    await expect(personalityCard).toBeVisible();
    await expect(
      personalityCard.locator("p.text-muted-foreground"),
    ).toContainText(
      mockData.customInstructions.substring(0, 50), // May be truncated in display
    );
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
    await modal.locator('input[name="name"]').fill(mockData.name);
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill(mockData.customInstructions);

    const saveButton = modal
      .locator("button")
      .filter({ hasText: "Save Personality" });
    await saveButton.click();
    await waitForModalToClose(window);

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
    await modal.locator('input[name="name"]').fill("Test Name");
    await modal
      .locator('textarea[name="customInstructions"]')
      .fill("Test Instructions");

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
    await expect(modal.locator('input[name="name"]')).toHaveValue("");
    await expect(
      modal.locator('textarea[name="customInstructions"]'),
    ).toHaveValue("");

    // Verify trait sliders are reset to defaults (50)
    await expect(modal.locator('input[name="bigFive.openness"]')).toHaveValue(
      "50",
    );
    await expect(
      modal.locator('input[name="behaviors.analytical"]'),
    ).toHaveValue("50");
  });

  test("handles trait slider interactions", async () => {
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

    // Test bigFive trait slider
    const opennessSlider = modal.locator('input[name="bigFive.openness"]');
    await opennessSlider.fill("75");
    await expect(opennessSlider).toHaveValue("75");

    // Test behavior trait slider
    const analyticalSlider = modal.locator(
      'input[name="behaviors.analytical"]',
    );
    await analyticalSlider.fill("90");
    await expect(analyticalSlider).toHaveValue("90");

    // Verify sliders maintain values while filling other fields
    await modal.locator('input[name="name"]').fill("Slider Test Personality");
    await expect(opennessSlider).toHaveValue("75");
    await expect(analyticalSlider).toHaveValue("90");
  });
});
```

## Acceptance Criteria

✅ **File Creation**: `personalities-creation.spec.ts` exists in correct directory
✅ **Form Validation**: Tests required fields (name, customInstructions) and button states
✅ **Trait Validation**: Tests trait slider constraints (0-100 range)
✅ **Modal Handling**: Tests modal open/close, escape key, cancel workflows
✅ **Data Persistence**: Tests personality creation persists in list and after reload
✅ **Form Reset**: Tests form resets when reopening modal after cancel
✅ **Slider Interactions**: Tests trait slider functionality and value persistence
✅ **Error Handling**: Tests validation states and error conditions
✅ **Cancel Workflow**: Tests unsaved changes dialog and cancel behavior

## Technical Details

### Form Field Adaptations from Roles

- `#role-name` → `input[name="name"]`
- `#role-description` → `textarea[name="customInstructions"]`
- `#role-system-prompt` → removed (no equivalent)
- Added: `input[name="bigFive.{trait}"]` selectors for 5 traits
- Added: `input[name="behaviors.{trait}"]` selectors for 14 traits

### Button Text Changes

- "Create Role" → "Create Personality"
- "Save Role" → "Save Personality"
- Modal title: "Create Role" → "Create Personality"

### Validation Logic Adaptations

- Required fields: name + customInstructions (vs name + description + systemPrompt)
- Trait range validation: 0-100 for all sliders
- Default trait values: 50 (neutral)

### Data Structure Differences

- Uses `createMockPersonalityData()` instead of `createMockRoleData()`
- Tests trait sliders instead of text fields for description/systemPrompt
- Verifies customInstructions display instead of description

## Testing Requirements

### Unit Tests (included in this task)

Create validation tests that verify:

- Test file imports correctly
- Mock data generators work with personality structure
- Form validation logic matches personality requirements

## Dependencies

- Requires: T-create-personalities-default (default loading tests)
- Requires: Mock data generators, helper functions, and infrastructure
- Enables: Personality editing and deletion tests

## Notes

- Follow exact same test patterns as roles-creation.spec.ts
- Adapt all form interactions for personality-specific fields
- Maintain same modal handling and validation patterns
- Test trait slider functionality thoroughly

---
id: T-create-personalities-test-1
title: Create Personalities Test Helper Functions
status: done
priority: high
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-personalities-test
affectedFiles:
  tests/desktop/helpers/settings/openPersonalitiesSection.ts: Created navigation
    helper that opens settings modal and navigates to personalities section,
    following exact pattern from openRolesSection.ts but adapted for
    personalities tab
  tests/desktop/helpers/settings/waitForPersonalitiesList.ts:
    Created list waiting
    helpers including waitForPersonalitiesList, waitForPersonalitiesEmptyState,
    and waitForPersonality functions for managing different list states and
    specific personality detection
  tests/desktop/helpers/settings/waitForPersonalityModal.ts: Created modal
    interaction helpers including waitForPersonalityModal, waitForDeleteDialog,
    and waitForModalToClose for handling personality creation/editing and
    deletion workflows
  tests/desktop/helpers/index.ts: Updated to export all new personality helper
    functions with proper naming to avoid conflicts with existing roles helpers
log:
  - Successfully implemented personalities test helper functions following the
    exact patterns from roles helpers. Created openPersonalitiesSection.ts for
    navigation, waitForPersonalitiesList.ts for list state management with
    support for populated lists, empty states, and waiting for specific
    personalities, and waitForPersonalityModal.ts for modal interactions
    including create/edit modals and delete confirmations. All functions include
    proper error handling, debug logging, and consistent timeout values. Updated
    test helpers index to export all new functions with appropriate naming to
    avoid conflicts. All quality checks pass and TypeScript compilation
    succeeded.
schema: v1.0
childrenIds: []
created: 2025-08-17T21:15:31.271Z
updated: 2025-08-17T21:15:31.271Z
---

# Create Personalities Test Helper Functions

## Context

Create reusable helper functions for personalities end-to-end tests, following the exact patterns established for roles tests. These helpers handle navigation, waiting for UI states, and modal interactions.

## Reference Implementations

Base implementations directly on these roles helpers:

- `tests/desktop/helpers/settings/openRolesSection.ts` - Navigation pattern
- `tests/desktop/helpers/settings/waitForRolesList.ts` - Wait and state management
- `tests/desktop/helpers/settings/waitForRoleModal.ts` - Modal interactions

## Implementation Requirements

### 1. Create openPersonalitiesSection.ts

Create file: `tests/desktop/helpers/settings/openPersonalitiesSection.ts`

Following the exact pattern from openRolesSection.ts but adapted for personalities:

```typescript
import { expect } from "@playwright/test";
import { TestWindow } from "../TestWindow";

export async function openPersonalitiesSection(window: TestWindow) {
  // Ensure no modals are open before starting
  try {
    await window.evaluate(() => {
      if (window.testHelpers?.isSettingsModalOpen()) {
        window.testHelpers!.closeSettingsModal();
      }
    });

    // Wait for any existing modal to close
    await expect(
      window.locator('[data-testid="settings-modal"]'),
    ).not.toBeVisible({ timeout: 2000 });

    // Wait for any dialog overlays to disappear
    await expect(
      window.locator('[data-slot="dialog-overlay"]'),
    ).not.toBeVisible({ timeout: 2000 });

    // Small additional delay for any remaining animations
    await window.waitForTimeout(200);
  } catch {
    // No modal was open, continue
  }

  // Open settings modal
  await window.evaluate(() => {
    window.testHelpers!.openSettingsModal();
  });

  // Wait for settings modal to be fully visible and stable
  await expect(window.locator('[data-testid="settings-modal"]')).toBeVisible();

  // Wait a bit for modal animations to settle
  await window.waitForTimeout(300);

  // Navigate to Personalities tab - wait for it to be clickable
  const personalitiesNavItem = window
    .locator("button")
    .filter({ hasText: "Personalities" });

  await expect(personalitiesNavItem).toBeVisible();
  await expect(personalitiesNavItem).toBeEnabled();
  await personalitiesNavItem.click();

  // Wait for personalities section to be visible
  await expect(
    window.locator("h1").filter({ hasText: "Personalities" }),
  ).toBeVisible();

  // Ensure the personalities section container is visible
  await expect(window.locator(".personalities-section")).toBeVisible();
}
```

### 2. Create waitForPersonalitiesList.ts

Create file: `tests/desktop/helpers/settings/waitForPersonalitiesList.ts`

Following the exact pattern from waitForRolesList.ts but adapted for personalities:

```typescript
import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

/**
 * Wait for the personalities list to be visible and loaded.
 * Handles both populated list and loading states.
 */
export const waitForPersonalitiesList = async (window: TestWindow) => {
  // First, wait for any loading spinner to disappear
  try {
    const loadingSpinner = window.locator(".animate-spin");
    if (await loadingSpinner.isVisible({ timeout: 500 })) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    }
  } catch {
    // No loading spinner present, continue
  }

  // Check if we have a populated list or empty state
  const personalitiesList = window.locator('[role="list"]');
  const emptyState = window.locator("text=No personalities configured");

  try {
    // Try to find the personalities list first (most common case with 5 default personalities)
    await expect(personalitiesList).toBeVisible({ timeout: 2000 });

    // Verify at least one personality item is present (should have 5 defaults)
    const personalityItems = window.locator('[role="listitem"]');
    await expect(personalityItems.first()).toBeVisible({ timeout: 3000 });

    // Debug: Log the number of personalities found
    const personalityCount = await personalityItems.count();
    if (personalityCount === 0) {
      console.log(
        "Warning: Personalities list is visible but contains no items",
      );
    }
  } catch {
    // If no list found, check for empty state
    try {
      await expect(emptyState).toBeVisible({ timeout: 2000 });
    } catch {
      // Neither list nor empty state found - debug output
      console.log(
        "Neither personalities list nor empty state found. Page content:",
      );
      const personalitiesSection = await window
        .locator(".personalities-section")
        .textContent();
      console.log(personalitiesSection);

      // Re-throw with better error message
      throw new Error(
        "Failed to find personalities list or empty state. The personalities section may not have loaded properly.",
      );
    }
  }
};

/**
 * Wait specifically for the empty state (no personalities).
 * Useful for testing after clearing all personalities.
 */
export const waitForPersonalitiesEmptyState = async (window: TestWindow) => {
  // Wait for loading to complete first
  try {
    const loadingSpinner = window.locator(".animate-spin");
    if (await loadingSpinner.isVisible({ timeout: 500 })) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    }
  } catch {
    // No loading spinner, continue
  }

  // Wait for the empty state message
  await expect(window.locator("text=No personalities configured")).toBeVisible({
    timeout: 5000,
  });

  // Verify the "Create First Personality" button is present
  await expect(
    window.locator("button").filter({ hasText: "Create First Personality" }),
  ).toBeVisible();
};

/**
 * Wait for a specific personality to appear in the list by name.
 * Useful for verifying personality creation or updates.
 */
export const waitForPersonality = async (
  window: TestWindow,
  personalityName: string,
) => {
  // First ensure the list is loaded
  await waitForPersonalitiesList(window);

  // Find the specific personality by name
  const personalityCard = window.locator('[role="listitem"]').filter({
    has: window.locator("text=" + personalityName),
  });

  await expect(personalityCard).toBeVisible({ timeout: 5000 });
};
```

### 3. Create waitForPersonalityModal.ts

Create file: `tests/desktop/helpers/settings/waitForPersonalityModal.ts`

Following the pattern from waitForRoleModal.ts but adapted for personalities:

```typescript
import { expect } from "@playwright/test";
import type { TestWindow } from "../TestWindow";

/**
 * Wait for the personality modal (create/edit) to be visible and ready for interaction.
 */
export const waitForPersonalityModal = async (window: TestWindow) => {
  // Wait for modal to be present in DOM
  const modal = window.locator('[data-testid="personality-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  // Wait for modal content to be stable
  await window.waitForTimeout(300);

  // Verify essential form elements are present
  await expect(window.locator('input[name="name"]')).toBeVisible();
  await expect(
    window.locator('textarea[name="customInstructions"]'),
  ).toBeVisible();

  // Verify save button is present
  await expect(
    window.locator("button").filter({ hasText: "Save" }),
  ).toBeVisible();
};

/**
 * Wait for the delete confirmation dialog to be visible.
 */
export const waitForDeleteDialog = async (window: TestWindow) => {
  // Wait for the delete confirmation dialog
  const deleteDialog = window.locator('[role="dialog"]').filter({
    has: window.locator("text=Delete Personality"),
  });

  await expect(deleteDialog).toBeVisible({ timeout: 3000 });

  // Verify delete confirmation button is present
  await expect(
    window.locator("button").filter({ hasText: "Delete" }),
  ).toBeVisible();
};

/**
 * Wait for any modal to close completely.
 */
export const waitForModalToClose = async (window: TestWindow) => {
  // Wait for personality modal to disappear
  try {
    await expect(
      window.locator('[data-testid="personality-modal"]'),
    ).not.toBeVisible({ timeout: 3000 });
  } catch {
    // Modal wasn't open, continue
  }

  // Wait for delete dialog to disappear
  try {
    await expect(
      window.locator('[role="dialog"]').filter({
        has: window.locator("text=Delete Personality"),
      }),
    ).not.toBeVisible({ timeout: 3000 });
  } catch {
    // Dialog wasn't open, continue
  }

  // Wait for any overlay to disappear
  try {
    await expect(
      window.locator('[data-slot="dialog-overlay"]'),
    ).not.toBeVisible({ timeout: 2000 });
  } catch {
    // No overlay present, continue
  }
};
```

### 4. Update Test Helpers Index

Update `tests/desktop/helpers/index.ts` to export the new helper functions:

Add these exports following the pattern of existing exports:

```typescript
export { openPersonalitiesSection } from "./settings/openPersonalitiesSection";
export { setupPersonalitiesTestSuite } from "./settings/setupPersonalitiesTestSuite";
export {
  waitForPersonalitiesList,
  waitForPersonalitiesEmptyState,
  waitForPersonality,
} from "./settings/waitForPersonalitiesList";
export {
  waitForPersonalityModal,
  waitForDeleteDialog,
  waitForModalToClose,
} from "./settings/waitForPersonalityModal";
```

## Acceptance Criteria

✅ **Navigation Helper**: `openPersonalitiesSection.ts` handles modal opening and tab navigation
✅ **List Waiting**: `waitForPersonalitiesList.ts` handles loading states and list detection
✅ **Empty State**: Functions for waiting for empty state and specific personalities
✅ **Modal Helpers**: `waitForPersonalityModal.ts` handles modal interactions and confirmations
✅ **Export Integration**: All functions exported from helpers index.ts
✅ **Error Handling**: Graceful handling of missing elements and timeouts
✅ **Debug Logging**: Console output for troubleshooting test failures
✅ **Consistent Patterns**: Exact same structure as roles helpers but personality-specific

## Technical Details

### CSS Selectors to Adapt

- `.roles-section` → `.personalities-section`
- `"Roles"` → `"Personalities"`
- `text=No roles configured` → `text=No personalities configured`
- `"Create First Role"` → `"Create First Personality"`
- `[data-testid="role-modal"]` → `[data-testid="personality-modal"]`

### Timeout Values

Follow exact same timeout patterns from roles helpers:

- Modal visibility: 5000ms
- List loading: 10000ms
- Animation settling: 200-300ms
- Element visibility: 2000-3000ms

## Testing Requirements

### Unit Tests (included in this task)

Create basic validation tests that verify:

- Helper functions can be imported without errors
- TypeScript types are correctly defined
- Functions return expected types

### Integration Testing

These helpers will be tested through actual e2e test implementation in subsequent tasks.

## Dependencies

- Requires: T-create-personalities-test (infrastructure setup)
- Enables: All subsequent personality test implementation tasks

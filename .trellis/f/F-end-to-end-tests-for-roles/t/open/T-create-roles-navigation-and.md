---
id: T-create-roles-navigation-and
title: Create roles navigation and wait helpers
status: open
priority: high
parent: F-end-to-end-tests-for-roles
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-13T18:17:18.766Z
updated: 2025-08-13T18:17:18.766Z
---

# Create Roles Navigation and Wait Helpers

Implement navigation and wait utility functions for roles end-to-end tests to handle UI interactions and state transitions.

## Context

- Feature: End-to-End Tests for Roles Section (`F-end-to-end-tests-for-roles`)
- Reference: `tests/desktop/helpers/openLlmSetupSection.ts` and LLM wait helpers for patterns
- Location: Create files in `tests/desktop/features/settings/roles/`
- UI Components: `apps/desktop/src/components/settings/roles/RolesSection.tsx`

## Implementation Requirements

### Create `openRolesSection.ts`

Following the LLM pattern, implement navigation to roles section:

**Core Function:**

- `openRolesSection(window: TestWindow)` - Navigate to roles section
- Open settings modal if not already open
- Navigate to roles tab within settings
- Wait for roles section to be visible and loaded

**Navigation Steps:**

1. Check if settings modal is already open
2. Open settings modal if needed (likely via test helpers)
3. Click/navigate to "Roles" section
4. Wait for roles section to be visible
5. Ensure loading states are completed

### Create `waitForRolesList.ts`

Implement waiting utilities for roles list states:

**Core Functions:**

- `waitForRolesList(window: TestWindow)` - Wait for roles list to appear
- Handle both empty state and populated list scenarios
- Wait for loading spinners to complete
- Verify proper DOM structure is rendered

**State Handling:**

- Default roles loaded state (4 roles visible)
- Custom roles added state
- Empty state if no roles exist (unlikely with defaults)
- Loading state transitions

### Additional Wait Utilities

Consider additional helpers based on UI patterns:

- `waitForRoleModal(window: TestWindow)` - Wait for role creation/edit modal
- `waitForDeleteDialog(window: TestWindow)` - Wait for delete confirmation
- `waitForEmptyState(window: TestWindow)` - Wait for empty state (if applicable)

## Technical Details

### Expected Implementation Structure

```typescript
// openRolesSection.ts
import type { TestWindow } from "../../../helpers/TestWindow";

export const openRolesSection = async (window: TestWindow) => {
  // Check if settings modal is open
  const settingsModal = window.locator('[data-testid="settings-modal"]');

  if (!(await settingsModal.isVisible())) {
    // Open settings modal (using existing helpers)
    await window.evaluate(() => {
      if (window.testHelpers?.openSettingsModal) {
        window.testHelpers.openSettingsModal();
      }
    });
  }

  // Navigate to roles section
  const rolesTab = window.locator('[data-testid*="roles"]');
  await rolesTab.click();

  // Wait for roles section to be visible
  const rolesSection = window.locator(".roles-section");
  await rolesSection.waitFor({ state: "visible" });
};
```

### UI Investigation Required

- Study `RolesSection.tsx` for proper selectors and data-testid attributes
- Understand roles list rendering and loading states
- Identify modal and dialog selectors
- Check integration with settings navigation

### Integration Points

- Used by all roles test suites
- Compatible with setupRolesTestSuite patterns
- Works with existing settings modal helpers
- Handles roles-specific UI elements

## Acceptance Criteria

- [ ] `openRolesSection.ts` created with robust navigation logic
- [ ] `waitForRolesList.ts` created with proper state waiting
- [ ] Navigation works from any starting app state
- [ ] Proper error handling for missing UI elements
- [ ] Reliable waiting for async loading states
- [ ] Compatible with roles section UI structure
- [ ] TypeScript types properly defined
- [ ] Integrates with existing test helper patterns
- [ ] Handles both default and custom roles scenarios
- [ ] Works reliably without flakiness

## Dependencies

- Can be developed in parallel with infrastructure setup
- May need investigation of roles UI implementation
- Used by all test suite implementation tasks

## Files to Create

- `tests/desktop/features/settings/roles/openRolesSection.ts`
- `tests/desktop/features/settings/roles/waitForRolesList.ts`

## Research Required

- Study `RolesSection.tsx` component structure and selectors
- Understand roles list rendering patterns
- Check settings modal navigation implementation
- Identify proper data-testid attributes for reliable selection

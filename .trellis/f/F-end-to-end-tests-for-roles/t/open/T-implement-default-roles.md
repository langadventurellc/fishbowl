---
id: T-implement-default-roles
title: Implement default roles loading tests
status: open
priority: medium
parent: F-end-to-end-tests-for-roles
prerequisites:
  - T-create-roles-test-barrel
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-13T18:18:47.326Z
updated: 2025-08-13T18:18:47.326Z
---

# Implement Default Roles Loading Tests

Create end-to-end tests to verify that the 4 default roles load correctly from `defaultRoles.json` when the application starts.

## Context

- Feature: End-to-End Tests for Roles Section (`F-end-to-end-tests-for-roles`)
- Reference: `tests/desktop/features/settings/llm-setup/empty-state-interaction.spec.ts` for similar patterns
- Location: Create file at `tests/desktop/features/settings/roles/roles-default-loading.spec.ts`
- Default roles: Project Manager, Code Reviewer, Creative Writer, Data Analyst

## Implementation Requirements

### Create `roles-default-loading.spec.ts`

Following LLM test patterns, implement comprehensive tests for default roles:

**Test Suite Structure:**

```typescript
import { expect, test } from "@playwright/test";
import {
  setupRolesTestSuite,
  openRolesSection,
  waitForRolesList,
} from "./index";

test.describe("Feature: Roles Section - Default Roles Loading", () => {
  const testSuite = setupRolesTestSuite();

  test("loads 4 default roles on first visit", async () => {
    // Test implementation
  });

  test("displays correct role names and descriptions", async () => {
    // Test implementation
  });

  test("shows populated state instead of empty state", async () => {
    // Test implementation
  });
});
```

### Core Test Cases

#### Test 1: Default Roles Count and Visibility

- Navigate to roles section
- Verify exactly 4 roles are displayed
- Confirm roles list is visible (not empty state)
- Check that roles are properly rendered as cards/items

#### Test 2: Default Role Content Verification

- Verify specific role names are present:
  - "Project Manager"
  - "Code Reviewer"
  - "Creative Writer"
  - "Data Analyst"
- Check that each role has a description
- Verify system prompts are present (may be truncated in UI)

#### Test 3: UI State Verification

- Confirm empty state message is NOT shown
- Verify "Create Role" button is visible at bottom of list
- Check that roles are displayed in some consistent order
- Ensure loading states have completed

#### Test 4: Role Card Structure

- Verify each role card/item has proper structure
- Check for edit and delete buttons on each role
- Confirm role metadata is displayed correctly
- Test that role cards are interactive/clickable

## Technical Details

### Expected Implementation Pattern

```typescript
test("loads 4 default roles on first visit", async () => {
  const window = testSuite.getWindow();

  await openRolesSection(window);
  await waitForRolesList(window);

  // Verify 4 roles are displayed
  const roleCards = window.locator('[role="article"]');
  await expect(roleCards).toHaveCount(4);

  // Verify specific default roles exist
  await expect(window.locator("text=Project Manager")).toBeVisible();
  await expect(window.locator("text=Code Reviewer")).toBeVisible();
  await expect(window.locator("text=Creative Writer")).toBeVisible();
  await expect(window.locator("text=Data Analyst")).toBeVisible();
});
```

### UI Selectors Investigation

- Study `RolesSection.tsx` and `RolesList.tsx` for proper selectors
- Identify role card structure and data-testid attributes
- Understand how empty state vs populated state is rendered
- Find proper selectors for role names, descriptions, buttons

### Data Verification

- Confirm default roles match exactly what's in `defaultRoles.json`
- Verify that default roles are read-only or editable as designed
- Test that default roles persist across app restarts
- Check role ordering/sorting behavior

## Acceptance Criteria

- [ ] Test file `roles-default-loading.spec.ts` created with proper structure
- [ ] Test verifies exactly 4 default roles load
- [ ] Each default role name is verified to be present
- [ ] Role descriptions/content are validated
- [ ] Empty state is confirmed NOT to appear with defaults
- [ ] UI structure and interactivity verified
- [ ] Tests run reliably without flakiness
- [ ] Proper use of test infrastructure and utilities
- [ ] Clear test descriptions and good error messages
- [ ] TypeScript compilation with no errors

## Dependencies

- **Must wait for**: All infrastructure tasks
  - Test suite setup (`T-create-roles-test-suite`)
  - Navigation helpers (`T-create-roles-navigation-and`)
  - Barrel exports (`T-create-roles-test-barrel`)
- Can run in parallel with other test suite implementations

## Files to Create

- `tests/desktop/features/settings/roles/roles-default-loading.spec.ts`

## Research Required

- Study roles UI components for proper selectors
- Verify default roles loading behavior in actual app
- Understand role card/item structure
- Check if default roles have any special indicators

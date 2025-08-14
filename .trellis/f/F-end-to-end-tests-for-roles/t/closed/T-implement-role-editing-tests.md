---
id: T-implement-role-editing-tests
title: Implement role editing tests
status: done
priority: medium
parent: F-end-to-end-tests-for-roles
prerequisites:
  - T-create-roles-test-barrel
affectedFiles:
  tests/desktop/features/settings/roles/roles-editing.spec.ts:
    Created comprehensive role editing test suite with 6 test cases covering
    successful editing, form pre-population, validation, cancel functionality,
    persistence testing, and default vs custom role editing capabilities
log:
  - >-
    Successfully implemented comprehensive end-to-end tests for role editing
    functionality in the desktop application. The test suite covers all core
    editing scenarios including successful role editing workflow, form
    pre-population verification, field validation during editing, cancel
    functionality without saving changes, data persistence across navigation,
    and editing capabilities for both default and custom roles.


    Key features implemented:

    - Complete role editing workflow test with UI and persistence verification

    - Form pre-population test ensuring existing role data loads correctly

    - Comprehensive validation testing for required fields and duplicate name
    prevention

    - Cancel functionality test with optional unsaved changes confirmation
    handling

    - Persistence testing across navigation and page reloads

    - Verification that both default roles (like Project Manager) and custom
    roles have the same editing capabilities


    All tests follow established patterns from LLM setup editing tests and use
    the existing test infrastructure including setupRolesTestSuite, role
    navigation helpers, and mock data generators. Tests are reliable,
    maintainable, and include proper error handling for modal interactions.
schema: v1.0
childrenIds: []
created: 2025-08-13T18:19:43.220Z
updated: 2025-08-13T18:19:43.220Z
---

# Implement Role Editing Tests

Create end-to-end tests to verify role editing functionality including form pre-population, change detection, validation, and data persistence.

## Context

- Feature: End-to-End Tests for Roles Section (`F-end-to-end-tests-for-roles`)
- Reference: `tests/desktop/features/settings/llm-setup/edit-configuration.spec.ts` for comprehensive editing patterns
- Location: Create file at `tests/desktop/features/settings/roles/roles-editing.spec.ts`
- Helper Functions: Located in `tests/desktop/helpers/settings/`
- UI Components: Role edit modal, form pre-population, change validation, save/cancel behavior

## Implementation Requirements

### Create `roles-editing.spec.ts`

Following LLM edit test patterns, implement comprehensive role editing tests:

**Test Suite Structure:**

```typescript
import { expect, test } from "@playwright/test";
import {
  setupRolesTestSuite,
  openRolesSection,
  waitForRolesList,
  createMockRoleData,
} from "../../../helpers";

test.describe("Feature: Roles Section - Role Editing", () => {
  const testSuite = setupRolesTestSuite();

  test("edits existing role successfully", async () => {
    // Test implementation
  });

  test("pre-populates form with existing role data", async () => {
    // Test implementation
  });

  test("validates fields during editing", async () => {
    // Test implementation
  });

  test("prevents duplicate names during edit", async () => {
    // Test implementation
  });

  test("cancels edit without saving changes", async () => {
    // Test implementation
  });

  test("changes persist after save and reload", async () => {
    // Test implementation
  });
});
```

### Core Test Cases

#### Test 1: Successful Role Editing

- Create a test role first
- Click edit button on the role
- Modify role fields (name, description, system prompt)
- Save changes and verify success
- Check that updated data appears in role list

#### Test 2: Form Pre-population

- Create a role with specific data
- Open edit modal for the role
- Verify all form fields are pre-populated with correct existing data
- Test that pre-populated data matches what was saved

#### Test 3: Edit Validation

- Open edit modal for existing role
- Test clearing required fields shows validation errors
- Test duplicate name validation (against other existing roles)
- Verify save button state changes with validation
- Test that validation errors can be corrected

#### Test 4: Change Detection and Persistence

- Edit a role with specific changes
- Verify changes are reflected immediately after save
- Navigate away and back to verify persistence
- Test that timestamps are updated appropriately
- Reload page and confirm changes persist

#### Test 5: Cancel Functionality

- Open edit modal and make changes
- Click cancel button
- Verify changes are NOT saved
- Check that original role data remains unchanged
- Test that modal closes without saving

#### Test 6: Edit Default vs Custom Roles

- Test editing behavior with default roles (if editable)
- Test editing custom/user-created roles
- Verify any differences in editing capabilities
- Check for any special handling of default roles

## Technical Details

### Expected Implementation Pattern

```typescript
test("edits existing role successfully", async () => {
  const window = testSuite.getWindow();

  await openRolesSection(window);
  await waitForRolesList(window);

  // Create a test role first
  const originalData = createMockRoleData({ name: "Original Role" });
  // ... create role logic ...

  // Click edit button on the role
  const roleCard = window.locator(
    `[role="article"]:has-text("${originalData.name}")`,
  );
  const editButton = roleCard.locator('[aria-label*="Edit"]');
  await editButton.click();

  // Wait for edit modal
  const modal = window.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  // Verify pre-population
  const nameInput = modal.locator('[name="name"]');
  await expect(nameInput).toHaveValue(originalData.name);

  // Make changes
  const updatedData = createMockRoleData({ name: "Updated Role" });
  await nameInput.clear();
  await nameInput.fill(updatedData.name);

  // Save changes
  const saveButton = modal.locator("button").filter({ hasText: /Save|Update/ });
  await saveButton.click();

  // Verify changes
  await expect(modal).not.toBeVisible();
  await expect(window.locator(`text=${updatedData.name}`)).toBeVisible();
  await expect(window.locator(`text=${originalData.name}`)).not.toBeVisible();
});
```

### Edit Modal Investigation

- Study role edit modal structure and field handling
- Understand how existing data is loaded into forms
- Check edit vs create modal differences
- Identify proper selectors for edit buttons and save states

### Change Detection Testing

- Verify change detection logic works properly
- Test that unchanged forms can still be saved
- Check for any optimistic updates during editing
- Test error recovery and retry behavior

## Acceptance Criteria

- [ ] Test file `roles-editing.spec.ts` created with comprehensive edit testing
- [ ] Form pre-population with existing data verified
- [ ] Edit validation thoroughly tested
- [ ] Change persistence across navigation tested
- [ ] Cancel functionality verified to not save changes
- [ ] Both default and custom role editing tested (as applicable)
- [ ] Proper error handling and user feedback tested
- [ ] Change detection and timestamp updates verified
- [ ] Tests use infrastructure utilities appropriately
- [ ] Tests run reliably without flakiness

## Dependencies

- **Must wait for**: All infrastructure tasks including barrel exports
- Can run in parallel with other test suite implementations
- May benefit from role creation tests being completed first for reference patterns

## Files to Create

- `tests/desktop/features/settings/roles/roles-editing.spec.ts`

## Research Required

- Study role editing modal UI and form behavior
- Understand how existing role data is loaded and displayed
- Check edit button location and selectors on role cards
- Verify change detection and persistence mechanisms
- Understand any differences between editing default vs custom roles

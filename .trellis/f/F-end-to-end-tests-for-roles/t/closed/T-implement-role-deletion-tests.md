---
id: T-implement-role-deletion-tests
title: Implement role deletion tests
status: done
priority: medium
parent: F-end-to-end-tests-for-roles
prerequisites:
  - T-create-roles-test-barrel
affectedFiles:
  tests/desktop/features/settings/roles/roles-deletion.spec.ts:
    Created comprehensive end-to-end test suite for role deletion functionality
    including confirmation dialogs, cancel flows, multiple deletions, default
    role deletion, empty state transitions, and persistence across navigation.
    Follows established patterns from LLM deletion tests.
log:
  - Implemented comprehensive role deletion tests with confirmation dialogs,
    cancel flows, multiple deletion scenarios, default roles deletion, empty
    state transitions, and persistence verification. Created
    roles-deletion.spec.ts with 8 test cases covering all requirements from the
    task specification. All code passes lint and type checks.
schema: v1.0
childrenIds: []
created: 2025-08-13T18:20:10.193Z
updated: 2025-08-13T18:20:10.193Z
---

# Implement Role Deletion Tests

Create end-to-end tests to verify role deletion functionality including confirmation dialogs, deletion restrictions, and proper cleanup.

## Context

- Feature: End-to-End Tests for Roles Section (`F-end-to-end-tests-for-roles`)
- Reference: `tests/desktop/features/settings/llm-setup/delete-configuration.spec.ts` for deletion patterns
- Location: Create file at `tests/desktop/features/settings/roles/roles-deletion.spec.ts`
- Helper Functions: Located in `tests/desktop/helpers/settings/`
- UI Components: Delete confirmation dialog, role removal from list, deletion restrictions

## Implementation Requirements

### Create `roles-deletion.spec.ts`

Following LLM deletion test patterns, implement comprehensive role deletion tests:

**Test Suite Structure:**

```typescript
import { expect, test } from "@playwright/test";
import {
  setupRolesTestSuite,
  openRolesSection,
  waitForRolesList,
  createMockRoleData,
} from "../../../helpers";

test.describe("Feature: Roles Section - Role Deletion", () => {
  const testSuite = setupRolesTestSuite();

  test("deletes custom role successfully with confirmation", async () => {
    // Test implementation
  });

  test("shows confirmation dialog before deletion", async () => {
    // Test implementation
  });

  test("cancels deletion when user cancels confirmation", async () => {
    // Test implementation
  });

  test("removes role from list after successful deletion", async () => {
    // Test implementation
  });

  test("deletion persists after page reload", async () => {
    // Test implementation
  });

  test("handles default role deletion restrictions (if applicable)", async () => {
    // Test implementation
  });
});
```

### Core Test Cases

#### Test 1: Successful Role Deletion

- Create a test role first
- Click delete button on the role
- Confirm deletion in dialog
- Verify role is removed from list
- Check that deletion completed successfully

#### Test 2: Confirmation Dialog Testing

- Click delete button on a role
- Verify confirmation dialog appears with proper content
- Check that dialog shows role name/details
- Test dialog has proper cancel and confirm buttons
- Verify dialog can be closed without deleting

#### Test 3: Cancel Deletion Flow

- Start deletion process for a role
- Open confirmation dialog
- Click cancel or close dialog
- Verify role remains in list unchanged
- Confirm no deletion occurred

#### Test 4: List Update After Deletion

- Note initial role count
- Delete a specific role successfully
- Verify role count decreases by 1
- Check that specific role is no longer visible
- Ensure other roles remain unaffected

#### Test 5: Deletion Persistence

- Create and then delete a test role
- Navigate away from roles section and back
- Verify deleted role does not reappear
- Test persistence across page reloads
- Confirm deletion is permanent

#### Test 6: Default Role Protection (if applicable)

- Test deletion behavior with default roles
- Verify if default roles can be deleted or are protected
- Check for any special warnings or restrictions
- Test error handling for protected role deletion attempts

## Technical Details

### Expected Implementation Pattern

```typescript
test("deletes custom role successfully with confirmation", async () => {
  const window = testSuite.getWindow();

  await openRolesSection(window);
  await waitForRolesList(window);

  // Create a test role first
  const testRole = createMockRoleData({ name: "Role To Delete" });
  // ... create role logic ...

  // Get initial role count
  const initialRoles = await window.locator('[role="article"]').count();

  // Click delete button
  const roleCard = window.locator(
    `[role="article"]:has-text("${testRole.name}")`,
  );
  const deleteButton = roleCard.locator('[aria-label*="Delete"]');
  await deleteButton.click();

  // Handle confirmation dialog
  const confirmDialog = window.locator('[role="dialog"]');
  await expect(confirmDialog).toBeVisible();

  // Verify dialog content
  await expect(confirmDialog).toContainText(testRole.name);
  await expect(confirmDialog).toContainText("delete");

  // Confirm deletion
  const confirmButton = confirmDialog
    .locator("button")
    .filter({ hasText: /Delete|Confirm/ });
  await confirmButton.click();

  // Verify deletion
  await expect(confirmDialog).not.toBeVisible();
  await expect(window.locator(`text=${testRole.name}`)).not.toBeVisible();

  // Check role count decreased
  const finalRoles = await window.locator('[role="article"]').count();
  expect(finalRoles).toBe(initialRoles - 1);
});
```

### Deletion Dialog Investigation

- Study deletion confirmation dialog structure
- Understand dialog content and button layout
- Check for role-specific information display
- Identify proper selectors for confirmation buttons

### Deletion Restrictions Research

- Investigate if default roles can be deleted
- Check for any role dependencies or restrictions
- Understand deletion validation rules
- Test behavior with roles that might be in use

### Error Handling

- Test deletion failures and error recovery
- Verify proper error messages for failed deletions
- Check handling of network errors during deletion
- Test retry behavior if deletion fails

## Acceptance Criteria

- [ ] Test file `roles-deletion.spec.ts` created with comprehensive deletion testing
- [ ] Confirmation dialog functionality thoroughly tested
- [ ] Cancel deletion flow verified to preserve roles
- [ ] Successful deletion removes role from list
- [ ] Deletion persistence across navigation verified
- [ ] Default role deletion behavior tested (protection or allowance)
- [ ] Proper error handling for failed deletions tested
- [ ] Role count and list integrity verified after deletions
- [ ] Tests use infrastructure utilities appropriately
- [ ] Tests run reliably without flakiness

## Dependencies

- **Must wait for**: All infrastructure tasks including barrel exports
- Can run in parallel with other test suite implementations
- May benefit from role creation tests for generating test data

## Files to Create

- `tests/desktop/features/settings/roles/roles-deletion.spec.ts`

## Research Required

- Study role deletion dialog UI and behavior
- Understand deletion confirmation flow and button selectors
- Check if default roles have deletion restrictions
- Verify role removal from list behavior
- Investigate deletion error handling and recovery
- Check for any cascade effects of role deletion

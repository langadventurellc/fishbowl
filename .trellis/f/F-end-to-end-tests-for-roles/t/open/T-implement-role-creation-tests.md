---
id: T-implement-role-creation-tests
title: Implement role creation tests
status: open
priority: medium
parent: F-end-to-end-tests-for-roles
prerequisites:
  - T-create-roles-test-barrel
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-13T18:19:13.335Z
updated: 2025-08-13T18:19:13.335Z
---

# Implement Role Creation Tests

Create end-to-end tests to verify role creation functionality including form validation, modal interactions, and data persistence.

## Context

- Feature: End-to-End Tests for Roles Section (`F-end-to-end-tests-for-roles`)
- Reference: `tests/desktop/features/settings/llm-setup/anthropic-configuration-creation.spec.ts` for similar patterns
- Location: Create file at `tests/desktop/features/settings/roles/roles-creation.spec.ts`
- Helper Functions: Located in `tests/desktop/helpers/settings/`
- UI Components: Role creation modal, form validation, role list updates

## Implementation Requirements

### Create `roles-creation.spec.ts`

Following LLM creation test patterns, implement comprehensive role creation tests:

**Test Suite Structure:**

```typescript
import { expect, test } from "@playwright/test";
import {
  setupRolesTestSuite,
  openRolesSection,
  waitForRolesList,
  createMockRoleData,
} from "../../../helpers";

test.describe("Feature: Roles Section - Role Creation", () => {
  const testSuite = setupRolesTestSuite();

  test("creates role with all required fields successfully", async () => {
    // Test implementation
  });

  test("validates required fields and shows errors", async () => {
    // Test implementation
  });

  test("prevents duplicate role names", async () => {
    // Test implementation
  });

  test("role appears in list after creation", async () => {
    // Test implementation
  });

  test("role persists after page reload", async () => {
    // Test implementation
  });
});
```

### Core Test Cases

#### Test 1: Successful Role Creation

- Click "Create Role" button to open modal
- Fill all required fields (name, description, system prompt)
- Submit form and verify success
- Check that role appears in roles list
- Verify modal closes after successful creation

#### Test 2: Form Validation Testing

- Test empty name field shows validation error
- Test empty description field behavior
- Test empty system prompt field behavior
- Verify submit button state changes based on validation
- Test error message display and clearing

#### Test 3: Duplicate Name Prevention

- Create a role with a specific name
- Try to create another role with the same name
- Verify duplicate name error is shown
- Test case-insensitive duplicate detection
- Confirm original role remains unchanged

#### Test 4: Modal Interaction Testing

- Test modal opens correctly when clicking create button
- Test cancel button functionality (no changes saved)
- Test modal closes on successful creation
- Test clicking outside modal or ESC key behavior
- Verify form state is reset between modal opens

#### Test 5: Data Persistence Testing

- Create a role with specific data
- Navigate away from roles section
- Navigate back and verify role is still present
- Test that role data persists after app reload/restart

## Technical Details

### Expected Implementation Pattern

```typescript
test("creates role with all required fields successfully", async () => {
  const window = testSuite.getWindow();

  await openRolesSection(window);
  await waitForRolesList(window);

  // Click create role button
  const createButton = window
    .locator("button")
    .filter({ hasText: "Create Role" });
  await createButton.click();

  // Wait for modal
  const modal = window.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  // Fill form with mock data
  const mockData = createMockRoleData();
  await modal.locator('[name="name"]').fill(mockData.name);
  await modal.locator('[name="description"]').fill(mockData.description);
  await modal.locator('[name="systemPrompt"]').fill(mockData.systemPrompt);

  // Submit form
  const saveButton = modal.locator("button").filter({ hasText: "Create" });
  await expect(saveButton).toBeEnabled();
  await saveButton.click();

  // Verify modal closes and role appears
  await expect(modal).not.toBeVisible();
  await expect(window.locator(`text=${mockData.name}`)).toBeVisible();
});
```

### Form Investigation Required

- Study role creation modal structure and field names
- Identify form validation patterns and error display
- Understand submit button states and loading indicators
- Check modal backdrop and close behaviors

### Data Integration

- Use mock data generators for consistent test data
- Test with various input lengths and character sets
- Verify proper handling of special characters
- Test boundary conditions for field lengths

## Acceptance Criteria

- [ ] Test file `roles-creation.spec.ts` created with proper structure
- [ ] Successful role creation flow tested end-to-end
- [ ] Form validation thoroughly tested for all fields
- [ ] Duplicate name prevention verified
- [ ] Modal interactions and state changes tested
- [ ] Data persistence across navigation verified
- [ ] Tests use mock data generators appropriately
- [ ] Proper error handling and user feedback tested
- [ ] Tests run reliably without flakiness
- [ ] Clear test descriptions and assertions

## Dependencies

- **Must wait for**: All infrastructure tasks including barrel exports
- Can run in parallel with other test suite implementations
- Uses mock data generators from infrastructure

## Files to Create

- `tests/desktop/features/settings/roles/roles-creation.spec.ts`

## Research Required

- Study role creation modal UI and form structure
- Understand validation rules and error display patterns
- Check role persistence mechanisms
- Verify role list update behavior after creation

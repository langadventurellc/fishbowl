---
id: F-end-to-end-tests-for-roles
title: End-to-End Tests for Roles Section
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  tests/desktop/features/settings/roles/openRolesSection.ts: Created navigation
    helper function that opens settings modal and navigates to roles section,
    handling modal lifecycle and waiting for proper UI elements to be visible
  tests/desktop/features/settings/roles/waitForRolesList.ts:
    Created comprehensive
    wait utilities for roles list states including populated list, empty state,
    loading spinners, and specific role detection with proper error handling
  tests/desktop/features/settings/roles/waitForRoleModal.ts: Created modal
    interaction helpers for role creation/editing modals, deletion confirmation
    dialogs, and modal closing with proper overlay and content detection
  tests/desktop/features/settings/roles/index.ts: Created barrel export file for
    convenient importing of all roles test helper functions; Updated barrel
    export to include new cleanupRolesStorage and setupRolesTestSuite functions
  tests/desktop/features/settings/roles/cleanupRolesStorage.ts:
    Created storage cleanup utility with retry logic for handling file locks and
    timing issues
  tests/desktop/features/settings/roles/setupRolesTestSuite.ts:
    Created main test suite setup function following LLM patterns with lifecycle
    hooks, storage cleanup, and modal management
  tests/desktop/features/settings/roles/roles-infrastructure.spec.ts:
    Created infrastructure validation test to verify setup functions work
    correctly
  tests/desktop/helpers/settings/MockRoleData.ts: Created TypeScript interface for mock role data structure
  tests/desktop/helpers/settings/createMockRoleData.ts: Implemented core mock role generator with partial override support
  tests/desktop/helpers/settings/createMinimalRoleData.ts: Created minimal valid role data generator for boundary testing
  tests/desktop/helpers/settings/createInvalidRoleData.ts: Implemented invalid data generator for validation testing
  tests/desktop/helpers/settings/createDuplicateNameRoleData.ts: Created duplicate name generator for uniqueness validation testing
  tests/desktop/helpers/settings/createMockAnalystRole.ts: Implemented specialized data analyst role generator
  tests/desktop/helpers/settings/createMockWriterRole.ts: Implemented specialized creative writer role generator
  tests/desktop/helpers/settings/createMockTechnicalRole.ts: Implemented specialized technical/developer role generator
  tests/desktop/helpers/settings/createLongTextRoleData.ts: Created edge case generator for maximum character limit testing
  tests/desktop/helpers/settings/createSpecialCharRoleData.ts: Implemented special character handling test data generator
  tests/desktop/helpers/index.ts: Updated barrel export to include all new role mock generators and types
log: []
schema: v1.0
childrenIds:
  - T-create-roles-mock-data
  - T-create-roles-test-barrel
  - T-implement-default-roles
  - T-implement-role-creation-tests
  - T-implement-role-deletion-tests
  - T-implement-role-editing-tests
  - T-create-roles-navigation-and
  - T-create-roles-storage-cleanup
  - T-create-roles-test-suite
created: 2025-08-13T18:12:56.311Z
updated: 2025-08-13T18:12:56.311Z
---

# End-to-End Tests for Roles Section

Create comprehensive end-to-end tests for the roles section of the settings modal, following the established patterns from LLM setup tests. The tests should verify basic functionality without being comprehensive or performance-focused.

## Overview

This feature implements basic e2e tests for the roles management functionality in the desktop application. The tests will be organized in multiple test suites (similar to LLM setup tests) to prevent large, unmanageable test files.

## Acceptance Criteria

### Core Functionality Testing

- ✅ **Default Roles Loading**: Verify that the 4 default roles load correctly from `defaultRoles.json`
  - Project Manager
  - Code Reviewer
  - Creative Writer
  - Data Analyst
- ✅ **Role Editing**: Test editing existing roles (both default and custom roles)
- ✅ **Role Creation**: Test adding new custom roles
- ✅ **Role Deletion**: Test deleting roles (custom roles only, default roles should be preserved)

### Test Organization Requirements

- ✅ **Multiple Test Suites**: Follow LLM setup pattern with separate test files for different functionality areas
- ✅ **Shared Test Helpers**: Create reusable helper functions and setup utilities
- ✅ **Modular Structure**: Organize tests to prevent single large test file

## Technical Implementation

### Test Suite Structure

Following the LLM setup pattern, create separate test files:

1. **`roles-default-loading.spec.ts`** - Test default roles loading
2. **`roles-creation.spec.ts`** - Test role creation functionality
3. **`roles-editing.spec.ts`** - Test role editing functionality
4. **`roles-deletion.spec.ts`** - Test role deletion functionality

### Helper Functions Required

Create helper functions similar to LLM setup tests:

- `setupRolesTestSuite()` - Main test suite setup with cleanup
- `openRolesSection()` - Navigate to roles section in settings
- `waitForRolesList()` - Wait for roles list to load
- `createMockRoleData()` - Generate mock role data for tests
- `cleanupRolesStorage()` - Clean roles data between tests

### Test Data Structure

Based on `defaultRoles.json` analysis, roles have:

- `id`: unique identifier
- `name`: display name
- `description`: role description
- `systemPrompt`: role system prompt
- `createdAt`/`updatedAt`: timestamps

### Mock Data Requirements

- Create mock role data generators for consistent test data
- Support for both minimal and complete role data
- Validation test data for error scenarios

## Specific Test Cases

### Default Roles Loading Tests

- Verify 4 default roles load on first visit
- Confirm role names, descriptions exist
- Test roles list displays properly
- Verify empty state doesn't show when defaults exist

### Role Creation Tests

- Create role with all required fields
- Test form validation (empty name, duplicate names)
- Verify new role appears in list
- Test modal open/close behavior
- Verify role persistence after page reload

### Role Editing Tests

- Edit existing role name and description
- Edit system prompt
- Test form pre-population with existing data
- Verify changes persist after save
- Test cancel functionality (no changes saved)
- Test validation during edit (empty fields, duplicates)

### Role Deletion Tests

- Delete custom roles successfully
- Verify confirmation dialog appears
- Test cancel deletion (role preserved)
- Verify role removed from list after deletion
- Confirm deletion persistence

## Testing Approach

### Basic Functionality Focus

- Test core happy path scenarios
- Basic error handling and validation
- No comprehensive edge case testing
- No performance or stress testing

### UI Interaction Testing

- Modal opening/closing
- Form field interactions
- Button states and functionality
- List display and updates

### Data Persistence Testing

- Changes persist across page reloads
- Storage cleanup between tests
- Proper state management verification

## Technical Requirements

### Test Framework Integration

- Use Playwright for e2e testing
- Follow existing desktop test patterns
- Use existing test helpers and utilities where possible

### Storage Management

- Implement proper cleanup between tests
- Handle roles storage file management
- Ensure clean state for each test

### Error Handling

- Test basic form validation
- Verify error messages display correctly
- Test recovery from error states

## File Structure

```
tests/desktop/features/settings/roles/
├── index.ts                           # Barrel file for exports
├── setupRolesTestSuite.ts            # Main test setup utility
├── openRolesSection.ts               # Navigation helper
├── waitForRolesList.ts               # Wait helper
├── createMockRoleData.ts             # Mock data generator
├── cleanupRolesStorage.ts            # Storage cleanup
├── roles-default-loading.spec.ts     # Default roles tests
├── roles-creation.spec.ts            # Role creation tests
├── roles-editing.spec.ts             # Role editing tests
└── roles-deletion.spec.ts            # Role deletion tests
```

## Success Metrics

- All basic CRUD operations work correctly in e2e environment
- Default roles load properly on first application start
- Tests run reliably without flakiness
- Test suite is maintainable and follows existing patterns
- Clean separation prevents monolithic test files

## Notes

- Follow established patterns from `tests/desktop/features/settings/llm-setup/`
- Reuse existing test infrastructure and helpers where possible
- Focus on user-facing functionality, not internal implementation details
- Ensure tests are simple, focused, and maintainable

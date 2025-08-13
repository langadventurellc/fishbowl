---
id: F-end-to-end-tests-for-roles
title: End-to-End Tests for Roles Section
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
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

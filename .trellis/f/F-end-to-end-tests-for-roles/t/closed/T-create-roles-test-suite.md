---
id: T-create-roles-test-suite
title: Create roles test suite infrastructure
status: done
priority: high
parent: F-end-to-end-tests-for-roles
prerequisites: []
affectedFiles:
  tests/desktop/features/settings/roles/cleanupRolesStorage.ts:
    Created storage cleanup utility with retry logic for handling file locks and
    timing issues
  tests/desktop/features/settings/roles/setupRolesTestSuite.ts:
    Created main test suite setup function following LLM patterns with lifecycle
    hooks, storage cleanup, and modal management
  tests/desktop/features/settings/roles/index.ts:
    Updated barrel export to include
    new cleanupRolesStorage and setupRolesTestSuite functions
  tests/desktop/features/settings/roles/roles-infrastructure.spec.ts:
    Created infrastructure validation test to verify setup functions work
    correctly
log:
  - >-
    Successfully implemented the core test infrastructure for roles end-to-end
    tests following established patterns from LLM setup tests.


    Created a robust test suite setup function that provides proper lifecycle
    management (beforeAll, beforeEach, afterEach, afterAll), storage cleanup,
    and modal state management. The infrastructure includes retry logic for file
    operations and proper error handling to prevent test flakiness.


    Key features implemented:

    - setupRolesTestSuite() function providing core utilities (getElectronApp,
    getWindow, getUserDataPath, getRolesConfigPath)

    - Automatic roles storage cleanup (roles.json) between tests with retry
    logic for file locks

    - Modal state management to ensure clean UI state between tests

    - Electron app lifecycle management for test isolation

    - Infrastructure validation test to verify setup works correctly


    All quality checks pass (lint, format, type-check) and the infrastructure
    follows TypeScript patterns from existing LLM tests. Ready for dependent
    tasks to build role-specific test suites on this foundation.
schema: v1.0
childrenIds: []
created: 2025-08-13T18:16:30.759Z
updated: 2025-08-13T18:16:30.759Z
---

# Create Roles Test Suite Infrastructure

Implement the core test infrastructure for roles end-to-end tests, following the established patterns from LLM setup tests.

## Context

- Feature: End-to-End Tests for Roles Section (`F-end-to-end-tests-for-roles`)
- Reference: `tests/desktop/features/settings/llm-setup/setupLlmTestSuite.ts` for patterns
- Location: Create new file at `tests/desktop/features/settings/roles/setupRolesTestSuite.ts`

## Implementation Requirements

### Create `setupRolesTestSuite.ts`

Following the LLM setup pattern, implement a test suite setup function that provides:

**Core Setup Functions:**

- `setupRolesTestSuite()` - Main function returning test utilities
- `getElectronApp()` - Access to electron app instance
- `getWindow()` - Access to test window
- `getUserDataPath()` - Path to user data directory
- `getRolesConfigPath()` - Path to roles storage file
- `getRolesSecureKeysPath()` - Path to secure keys if needed

**Test Lifecycle Management:**

- `test.beforeAll()` - Launch Electron app with proper path configuration
- `test.beforeEach()` - Clean roles storage and reset UI state between tests
- `test.afterEach()` - Ensure modals are closed and clean up
- `test.afterAll()` - Close Electron application

**Storage Management:**

- Determine roles storage file location (likely `roles_config.json`)
- Implement proper cleanup between tests
- Handle both file deletion and in-memory cache refresh (if applicable)
- Ensure clean state for each test run

## Technical Details

### File Structure

```typescript
export const setupRolesTestSuite = () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;
  let userDataPath: string;
  let rolesConfigPath: string;

  // Implementation following LLM pattern...

  return {
    getElectronApp: () => electronApp,
    getWindow: () => window,
    getUserDataPath: () => userDataPath,
    getRolesConfigPath: () => rolesConfigPath,
  };
};
```

### Key Considerations

- Follow exact patterns from `setupLlmTestSuite.ts`
- Handle roles-specific storage locations
- Ensure proper cleanup prevents test interference
- Add appropriate error handling and logging
- Include small delays for UI state transitions

## Acceptance Criteria

- [ ] `setupRolesTestSuite.ts` file created with proper exports
- [ ] All lifecycle hooks implemented (beforeAll, beforeEach, afterEach, afterAll)
- [ ] Electron app launches correctly with test environment
- [ ] Clean state established between tests
- [ ] Modal cleanup handled properly
- [ ] Storage paths determined and accessible
- [ ] Function returns proper utility object with getters
- [ ] Follows TypeScript patterns from existing LLM tests
- [ ] No test flakiness from improper cleanup

## Dependencies

- Must complete before any test suite implementation tasks
- Requires understanding of existing LLM setup patterns
- May need to investigate roles storage file locations

## Files to Create

- `tests/desktop/features/settings/roles/setupRolesTestSuite.ts`

## Testing

- Verify setup/teardown cycle works correctly
- Ensure no state leakage between test runs
- Confirm all returned utilities are functional

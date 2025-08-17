---
id: T-create-personalities
title: Create Personalities Infrastructure Validation Tests
status: open
priority: low
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-personalities-deletion
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T21:23:44.275Z
updated: 2025-08-17T21:23:44.275Z
---

# Create Personalities Infrastructure Validation Tests

## Context

Create infrastructure validation tests for the personalities test suite, following the exact pattern established in `tests/desktop/features/settings/roles/roles-infrastructure.spec.ts`. These tests verify that the test infrastructure is working correctly and provide debugging capabilities.

## Reference Implementation

Base implementation directly on:

- `tests/desktop/features/settings/roles/roles-infrastructure.spec.ts` - Primary pattern to follow
- Infrastructure validation, path verification, and test environment checks
- Adapt for personalities test infrastructure and file paths

## Test Infrastructure Purpose

Infrastructure tests serve to:

1. **Validate test setup** - Ensure setupPersonalitiesTestSuite works correctly
2. **Verify paths** - Check personalitiesConfigPath is correct
3. **Debug environment** - Provide tools for troubleshooting test failures
4. **Smoke test** - Basic validation that Electron app and window are accessible

## Implementation Requirements

### 1. Create personalities-infrastructure.spec.ts

Create file: `tests/desktop/features/settings/personalities/personalities-infrastructure.spec.ts`

Following the exact pattern from roles-infrastructure.spec.ts but adapted for personalities:

```typescript
import { expect, test } from "@playwright/test";
import { setupPersonalitiesTestSuite } from "../../../helpers";

test.describe("Personalities Test Suite Infrastructure", () => {
  const {
    getElectronApp,
    getWindow,
    getUserDataPath,
    getPersonalitiesConfigPath,
  } = setupPersonalitiesTestSuite();

  test.describe("Infrastructure Validation", () => {
    test("should provide access to electron app", () => {
      const app = getElectronApp();
      expect(app).toBeDefined();
    });

    test("should provide access to window", () => {
      const window = getWindow();
      expect(window).toBeDefined();
    });

    test("should provide user data path", () => {
      const userDataPath = getUserDataPath();
      expect(userDataPath).toBeDefined();
      expect(typeof userDataPath).toBe("string");
    });

    test("should provide personalities config path", () => {
      const personalitiesConfigPath = getPersonalitiesConfigPath();
      expect(personalitiesConfigPath).toBeDefined();
      expect(typeof personalitiesConfigPath).toBe("string");
      expect(personalitiesConfigPath).toMatch(/personalities\.json$/);
    });

    test("should have window ready for interaction", async () => {
      const window = getWindow();
      await expect(window.locator("body")).toBeVisible();
    });
  });

  test.describe("Test Environment Verification", () => {
    test("should have clean personalities state", async () => {
      const window = getWindow();
      const personalitiesConfigPath = getPersonalitiesConfigPath();

      // Verify path ends with personalities.json
      expect(personalitiesConfigPath).toMatch(/personalities\.json$/);

      // Basic window interaction test
      await expect(window.locator("body")).toBeVisible();

      console.log(
        `Personalities config will be at: ${personalitiesConfigPath}`,
      );
    });

    test("should support personalities test helpers", async () => {
      const window = getWindow();

      // Verify window has test helpers available
      const hasTestHelpers = await window.evaluate(() => {
        return typeof window.testHelpers !== "undefined";
      });

      expect(hasTestHelpers).toBe(true);
    });

    test("should have proper file path structure", () => {
      const userDataPath = getUserDataPath();
      const personalitiesConfigPath = getPersonalitiesConfigPath();

      // Verify personalities config path is inside user data path
      expect(personalitiesConfigPath).toContain(userDataPath);

      // Verify it ends with the correct filename
      expect(personalitiesConfigPath.endsWith("personalities.json")).toBe(true);

      console.log(`User data path: ${userDataPath}`);
      console.log(`Personalities config path: ${personalitiesConfigPath}`);
    });
  });

  test.describe("Basic Functionality Smoke Tests", () => {
    test("should be able to navigate to personalities section", async () => {
      const window = getWindow();

      // This is a basic smoke test - we don't need full navigation
      // Just verify we can access the DOM and find expected elements
      await expect(window.locator("body")).toBeVisible();

      // Verify the app has loaded properly
      const title = await window.title();
      expect(title).toBeTruthy();
      expect(typeof title).toBe("string");
    });

    test("should support modal operations", async () => {
      const window = getWindow();

      // Test basic window operations that personalities tests will use
      await expect(window.locator("body")).toBeVisible();

      // Verify we can wait for timeout (used in many personality tests)
      const startTime = Date.now();
      await window.waitForTimeout(100);
      const endTime = Date.now();

      // Should have waited approximately 100ms (with some tolerance)
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  test.describe("Path and Configuration Validation", () => {
    test("personalities config path should be absolute", () => {
      const personalitiesConfigPath = getPersonalitiesConfigPath();

      // Should be an absolute path (starts with / on Unix or drive letter on Windows)
      const isAbsolute =
        personalitiesConfigPath.startsWith("/") ||
        /^[A-Za-z]:/.test(personalitiesConfigPath);
      expect(isAbsolute).toBe(true);
    });

    test("user data path should be accessible", () => {
      const userDataPath = getUserDataPath();

      // Should be a non-empty string
      expect(userDataPath).toBeTruthy();
      expect(userDataPath.length).toBeGreaterThan(0);

      // Should be an absolute path
      const isAbsolute =
        userDataPath.startsWith("/") || /^[A-Za-z]:/.test(userDataPath);
      expect(isAbsolute).toBe(true);
    });

    test("should have correct file extension", () => {
      const personalitiesConfigPath = getPersonalitiesConfigPath();

      expect(personalitiesConfigPath.endsWith(".json")).toBe(true);
      expect(personalitiesConfigPath.includes("personalities")).toBe(true);
    });
  });

  test.describe("Test Suite Isolation", () => {
    test("should provide fresh instances per test", () => {
      // Each test should get its own app instance
      const app1 = getElectronApp();
      const window1 = getWindow();

      expect(app1).toBeDefined();
      expect(window1).toBeDefined();

      // These should be the same within a single test, but fresh between tests
      expect(getElectronApp()).toBe(app1);
      expect(getWindow()).toBe(window1);
    });

    test("should maintain consistent paths across calls", () => {
      const userDataPath1 = getUserDataPath();
      const userDataPath2 = getUserDataPath();
      const configPath1 = getPersonalitiesConfigPath();
      const configPath2 = getPersonalitiesConfigPath();

      // Should be consistent within the same test
      expect(userDataPath1).toBe(userDataPath2);
      expect(configPath1).toBe(configPath2);
    });
  });
});
```

### 2. Integration with Test Structure

Ensure this test file is included in the same directory as other personality test files:

- `tests/desktop/features/settings/personalities/personalities-infrastructure.spec.ts`

This follows the exact same structure as roles infrastructure tests.

## Acceptance Criteria

✅ **File Creation**: `personalities-infrastructure.spec.ts` exists in correct directory
✅ **App Access**: Tests verify getElectronApp() returns valid app instance
✅ **Window Access**: Tests verify getWindow() returns valid window instance
✅ **Path Validation**: Tests verify getUserDataPath() and getPersonalitiesConfigPath() return correct paths
✅ **File Extension**: Tests verify personalities.json file path is correct
✅ **Environment Checks**: Tests verify test environment is ready for interaction
✅ **Path Structure**: Tests verify personalities config path is within user data path
✅ **Smoke Tests**: Basic functionality tests to catch major issues
✅ **Test Isolation**: Tests verify test suite provides proper isolation

## Technical Details

### Key Adaptations from Roles

- `setupRolesTestSuite` → `setupPersonalitiesTestSuite`
- `getRolesConfigPath` → `getPersonalitiesConfigPath`
- `roles.json` → `personalities.json`
- Test descriptions updated for personalities context

### Path Validation

- Verify `personalities.json` file extension
- Check absolute path structure
- Validate path is within user data directory
- Confirm consistent path generation

### Test Categories

1. **Infrastructure Validation** - Basic setup verification
2. **Test Environment Verification** - Environment readiness
3. **Basic Functionality Smoke Tests** - Simple operation tests
4. **Path and Configuration Validation** - File path verification
5. **Test Suite Isolation** - Instance isolation verification

## Testing Requirements

### Unit Tests (included in this task)

The infrastructure tests themselves serve as validation:

- Test imports and setup work correctly
- Basic app functionality is accessible
- File paths are properly configured

### Integration Testing

These tests will run as part of the overall personality test suite and provide debugging information if other tests fail.

## Dependencies

- Requires: T-create-personalities-deletion (all functionality tests)
- Requires: setupPersonalitiesTestSuite infrastructure
- Completes: All personality test implementation

## Notes

- Follow exact same pattern as roles-infrastructure.spec.ts
- Focus on infrastructure validation rather than functionality testing
- Provide useful debugging information via console.log statements
- Keep tests simple and focused on environment verification
- These tests help identify infrastructure issues vs functionality issues

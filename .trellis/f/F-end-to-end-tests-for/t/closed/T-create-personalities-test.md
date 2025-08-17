---
id: T-create-personalities-test
title: Create Personalities Test Infrastructure Setup
status: done
priority: high
parent: F-end-to-end-tests-for
prerequisites: []
affectedFiles:
  tests/desktop/helpers/settings/setupPersonalitiesTestSuite.ts:
    Created new test infrastructure setup function following roles pattern with
    personalities-specific configuration and data reset
  tests/desktop/helpers/index.ts: Added export for setupPersonalitiesTestSuite function
log:
  - Successfully implemented personalities test infrastructure setup following
    the exact pattern from setupRolesTestSuite.ts. Created the
    setupPersonalitiesTestSuite function that provides fresh Electron app
    instances for each test with clean personalities data reset from the source
    defaultPersonalities.json file. The infrastructure handles proper
    application lifecycle management, storage cleanup, and error handling. All
    quality checks pass and the function is properly exported from the test
    helpers index.
schema: v1.0
childrenIds: []
created: 2025-08-17T21:14:33.680Z
updated: 2025-08-17T21:14:33.680Z
---

# Create Personalities Test Infrastructure Setup

## Context

Create the core test infrastructure for personalities end-to-end tests, following the exact pattern established in `tests/desktop/helpers/settings/setupRolesTestSuite.ts`. This infrastructure handles application lifecycle management and storage cleanup for each test.

## Reference Implementation

Base this implementation directly on:

- `tests/desktop/helpers/settings/setupRolesTestSuite.ts` - Primary pattern to follow
- Uses fresh Electron app instance for each test (not just between test suites)
- Restores clean default personalities data before each test
- Reads clean data from source file: `packages/shared/src/data/defaultPersonalities.json`

## Implementation Requirements

### 1. Create setupPersonalitiesTestSuite.ts

Create file: `tests/desktop/helpers/settings/setupPersonalitiesTestSuite.ts`

Following the exact pattern from setupRolesTestSuite.ts but adapted for personalities:

```typescript
import { test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import {
  createElectronApp,
  type TestElectronApplication,
  type TestWindow,
} from "../index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const setupPersonalitiesTestSuite = () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;
  let userDataPath: string;
  let personalitiesConfigPath: string;
  let cleanPersonalitiesData: string; // Store the clean default personalities JSON

  test.beforeAll(async () => {
    // Load clean default personalities data directly from source
    try {
      const fs = await import("fs/promises");
      const defaultPersonalitiesSourcePath = path.join(
        __dirname,
        "../../../../packages/shared/src/data/defaultPersonalities.json",
      );
      cleanPersonalitiesData = await fs.readFile(
        defaultPersonalitiesSourcePath,
        "utf-8",
      );
    } catch (error) {
      console.warn("Could not read default personalities source data:", error);
      // Fallback - this should never happen in normal operation
      cleanPersonalitiesData = JSON.stringify({
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: new Date().toISOString(),
      });
    }
  });

  test.beforeEach(async () => {
    // Create fresh Electron app instance for each test
    const electronPath = path.join(
      __dirname,
      "../../../../apps/desktop/dist-electron/electron/main.js",
    );
    electronApp = await createElectronApp(electronPath);

    window = electronApp.window;
    await window.waitForLoadState("domcontentloaded");
    await window.waitForLoadState("networkidle");

    // Get personalities config path for this test instance
    userDataPath = await electronApp.evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
    personalitiesConfigPath = path.join(userDataPath, "personalities.json");

    // Restore clean default personalities state before each test
    try {
      if (personalitiesConfigPath && cleanPersonalitiesData) {
        const fs = await import("fs/promises");
        await fs.writeFile(
          personalitiesConfigPath,
          cleanPersonalitiesData,
          "utf-8",
        );
      }
    } catch (error) {
      console.warn("Could not restore clean personalities state:", error);
    }
  });

  test.afterEach(async () => {
    // Close the Electron app instance after each test
    if (electronApp) {
      try {
        await electronApp.close();
      } catch (error) {
        console.warn("Could not close Electron app:", error);
      }
    }
  });

  return {
    getElectronApp: () => electronApp,
    getWindow: () => window,
    getUserDataPath: () => userDataPath,
    getPersonalitiesConfigPath: () => personalitiesConfigPath,
  };
};
```

### 2. Update Test Helpers Index

Update `tests/desktop/helpers/index.ts` to export the new setup function:

Add the export line following the pattern of existing exports:

```typescript
export { setupPersonalitiesTestSuite } from "./settings/setupPersonalitiesTestSuite";
```

## Acceptance Criteria

✅ **File Creation**: `tests/desktop/helpers/settings/setupPersonalitiesTestSuite.ts` exists and follows exact pattern
✅ **Fresh App Instance**: Creates new Electron app for each test (like roles implementation)
✅ **Data Reset**: Restores clean personalities.json from source before each test
✅ **Path Management**: Provides access to userDataPath and personalitiesConfigPath
✅ **Cleanup**: Properly closes Electron app after each test
✅ **Export Integration**: Function is exported from helpers index.ts
✅ **Error Handling**: Graceful handling of file operations and app lifecycle
✅ **Source Data Loading**: Reads clean data from defaultPersonalities.json source file

## Technical Details

### Critical Patterns to Follow

- **Each Test Gets Fresh App**: New Electron instance per test (not per test suite)
- **Source Data Path**: Read from `packages/shared/src/data/defaultPersonalities.json`
- **Storage File Path**: Write to `personalities.json` in user data directory
- **Error Handling**: Console warnings for file operations, don't fail tests
- **Cleanup Order**: Always close app in afterEach, use try/catch

### File Structure Alignment

- Place in same directory as `setupRolesTestSuite.ts`
- Follow same naming convention but replace "roles" with "personalities"
- Export from same index.ts file as other helpers

## Testing Requirements

### Unit Tests (included in this task)

Create basic validation that the setup function:

- Returns the required getter functions
- Can be imported without errors
- Follows TypeScript type contracts

### Integration Testing

This infrastructure will be tested through actual e2e tests in subsequent tasks.

## Notes

- This is the foundation for all personality e2e tests
- Must follow roles pattern exactly to ensure consistency
- Critical that each test gets clean state via fresh app instance
- The user specifically emphasized following the roles pattern for reset behavior

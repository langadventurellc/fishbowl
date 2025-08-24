---
id: T-add-end-to-end-test-for
title: Add end-to-end test for migration copying
status: open
priority: medium
parent: F-migration-files-user-data-copy
prerequisites:
  - T-integrate-migration-copying
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T05:38:02.385Z
updated: 2025-08-24T05:38:02.385Z
---

# Add end-to-end test for migration copying

## Context

Create an end-to-end test to verify that the migration copying functionality works correctly in the E2E test environment. This test will ensure that migrations are automatically copied to userData and executed successfully, solving the original E2E test failure issue.

## Implementation Requirements

### File Location

- **Target Directory**: `tests/desktop/features/migrations/`
- **New Test File**: `migration-copying.spec.ts`
- **Test Helpers**: Extend existing database helpers if needed

### Technical Approach

1. **Create Migration Copying Test Suite**

   ```typescript
   import { test, expect } from "@playwright/test";
   import { createElectronApp } from "../../helpers/createElectronApp";
   import { queryDatabase, waitForDatabase } from "../../helpers/database";

   test.describe("Migration Copying", () => {
     // Test implementation
   });
   ```

2. **Test Scenarios to Cover**
   - Clean userData directory and verify automatic migration copying
   - Verify migration execution creates expected database tables
   - Test that subsequent app starts skip copying (lazy initialization)
   - Validate migration files exist in userData directory after copying

3. **Database Verification Logic**
   - Use existing `queryDatabase` helper to verify migration execution
   - Check for tables created by migrations (e.g., conversations table from 001_create_conversations.sql)
   - Verify migration tracking table contains executed migration records

4. **File System Verification**
   - Check that migration files exist in userData/migrations directory
   - Verify file contents match source migrations
   - Validate file permissions and structure

## Detailed Acceptance Criteria

### Core Functionality Testing

- **AC1**: Test starts with clean userData directory (no existing migrations)
- **AC2**: App startup automatically copies migration files to userData/migrations
- **AC3**: Migration files are executed and create expected database tables
- **AC4**: Migration tracking table records successful execution

### File System Verification

- **AC5**: Migration files exist in userData/migrations after app startup
- **AC6**: Copied files have same content as source migration files
- **AC7**: Directory structure is created correctly (userData/migrations/)
- **AC8**: File permissions allow read access for migration execution

### Lazy Initialization Testing

- **AC9**: Second app start skips copying when files already exist
- **AC10**: App startup is faster on subsequent runs (copy skip optimization)
- **AC11**: Existing migration files are not overwritten
- **AC12**: Migration execution still works after copy skip

### Database State Verification

- **AC13**: Tables from 001_create_conversations.sql exist and have correct schema
- **AC14**: Migration tracking table contains records for executed migrations
- **AC15**: Database state matches expected schema after migration execution
- **AC16**: Foreign key constraints and indexes are properly created

### Error Scenarios

- **AC17**: Test handles scenarios where source migrations are missing
- **AC18**: Test verifies error handling when userData directory is read-only
- **AC19**: Test validates behavior when migration files are corrupted
- **AC20**: Test ensures graceful handling of partial copy scenarios

## Testing Implementation

### Main Test Implementation

```typescript
test.describe("Migration Copying E2E", () => {
  let app: TestElectronApplication;

  test.beforeEach(async () => {
    // Clean userData directory to ensure fresh start
    await cleanUserDataDirectory();
  });

  test.afterEach(async () => {
    await app?.close();
  });

  test("should automatically copy and execute migrations on first startup", async () => {
    // Start app with clean userData
    app = await createElectronApp(electronPath);

    // Wait for app initialization and migration execution
    await waitForDatabase(app);

    // Verify migration files were copied
    const migrationsExist = await app.window.evaluate(async () => {
      return window.testHelpers.checkMigrationsInUserData();
    });
    expect(migrationsExist).toBe(true);

    // Verify migrations were executed - check for conversations table
    const conversationsTable = await queryDatabase(
      app,
      `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='conversations'
    `,
    );
    expect(conversationsTable).toHaveLength(1);

    // Verify migration tracking
    const migrationRecords = await queryDatabase(
      app,
      `
      SELECT * FROM migrations ORDER BY filename
    `,
    );
    expect(migrationRecords.length).toBeGreaterThan(0);
    expect(migrationRecords[0].filename).toBe("001_create_conversations.sql");
  });

  test("should skip copying on subsequent startups", async () => {
    // First startup - should copy migrations
    app = await createElectronApp(electronPath);
    await waitForDatabase(app);
    await app.close();

    // Record startup time for comparison
    const startTime = Date.now();

    // Second startup - should skip copying
    app = await createElectronApp(electronPath);
    await waitForDatabase(app);
    const endTime = Date.now();

    // Verify faster startup (copy was skipped)
    const startupTime = endTime - startTime;
    expect(startupTime).toBeLessThan(5000); // Should be much faster

    // Verify migrations still work
    const conversationsTable = await queryDatabase(
      app,
      `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='conversations'
    `,
    );
    expect(conversationsTable).toHaveLength(1);
  });

  test("should handle missing source migrations gracefully", async () => {
    // This test would require mocking or temporarily moving source migrations
    // Implementation depends on test infrastructure capabilities
  });
});
```

### Helper Functions

```typescript
async function cleanUserDataDirectory(): Promise<void> {
  // Implementation to clean userData/migrations directory
}

async function checkMigrationsInUserData(
  app: TestElectronApplication,
): Promise<boolean> {
  // Helper to verify migration files exist in userData
}
```

## Security Considerations

- **Test Isolation**: Ensure tests don't interfere with other test data
- **File System Access**: Use safe file system operations in test helpers
- **Database Security**: Ensure test database operations don't affect production data

## Dependencies

- **Existing E2E Test Infrastructure**: Uses createElectronApp and database helpers
- **Database Test Helpers**: Extends queryDatabase and waitForDatabase functionality
- **Migration Implementation**: Depends on completed copying functionality

## Performance Requirements

- **Test Execution Time**: Complete test suite should run within 30 seconds
- **Resource Usage**: Tests should not consume excessive memory or disk space
- **Cleanup**: Proper cleanup to avoid affecting other tests

## Integration Points

- **Test Suite**: Integrates with existing desktop E2E test structure
- **CI/CD Pipeline**: Should run as part of existing test automation
- **Database Helpers**: Uses established patterns for database testing

## Test Data Requirements

- **Source Migrations**: Uses actual migration files from project migrations directory
- **Expected Schema**: Validates against known database schema from migrations
- **Migration Records**: Verifies expected migration tracking table entries

## Success Criteria

- Test reliably detects migration copying functionality
- Validates that E2E test migration execution now works correctly
- Provides comprehensive coverage of copy and execution workflow
- Integrates seamlessly with existing E2E test infrastructure
- Passes consistently in CI/CD environment
- Provides clear failure information when issues occur

## Monitoring and Debugging

- **Test Logging**: Include detailed logs for debugging test failures
- **Database State**: Capture database state for debugging
- **File System State**: Include file system verification for debugging
- **Performance Metrics**: Track startup times to verify copy skip optimization

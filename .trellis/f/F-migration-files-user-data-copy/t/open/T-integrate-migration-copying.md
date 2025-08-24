---
id: T-integrate-migration-copying
title: Integrate migration copying into runMigrations workflow
status: open
priority: medium
parent: F-migration-files-user-data-copy
prerequisites:
  - T-implement-migration-files
  - T-update-getmigrationspath-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T05:36:43.295Z
updated: 2025-08-24T05:36:43.295Z
---

# Integrate migration copying into runMigrations workflow

## Context

Integrate the migration copying functionality into the existing `runMigrations()` method to ensure migrations are automatically copied to userData before execution. This completes the lazy initialization pattern and ensures E2E tests and all environments can access migration files.

## Implementation Requirements

### File Location

- **Target File**: `packages/shared/src/services/migrations/MigrationService.ts`
- **Method**: `runMigrations()` at lines 31-126

### Technical Approach

1. **Add Migration Copying to Workflow**
   - Call `ensureMigrationsInUserData()` at the beginning of `runMigrations()`
   - Add proper error handling and logging integration
   - Ensure copying happens before migration discovery and execution

2. **Update runMigrations Method**

   ```typescript
   async runMigrations(): Promise<MigrationExecutionResult> {
     const errors: MigrationExecutionError[] = [];
     let migrationsRun = 0;
     let currentVersion = 0;

     try {
       logger.info("Starting migration process", { path: this.migrationsPath });

       // NEW: Ensure migrations are available in userData
       await this.ensureMigrationsInUserData();

       // Initialize tracking table
       await this.tracking.ensureMigrationsTable();

       // Continue with existing logic...
     } catch (error) {
       // Enhanced error handling for copy failures
     }
   }
   ```

3. **Error Handling Integration**
   - Ensure migration copy errors are properly propagated
   - Add specific error handling for copy failures vs execution failures
   - Maintain existing error handling patterns for migration execution

4. **Logging Enhancement**
   - Add timing information for copy operation
   - Include copy operation in overall migration process logging
   - Ensure log messages are clear about copy vs execution phases

## Detailed Acceptance Criteria

### Workflow Integration

- **AC1**: `ensureMigrationsInUserData()` is called before any migration discovery
- **AC2**: Copy operation errors stop the migration process with clear error messages
- **AC3**: Successful copy operation is logged as part of migration process
- **AC4**: Existing migration execution logic remains unchanged after copy integration

### Error Handling

- **AC5**: Copy failures result in descriptive MigrationError with appropriate error codes
- **AC6**: Copy errors are distinguished from migration execution errors in logs
- **AC7**: Application startup fails gracefully with user-friendly error for copy failures
- **AC8**: Error context includes both copy and migration execution information

### Performance Integration

- **AC9**: Copy operation adds minimal overhead when migrations already exist (< 50ms)
- **AC10**: Copy operation completes quickly for typical migration sets (< 500ms)
- **AC11**: Overall migration process timing includes copy operation duration
- **AC12**: Copy operation doesn't block other initialization processes unnecessarily

### Logging Integration

- **AC13**: Migration process logs include copy operation timing and results
- **AC14**: Log messages clearly distinguish copy phase from execution phase
- **AC15**: Success logs include information about copied vs existing migrations
- **AC16**: Error logs provide clear guidance for troubleshooting copy vs execution issues

### Testing Requirements

- **AC17**: Unit tests verify copy integration doesn't break existing migration logic
- **AC18**: Tests validate error propagation from copy failures
- **AC19**: Tests ensure proper logging of integrated copy and execution workflow
- **AC20**: Tests verify timing and performance characteristics of integrated workflow

## Security Considerations

- **Error Information Disclosure**: Ensure copy errors don't expose sensitive file paths
- **Process Security**: Maintain existing security patterns for migration execution
- **Access Control**: Copy operation respects existing file system security measures

## Dependencies

- **ensureMigrationsInUserData()**: Implemented in previous task
- **getMigrationsPath()**: Updated to use userData directory
- **Existing Migration Logic**: Must integrate without breaking current functionality

## Testing Implementation

Include unit tests in the same task:

```typescript
describe("MigrationService.runMigrations integration", () => {
  it("should copy migrations before executing", async () => {
    // Verify copy is called before migration execution
  });

  it("should handle copy failures gracefully", async () => {
    // Test error handling when copy fails
  });

  it("should skip copy when migrations exist and proceed normally", async () => {
    // Test normal flow when migrations already copied
  });

  it("should include copy timing in migration process logs", async () => {
    // Verify logging includes copy operation information
  });

  it("should maintain backward compatibility with existing migration logic", async () => {
    // Ensure no regressions in migration execution
  });
});
```

## Integration Points

- **MainProcessServices.runDatabaseMigrations()**: Will call the updated runMigrations method
- **Application Startup**: Copy failures should be handled at startup level
- **E2E Test Environment**: Should automatically copy migrations before test execution

## Backward Compatibility

- **Existing Installations**: Should work without manual intervention
- **Migration File Format**: No changes to existing migration file structure
- **API Compatibility**: `runMigrations()` maintains same interface and return type

## Performance Monitoring

- **Startup Metrics**: Track copy operation impact on application startup time
- **Success Rates**: Monitor copy operation success across different environments
- **Error Rates**: Track and categorize copy vs execution failures

## Success Criteria

- Migration copying is seamlessly integrated into existing workflow
- E2E tests successfully execute migrations after automatic copying
- Normal application startup continues to work without regression
- Clear distinction between copy and execution phases in logs and errors
- Comprehensive unit test coverage of integrated functionality
- No performance degradation in existing migration execution

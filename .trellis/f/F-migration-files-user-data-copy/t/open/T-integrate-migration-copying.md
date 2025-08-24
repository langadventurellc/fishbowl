---
id: T-integrate-migration-copying
title: Integrate migration copying with runDatabaseMigrations
status: open
priority: high
parent: F-migration-files-user-data-copy
prerequisites:
  - T-implement-migration-file-1
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T06:09:04.477Z
updated: 2025-08-24T06:09:04.477Z
---

# Integrate migration copying with runDatabaseMigrations

## Context

This task integrates the migration copying functionality into the existing `runDatabaseMigrations()` method, ensuring migrations are copied to userData before MigrationService attempts to execute them. This completes the core feature implementation.

**Related Feature**: F-migration-files-user-data-copy - Migration Files User Data Copy
**File Location**: `apps/desktop/src/main/services/MainProcessServices.ts`
**Prerequisites**: T-implement-migration-file-1 (copying logic)

## Implementation Requirements

### Update runDatabaseMigrations() method

Modify the existing method to call migration copying before running migrations:

```typescript
async runDatabaseMigrations(): Promise<void> {
  try {
    this.logger.info("Starting database migrations");

    // NEW: Ensure migrations are copied to userData first
    await this.ensureMigrationsInUserData();

    // EXISTING: Run migrations as before (MigrationService unchanged)
    const result = await this.migrationService.runMigrations();

    if (result.success) {
      this.logger.info("Database migrations completed successfully", {
        migrationsRun: result.migrationsRun,
        currentVersion: result.currentVersion,
      });
    } else {
      const errorDetails = result.errors
        ?.map((e) => `${e.filename}: ${e.error}`)
        .join(", ");
      this.logger.error(
        `Database migrations failed - ran ${result.migrationsRun} migrations, errors: ${errorDetails}`,
      );
      throw new Error(`Database migrations failed: ${errorDetails}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    this.logger.error(
      "Migration execution failed",
      error instanceof Error ? error : undefined,
    );
    throw new Error(`Migration execution failed: ${errorMessage}`);
  }
}
```

### Add error handling for copy failures

Ensure migration copying failures are properly handled and don't leave the system in an inconsistent state:

```typescript
// Error handling should distinguish between:
// 1. Copy failures (before migration execution)
// 2. Migration execution failures (existing logic)
```

## Technical Approach

1. **Pre-migration setup**: Call ensureMigrationsInUserData() before existing logic
2. **Error propagation**: Let copy errors bubble up to prevent migration execution
3. **Logging integration**: Use existing logger pattern for consistency
4. **Preserve existing behavior**: Keep all existing error handling and success logging
5. **Performance monitoring**: Track total migration process time including copying

## Acceptance Criteria

### Integration Requirements

- **AC1**: ensureMigrationsInUserData() is called before migrationService.runMigrations()
- **AC2**: Copy failures prevent migration execution and bubble up as errors
- **AC3**: Existing migration execution logic remains completely unchanged
- **AC4**: Success and error logging includes both copying and execution phases
- **AC5**: Method signature and return behavior unchanged for compatibility

### Error Handling Requirements

- **AC6**: Copy failures are distinguishable from migration execution failures
- **AC7**: Error messages include context about which phase failed
- **AC8**: Failed copy operations don't leave partial files in userData
- **AC9**: Migration execution errors still follow existing error handling patterns

### Performance Requirements

- **AC10**: Total migration process time (copy + execution) logged for monitoring
- **AC11**: Copy phase adds minimal overhead when files already exist
- **AC12**: No significant impact on application startup time

### Logging Requirements

- **AC13**: Copy phase is logged as part of migration process
- **AC14**: Both copy and execution phases have clear log markers
- **AC15**: Error logs indicate whether copy or execution phase failed
- **AC16**: Success logs include total process timing information

## Dependencies

- **Prerequisites**: T-implement-migration-file-1 (ensureMigrationsInUserData method)
- **Uses**: Existing migrationService, logger from MainProcessServices
- **Enables**: Complete migration copying feature functionality

## Security Considerations

- Ensure copy failures don't expose sensitive file paths in error messages
- Maintain existing security properties of migration execution
- Use existing error handling patterns to avoid information leakage

## Testing Requirements

### Unit Tests (include in implementation)

- Test successful migration process (copy + execution)
- Test copy failure prevents migration execution
- Test migration execution failure handling (existing behavior preserved)
- Test logging output for both success and failure scenarios
- Mock both ensureMigrationsInUserData() and migrationService.runMigrations()

### Integration Tests

- Test complete flow with actual migration files
- Verify E2E tests now successfully execute migrations
- Test behavior with empty userData directory
- Test behavior with existing migrations in userData

### Regression Tests

- Verify existing migration execution behavior unchanged
- Test error handling matches previous behavior for migration failures
- Confirm method interface compatibility with existing callers

## Implementation Notes

- Preserve exact existing error handling patterns for migration execution
- Add copy phase error handling without changing existing patterns
- Use existing logger instance and logging format
- Maintain TypeScript strict type checking compliance
- Keep method signature identical for backward compatibility

## Success Verification

After implementation:

1. **E2E tests should pass**: Test suite should successfully execute migrations
2. **Development environment unchanged**: Normal app startup should work as before
3. **Performance maintained**: Copy overhead should be minimal for repeat startups
4. **Error handling preserved**: Migration execution errors should behave exactly as before

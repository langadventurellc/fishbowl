---
id: F-migration-files-user-data-copy
title: Migration Files User Data Copy
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  apps/desktop/src/main/services/MainProcessServices.ts: Added
    getSourceMigrationsPath() method for environment-aware source path
    detection, updated getMigrationsPath() to always use userData directory, and
    implemented validateMigrationPaths() for security validation; Added
    ensureMigrationsInUserData() and copyMigrationsToUserData() methods with
    lazy initialization, atomic file copying, migration pattern filtering, and
    comprehensive error handling. Updated runDatabaseMigrations() to ensure
    migrations are copied before execution.; Integration already completed -
    runDatabaseMigrations() method calls ensureMigrationsInUserData() before
    migration execution with proper error handling and logging
  apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts:
    Added comprehensive unit tests for new migration path methods covering
    packaged apps, development environments, path validation, and error handling
    scenarios; Added comprehensive unit test suite for migration copying
    functionality covering 12 test scenarios including skip logic, successful
    copying, error handling, pattern filtering, performance tracking, and
    integration with runDatabaseMigrations.; Comprehensive test coverage already
    exists for migration copying integration including error scenarios and
    success flows
log: []
schema: v1.0
childrenIds:
  - T-add-comprehensive-unit-tests
  - T-integrate-migration-copying
  - T-validate-e2e-test-migration
  - T-implement-migration-file-1
  - T-implement-source-migration
created: 2025-08-24T05:33:23.346Z
updated: 2025-08-24T05:33:23.346Z
---

# Migration Files User Data Copy

## Purpose and Functionality

Implement automatic copying of database migration files to the userData directory to ensure migrations work consistently across all environments (development, E2E tests, production). This solves the current issue where E2E tests can create the database and migrations table but cannot find the actual migration files to execute.

## Problem Context

Currently, the `getMigrationsPath()` method uses different logic for packaged vs development environments, and the path resolution fails in E2E tests:

- **Development**: Works because relative path resolution finds project root migrations
- **E2E Tests**: Fails because working directory context differs, migrations table gets created but no files found/executed
- **Packaged Apps**: Will work but uses different code path

The solution is to **always copy migrations to userData** and **always run from userData** for consistency.

## Key Components to Implement

### 1. MainProcessServices Enhancement (Desktop-Specific)

- Add migration file discovery and copying logic to `MainProcessServices`
- Implement in `runDatabaseMigrations()` before calling `MigrationService`
- Handle file system operations with proper error handling
- Support all environments (development, E2E tests, packaged apps)

### 2. Path Resolution Simplification

- Modify `MainProcessServices.getMigrationsPath()` to always return userData path
- Remove app.isPackaged branching logic - always use `userData/migrations`
- Ensure MigrationService (shared package) remains unchanged

### 3. Lazy Initialization Pattern

- Implement one-time copying on first migration service usage
- Skip copying if migrations already exist in userData
- Follow established pattern used by RolesRepository

### 4. Source Path Detection (Desktop-Specific)

- Create robust method in MainProcessServices to locate source migrations
- Handle different environments:
  - **Development/E2E**: Project root migrations folder
  - **Packaged**: Bundled app resources migrations folder
- Maintain compatibility with existing migration file structure

## Detailed Acceptance Criteria

### Functional Behavior

- **AC1**: Migration files are automatically copied to userData/migrations/ before first migration execution
- **AC2**: Subsequent application starts skip copying if files already exist in userData
- **AC3**: E2E tests successfully run database migrations and create expected tables
- **AC4**: Normal application startup continues to work without regression
- **AC5**: Packaged applications will copy from bundled resources to userData
- **AC6**: MigrationService (shared package) discovers and executes migrations from userData directory

### File System Operations

- **AC7**: Source migration files are discovered regardless of execution environment
- **AC8**: Copying preserves original file names and maintains execution order (001\_\*.sql pattern)
- **AC9**: Atomic copying prevents partial migration sets in userData directory
- **AC10**: File system errors are handled gracefully with appropriate logging

### Error Handling

- **AC11**: Missing source migrations directory logs warning but doesn't crash application
- **AC12**: Copy failures are logged with specific error details
- **AC13**: Partial copy scenarios are detected and trigger re-copy on next startup
- **AC14**: Permission errors provide clear user-friendly error messages

### Environment Compatibility

- **AC15**: Works in development environment (npm run dev:desktop)
- **AC16**: Works in E2E test environment (Playwright execution)
- **AC17**: Works in packaged application environment
- **AC18**: Path resolution works regardless of working directory or app launch context

## Technical Requirements

### Architecture Constraints

- **CRITICAL**: Keep MigrationService (shared package) completely unchanged
- **CRITICAL**: No Electron-specific code in shared packages
- All Electron-specific logic must be in `apps/desktop/src/main/services/MainProcessServices.ts`
- Use existing FileSystemBridge and PathUtils abstractions from MainProcessServices

### File System Integration

- Utilize existing NodeFileSystemBridge from MainProcessServices for file operations
- Implement proper directory creation if userData/migrations doesn't exist
- Use atomic operations where possible to prevent corruption

### Logging and Monitoring

- Add structured logging using existing MainProcessServices logger
- Include timing information for performance monitoring
- Log source and destination paths for debugging

## Dependencies

- **Internal**: Depends on existing MainProcessServices, FileSystemBridge, PathUtils
- **External**: No new external dependencies required
- **Shared Package**: No changes to MigrationService or any shared code
- **Prerequisite Features**: None - this is a standalone feature

## Implementation Guidance

### 1. MainProcessServices Enhancement Only

```typescript
class MainProcessServices {
  async runDatabaseMigrations(): Promise<void> {
    // NEW: Ensure migrations are copied to userData first
    await this.ensureMigrationsInUserData();

    // EXISTING: Run migrations as before (MigrationService unchanged)
    const result = await this.migrationService.runMigrations();
    // ... rest unchanged
  }

  private async ensureMigrationsInUserData(): Promise<void> {
    // Check if already copied
    // Discover source migrations using getSourceMigrationsPath()
    // Copy to userData atomically using existing fileSystemBridge
  }

  private getSourceMigrationsPath(): string {
    if (app.isPackaged) {
      return path.join(app.getAppPath(), "migrations"); // From app bundle
    } else {
      // Development/E2E: Find project root migrations
      const appPath = app.getAppPath();
      const projectRoot = path.resolve(appPath, "..", "..");
      return path.join(projectRoot, "migrations");
    }
  }

  private getMigrationsPath(): string {
    // SIMPLIFIED: Always return userData path
    return path.join(app.getPath("userData"), "migrations");
  }
}
```

### 2. No Changes to Shared Package

- MigrationService remains completely unchanged
- All platform-specific logic contained in MainProcessServices
- Existing migration file discovery and execution logic preserved

## Testing Requirements

### Unit Tests

- Test MainProcessServices.ensureMigrationsInUserData() with various scenarios
- Test source path detection logic with mocked app.isPackaged states
- Test copy operation with mocked file system
- Test error handling scenarios (permission denied, disk full, etc.)
- Test skip logic when files already exist

### Integration Tests

- Verify E2E tests execute migrations successfully after copying
- Test normal application startup continues to work
- Verify migration execution from userData directory
- Test packaged app scenario (if possible in test environment)

### Manual Testing

- Clean userData directory and verify automatic copying
- Run E2E tests and confirm database tables are created
- Test with different migration file sets and verify all are copied

## Security Considerations

### File System Access

- Validate source and destination paths to prevent directory traversal
- Ensure proper permissions on created directories and files
- Use secure file operations through existing FileSystemBridge

### Input Validation

- Validate migration file names match expected pattern (001\_\*.sql)
- Verify source directory exists before attempting copy operations
- Sanitize any error messages that include file paths

## Performance Requirements

### Startup Impact

- Migration copying should complete within 500ms for typical migration sets
- Should not significantly delay application startup
- Optimize for common case where files already exist (fast skip check)

### Resource Usage

- Memory usage should scale linearly with number of migration files
- Use existing FileSystemBridge for efficient file operations
- Minimize temporary resource usage during copying

## Migration Strategy

### Backward Compatibility

- Existing installations continue to work without manual intervention
- No breaking changes to migration file format or naming
- Graceful handling of applications with existing userData migrations
- No changes to migration execution logic or shared code

### Rollback Considerations

- Copying operation is additive only (no deletion of existing files)
- Original project migrations remain untouched
- Safe to revert code changes without data loss
- MigrationService behavior unchanged for rollback safety

## Success Metrics

- E2E tests pass migration execution consistently
- Application startup time impact < 100ms
- Zero migration-related crashes in E2E test suite
- Successful migration execution logs in all environments
- Packaged application migration execution works correctly

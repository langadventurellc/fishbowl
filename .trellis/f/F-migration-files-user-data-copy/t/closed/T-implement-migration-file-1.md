---
id: T-implement-migration-file-1
title: Implement migration file discovery and copying logic
status: done
priority: high
parent: F-migration-files-user-data-copy
prerequisites:
  - T-implement-source-migration
affectedFiles:
  apps/desktop/src/main/services/MainProcessServices.ts: Added
    ensureMigrationsInUserData() and copyMigrationsToUserData() methods with
    lazy initialization, atomic file copying, migration pattern filtering, and
    comprehensive error handling. Updated runDatabaseMigrations() to ensure
    migrations are copied before execution.
  apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts:
    Added comprehensive unit test suite for migration copying functionality
    covering 12 test scenarios including skip logic, successful copying, error
    handling, pattern filtering, performance tracking, and integration with
    runDatabaseMigrations.
log:
  - >-
    Successfully implemented migration file discovery and copying logic for
    MainProcessServices with comprehensive testing and validation.


    **Key Achievements:**

    - ✅ Added `ensureMigrationsInUserData()` method implementing lazy
    initialization pattern that checks if migration files already exist in
    userData before triggering copying

    - ✅ Implemented `copyMigrationsToUserData()` method with atomic file
    copying, proper migration pattern filtering (001_*.sql), performance timing,
    and robust error handling

    - ✅ Integrated migration copying into `runDatabaseMigrations()` workflow to
    ensure files are available before migration execution

    - ✅ Added comprehensive unit tests covering all scenarios: skip logic, file
    copying, error handling, pattern filtering, and performance tracking

    - ✅ All quality checks passing: linting, formatting, and TypeScript
    compilation successful


    **Technical Implementation:**

    - Used `getDirectoryStats()` and `readdir()` from NodeFileSystemBridge for
    file system operations

    - Implemented migration pattern filtering to copy only files matching
    `^\d{3}_.*\.sql$` regex

    - Added performance monitoring with timing logs for migration copying
    operations  

    - Graceful error handling with detailed logging for missing directories and
    file system errors

    - Lazy initialization prevents unnecessary copying on subsequent application
    starts


    **Security & Performance:**

    - Validated file patterns to ensure only legitimate migration files are
    copied

    - Used existing NodeFileSystemBridge abstraction for secure file operations

    - Performance optimized with skip checks when files already exist

    - Comprehensive error handling prevents application crashes on file system
    issues


    **Testing Coverage:**

    - 12 comprehensive unit tests covering all code paths and edge cases

    - Tests for successful copying, skip logic, error scenarios, pattern
    filtering

    - Integration tests verifying migration copying works within
    runDatabaseMigrations flow

    - Mock-based testing ensuring isolation from actual file system operations


    This implementation enables consistent migration execution across all
    environments (development, E2E tests, packaged apps) by ensuring migration
    files are always available in the userData directory.
schema: v1.0
childrenIds: []
created: 2025-08-24T06:08:35.075Z
updated: 2025-08-24T06:08:35.075Z
---

# Implement migration file discovery and copying logic

## Context

This task implements the core file copying functionality that discovers source migration files and atomically copies them to the userData directory. It follows the lazy initialization pattern established by RolesRepository.

**Related Feature**: F-migration-files-user-data-copy - Migration Files User Data Copy
**File Location**: `apps/desktop/src/main/services/MainProcessServices.ts`
**Prerequisites**: T-implement-source-migration (path detection logic)

## Implementation Requirements

### Add ensureMigrationsInUserData() method

Create the main copying method that handles lazy initialization:

```typescript
private async ensureMigrationsInUserData(): Promise<void> {
  const destinationPath = this.getMigrationsPath();

  // Skip if already copied (lazy initialization)
  if (await this.fileSystemBridge.exists(destinationPath)) {
    const files = await this.fileSystemBridge.readdir(destinationPath);
    const sqlFiles = files.filter(f => f.endsWith('.sql'));
    if (sqlFiles.length > 0) {
      this.logger.debug("Migration files already exist in userData", {
        path: destinationPath,
        fileCount: sqlFiles.length
      });
      return;
    }
  }

  // Discover and copy migrations
  await this.copyMigrationsToUserData();
}
```

### Add copyMigrationsToUserData() helper method

Implement atomic copying logic:

```typescript
private async copyMigrationsToUserData(): Promise<void> {
  const sourcePath = this.getSourceMigrationsPath();
  const destinationPath = this.getMigrationsPath();

  try {
    // Validate source directory exists
    if (!(await this.fileSystemBridge.exists(sourcePath))) {
      this.logger.warn("Source migrations directory not found", { sourcePath });
      return; // Don't crash app, just log warning
    }

    // Discover .sql files
    const files = await this.fileSystemBridge.readdir(sourcePath);
    const migrationFiles = files.filter(f => f.match(/^\d{3}_.*\.sql$/));

    if (migrationFiles.length === 0) {
      this.logger.warn("No migration files found in source directory", { sourcePath });
      return;
    }

    // Create destination directory
    await this.fileSystemBridge.ensureDir(destinationPath);

    // Copy files atomically
    const startTime = Date.now();
    for (const filename of migrationFiles) {
      const sourceFile = path.join(sourcePath, filename);
      const destFile = path.join(destinationPath, filename);
      await this.fileSystemBridge.copyFile(sourceFile, destFile);
    }

    const duration = Date.now() - startTime;
    this.logger.info("Migration files copied successfully", {
      sourcePath,
      destinationPath,
      fileCount: migrationFiles.length,
      durationMs: duration
    });

  } catch (error) {
    this.logger.error("Failed to copy migration files", error as Error);
    throw new Error(`Migration file copying failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Technical Approach

1. **Lazy initialization**: Check if files already exist before copying
2. **Directory creation**: Use existing fileSystemBridge.ensureDir()
3. **File discovery**: Filter for migration pattern (001\_\*.sql)
4. **Atomic copying**: Copy files one by one with error handling
5. **Performance tracking**: Log timing for monitoring
6. **Error handling**: Graceful handling with detailed logging

## Acceptance Criteria

### Functional Requirements

- **AC1**: Migration files are copied to userData/migrations/ directory
- **AC2**: Subsequent calls skip copying if files already exist (lazy initialization)
- **AC3**: Only files matching migration pattern (001\_\*.sql) are copied
- **AC4**: File names and order are preserved during copying
- **AC5**: Destination directory is created if it doesn't exist

### Error Handling Requirements

- **AC6**: Missing source directory logs warning but doesn't crash application
- **AC7**: Copy failures throw errors with descriptive messages
- **AC8**: Partial copy scenarios are handled (cleanup or retry logic)
- **AC9**: File permission errors are caught and reported clearly

### Performance Requirements

- **AC10**: Copy operation completes within 500ms for typical migration sets
- **AC11**: Memory usage scales linearly with file count
- **AC12**: Skip check is optimized for fast execution when files exist

### Logging Requirements

- **AC13**: Copy operations are logged with timing and file counts
- **AC14**: Source and destination paths are logged for debugging
- **AC15**: Warnings for missing source directory are logged
- **AC16**: All errors include sufficient context for troubleshooting

## Dependencies

- **Prerequisites**: T-implement-source-migration (getSourceMigrationsPath, getMigrationsPath)
- **Uses**: Existing fileSystemBridge, logger from MainProcessServices
- **Blocks**: T-integrate-migration-copy (integration with runDatabaseMigrations)

## Security Considerations

- Validate source files match expected migration naming pattern
- Ensure destination path stays within userData directory
- Use secure file operations through FileSystemBridge abstraction
- Sanitize file paths in error messages and logs

## Testing Requirements

### Unit Tests (include in implementation)

- Test ensureMigrationsInUserData() with existing files (skip scenario)
- Test ensureMigrationsInUserData() with missing files (copy scenario)
- Test copyMigrationsToUserData() with various file sets
- Test error handling for missing source directory
- Test error handling for file permission issues
- Mock FileSystemBridge operations for isolated testing

### Performance Tests

- Verify copy operation timing stays under 500ms threshold
- Test with different numbers of migration files (1, 5, 20 files)
- Monitor memory usage during copy operations

### Error Scenario Tests

- Test behavior when source directory doesn't exist
- Test behavior when destination directory can't be created
- Test behavior when individual file copy fails
- Test partial copy recovery scenarios

## Implementation Notes

- Follow RolesRepository pattern for lazy initialization
- Use existing FileSystemBridge methods for all file operations
- Maintain consistent logging format with existing MainProcessServices methods
- Handle async operations properly with try/catch blocks
- Preserve TypeScript strict typing throughout implementation

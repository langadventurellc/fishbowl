---
id: T-implement-migration-files
title: Implement migration files copying service
status: open
priority: high
parent: F-migration-files-user-data-copy
prerequisites:
  - T-add-source-migration-path
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T05:36:11.498Z
updated: 2025-08-24T05:36:11.498Z
---

# Implement migration files copying service

## Context

Implement the core functionality to copy migration files from source project directory to userData/migrations directory. This follows the lazy initialization pattern established by RolesRepository and ensures migrations are available for execution in all environments.

## Implementation Requirements

### File Location

- **Target File**: `packages/shared/src/services/migrations/MigrationService.ts`
- **Integration**: Add new private method to existing MigrationService class

### Technical Approach

1. **Add Migration Copying Method**

   ```typescript
   private async copyMigrationsToUserData(): Promise<void> {
     const sourcePath = this.getSourceMigrationsPath();
     const destinationPath = this.migrationsPath; // userData/migrations

     logger.info("Copying migrations to userData", {
       source: sourcePath,
       destination: destinationPath
     });

     // Create destination directory if it doesn't exist
     await this.fileSystemBridge.ensureDirectory(destinationPath);

     // Get list of migration files from source
     const migrationFiles = await this.discovery.discoverMigrations(sourcePath);

     // Copy each file atomically
     for (const migration of migrationFiles) {
       const sourcePath = migration.path;
       const destPath = path.join(destinationPath, migration.filename);
       await this.fileSystemBridge.copyFile(sourcePath, destPath);
     }

     logger.info("Migration copying completed", {
       filesCopied: migrationFiles.length,
       destination: destinationPath
     });
   }
   ```

2. **Add Check for Existing Migrations**

   ```typescript
   private async migrationsExistInUserData(): Promise<boolean> {
     try {
       const exists = await this.fileSystemBridge.exists(this.migrationsPath);
       if (!exists) return false;

       const files = await this.fileSystemBridge.readDirectory(this.migrationsPath);
       const sqlFiles = files.filter(f => f.endsWith('.sql'));

       logger.debug("Checking existing migrations in userData", {
         path: this.migrationsPath,
         sqlFilesFound: sqlFiles.length
       });

       return sqlFiles.length > 0;
     } catch (error) {
       logger.warn("Error checking existing migrations", { error });
       return false;
     }
   }
   ```

3. **Add Main Initialization Method**
   ```typescript
   private async ensureMigrationsInUserData(): Promise<void> {
     // Skip if migrations already exist in userData
     if (await this.migrationsExistInUserData()) {
       logger.debug("Migrations already exist in userData, skipping copy");
       return;
     }

     try {
       await this.copyMigrationsToUserData();
     } catch (error) {
       logger.error("Failed to copy migrations to userData", { error });
       throw new MigrationError(
         MigrationErrorCode.MIGRATION_COPY_FAILED,
         `Failed to copy migrations: ${error instanceof Error ? error.message : String(error)}`,
         undefined,
         { originalError: error },
         error instanceof Error ? error : undefined
       );
     }
   }
   ```

## Detailed Acceptance Criteria

### File System Operations

- **AC1**: Creates userData/migrations directory if it doesn't exist
- **AC2**: Copies all .sql files from source to destination maintaining filenames
- **AC3**: Preserves migration file ordering (001*\*, 002*\*, etc.)
- **AC4**: Uses atomic file operations to prevent partial copies

### Lazy Initialization Logic

- **AC5**: Skips copying if migrations already exist in userData directory
- **AC6**: Detects existing migrations by checking for .sql files in userData/migrations
- **AC7**: Copies migrations only on first execution or when userData is empty
- **AC8**: Handles scenarios where userData directory is partially populated

### Error Handling

- **AC9**: Handles source directory not found with descriptive error
- **AC10**: Handles permission denied errors during directory creation or file copying
- **AC11**: Handles disk space issues during file copying operations
- **AC12**: Provides detailed error context including source and destination paths

### Logging and Monitoring

- **AC13**: Logs copy operation start with source and destination paths
- **AC14**: Logs successful completion with number of files copied
- **AC15**: Logs skip decision when migrations already exist
- **AC16**: Logs detailed error information for troubleshooting

### Testing Requirements

- **AC17**: Unit tests verify copy operation with mocked file system
- **AC18**: Tests validate skip logic when files already exist
- **AC19**: Tests cover error scenarios (missing source, permission denied, disk full)
- **AC20**: Tests verify proper logging at each operation stage

## Security Considerations

- **Path Validation**: Validate all paths are within expected directories
- **File Content Validation**: Ensure only .sql files are copied
- **Permission Handling**: Use appropriate file permissions for copied files
- **Error Message Sanitization**: Avoid exposing sensitive path information

## Dependencies

- **FileSystemBridge**: Use existing abstraction for file operations
- **MigrationDiscovery**: Leverage existing migration file discovery logic
- **MigrationError**: Use existing error types for consistent error handling
- **Logger**: Use existing logger instance for consistent logging

## Testing Implementation

Include unit tests in the same task:

```typescript
describe("MigrationService copying functionality", () => {
  describe("copyMigrationsToUserData", () => {
    it("should copy all migration files to userData directory", async () => {
      // Test successful copying operation
    });

    it("should create destination directory if missing", async () => {
      // Test directory creation
    });

    it("should handle file copy errors gracefully", async () => {
      // Test error handling during copy
    });
  });

  describe("migrationsExistInUserData", () => {
    it("should return true when .sql files exist in userData", async () => {
      // Test detection logic
    });

    it("should return false when directory is empty", async () => {
      // Test empty directory detection
    });
  });

  describe("ensureMigrationsInUserData", () => {
    it("should skip copying when migrations already exist", async () => {
      // Test skip logic
    });

    it("should copy migrations when userData is empty", async () => {
      // Test initial copy scenario
    });
  });
});
```

## Integration Points

- **MigrationService.runMigrations()**: Will call this method at the beginning
- **Error Handling**: Integrates with existing MigrationError system
- **File System**: Uses established FileSystemBridge patterns

## Performance Considerations

- **Startup Impact**: Optimize for common case where files already exist (fast skip)
- **Memory Usage**: Stream file copying for large migration files if needed
- **Atomic Operations**: Ensure partial copy scenarios don't leave inconsistent state

## Success Criteria

- Migration files are reliably copied to userData directory
- Lazy initialization prevents unnecessary copying on subsequent startups
- Comprehensive error handling and logging for troubleshooting
- Unit tests provide full coverage of functionality
- Integration with existing MigrationService architecture

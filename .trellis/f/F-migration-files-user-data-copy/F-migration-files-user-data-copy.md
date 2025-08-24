---
id: F-migration-files-user-data-copy
title: Migration Files User Data Copy
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T05:33:23.346Z
updated: 2025-08-24T05:33:23.346Z
---

# Migration Files User Data Copy

## Purpose and Functionality

Implement automatic copying of database migration files to the userData directory to ensure migrations work consistently across all environments (development, E2E tests, production). This solves the current issue where E2E tests can create the database and migrations table but cannot find the actual migration files to execute.

## Problem Context

Currently, the `getMigrationsPath()` method uses different logic for packaged vs development environments:

- **Development**: Resolves to project root migrations folder via relative paths
- **E2E Tests**: Path resolution fails because working directory context differs
- **Result**: Migrations table gets created but no migration files are found/executed

## Key Components to Implement

### 1. Migration File Discovery and Copying Service

- Create method to discover source migration files from project root
- Implement atomic copying of .sql files to userData/migrations/
- Handle file system operations with proper error handling
- Support both development and packaged environments

### 2. Path Resolution Updates

- Modify `MainProcessServices.getMigrationsPath()` to always return userData path
- Remove app.isPackaged branching logic
- Ensure consistent behavior across all environments

### 3. Lazy Initialization Pattern

- Implement one-time copying on first migration service usage
- Skip copying if migrations already exist in userData
- Follow established pattern used by RolesRepository

### 4. Source Path Detection

- Create robust method to locate source migrations regardless of execution context
- Handle different working directories (normal app vs E2E test execution)
- Maintain compatibility with existing migration file structure

## Detailed Acceptance Criteria

### Functional Behavior

- **AC1**: Migration files are automatically copied to userData/migrations/ on first application startup
- **AC2**: Subsequent application starts skip copying if files already exist in userData
- **AC3**: E2E tests successfully run database migrations and create expected tables
- **AC4**: Normal application startup continues to work without regression
- **AC5**: Migration service discovers and executes copied migrations from userData directory

### File System Operations

- **AC6**: Source migration files are discovered from project root regardless of execution context
- **AC7**: Copying preserves original file names and maintains execution order
- **AC8**: Atomic copying prevents partial migration sets in userData directory
- **AC9**: File system errors are handled gracefully with appropriate logging

### Error Handling

- **AC10**: Missing source migrations directory logs warning but doesn't crash application
- **AC11**: Copy failures are logged with specific error details
- **AC12**: Partial copy scenarios are detected and trigger re-copy on next startup
- **AC13**: Permission errors provide clear user-facing error messages

### Environment Compatibility

- **AC14**: Works in development environment (npm run dev:desktop)
- **AC15**: Works in E2E test environment (Playwright execution)
- **AC16**: Works in packaged application environment
- **AC17**: Path resolution works regardless of working directory

## Technical Requirements

### Architecture Pattern

- Follow the lazy initialization pattern established by RolesRepository
- Use existing FileSystemBridge and PathUtils abstractions
- Integrate with current MigrationService lifecycle

### File System Integration

- Utilize NodeFileSystemBridge for consistent file operations
- Implement proper directory creation if userData/migrations doesn't exist
- Use atomic operations where possible to prevent corruption

### Logging and Monitoring

- Add structured logging for copy operations and path resolution
- Include timing information for performance monitoring
- Log source and destination paths for debugging

## Dependencies

- **Internal**: Depends on existing FileSystemBridge, PathUtils, and MigrationService
- **External**: No new external dependencies required
- **Prerequisite Features**: None - this is a standalone feature

## Implementation Guidance

### 1. MigrationService Enhancement

```typescript
class MigrationService {
  private async ensureMigrationsInUserData(): Promise<void> {
    // Check if already copied
    // Discover source migrations
    // Copy to userData atomically
  }

  private getSourceMigrationsPath(): string {
    // Robust source path detection
  }
}
```

### 2. MainProcessServices Update

```typescript
private getMigrationsPath(): string {
  // Always return userData/migrations
  return path.join(app.getPath("userData"), "migrations");
}
```

### 3. Integration Point

- Call `ensureMigrationsInUserData()` at start of `runMigrations()`
- Ensure proper error propagation and logging

## Testing Requirements

### Unit Tests

- Test source path detection logic with various working directories
- Test copy operation with mocked file system
- Test error handling scenarios (permission denied, disk full, etc.)
- Test skip logic when files already exist

### Integration Tests

- Verify E2E tests execute migrations successfully
- Test normal application startup continues to work
- Verify migration execution after copying

### Manual Testing

- Clean userData directory and verify automatic copying
- Run E2E tests and confirm database tables are created
- Test with different migration file sets

## Security Considerations

### File System Access

- Validate source and destination paths to prevent directory traversal
- Ensure proper permissions on created directories and files
- Use secure file operations to prevent race conditions

### Input Validation

- Validate migration file names match expected pattern (001\_\*.sql)
- Verify file contents are valid SQL before copying
- Sanitize any error messages that include file paths

## Performance Requirements

### Startup Impact

- Migration copying should complete within 500ms for typical migration sets
- Should not significantly delay application startup
- Optimize for common case where files already exist (fast skip)

### Resource Usage

- Memory usage should scale linearly with number of migration files
- Temporary file usage should be minimal during copying
- Disk space usage equivalent to migration file sizes

## Migration Strategy

### Backward Compatibility

- Existing installations continue to work without manual intervention
- No breaking changes to migration file format or naming
- Graceful handling of applications with existing userData migrations

### Rollback Considerations

- Copying operation is additive only (no deletion of existing files)
- Original project migrations remain untouched
- Safe to revert code changes without data loss

## Success Metrics

- E2E tests pass migration execution
- Application startup time impact < 100ms
- Zero migration-related crashes in E2E test suite
- Successful migration execution logs in all environments

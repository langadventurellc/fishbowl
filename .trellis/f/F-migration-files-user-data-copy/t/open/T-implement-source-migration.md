---
id: T-implement-source-migration
title: Implement source migration path detection logic
status: open
priority: high
parent: F-migration-files-user-data-copy
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T06:07:57.544Z
updated: 2025-08-24T06:07:57.544Z
---

# Implement source migration path detection logic

## Context

This task implements the core path detection logic that determines where to find source migration files across different execution environments (development, E2E tests, packaged apps). This is a foundational task that other migration copying tasks depend on.

**Related Feature**: F-migration-files-user-data-copy - Migration Files User Data Copy
**File Location**: `apps/desktop/src/main/services/MainProcessServices.ts`

## Implementation Requirements

### Add getSourceMigrationsPath() method to MainProcessServices

Create a private method that reliably finds source migration files regardless of execution environment:

```typescript
private getSourceMigrationsPath(): string {
  if (app.isPackaged) {
    // Packaged app: migrations bundled in app resources
    return path.join(app.getAppPath(), "migrations");
  } else {
    // Development/E2E: find project root migrations
    const appPath = app.getAppPath();
    const projectRoot = path.resolve(appPath, "..", "..");
    return path.join(projectRoot, "migrations");
  }
}
```

### Update getMigrationsPath() method

Simplify the existing method to always return userData path:

```typescript
private getMigrationsPath(): string {
  // Always return userData path for consistent behavior
  return path.join(app.getPath("userData"), "migrations");
}
```

### Add path validation helper

Create helper method for validating paths:

```typescript
private validateMigrationPaths(sourcePath: string, destinationPath: string): void {
  // Validate source path exists and contains .sql files
  // Validate destination path is within userData directory
  // Log validation results
}
```

## Technical Approach

1. **Import required modules**: Ensure `path` and `app` from Electron are available
2. **Implement getSourceMigrationsPath()**: Handle both packaged and development scenarios
3. **Update getMigrationsPath()**: Remove existing branching logic, always use userData
4. **Add validation**: Implement basic path security validation
5. **Add logging**: Use existing logger to track path resolution
6. **Write unit tests**: Mock Electron app methods and test both code paths

## Acceptance Criteria

### Functional Requirements

- **AC1**: getSourceMigrationsPath() returns correct path for packaged apps (app.getAppPath()/migrations)
- **AC2**: getSourceMigrationsPath() returns correct path for development (projectRoot/migrations)
- **AC3**: getMigrationsPath() always returns userData/migrations path
- **AC4**: Path validation prevents directory traversal attacks
- **AC5**: All path operations are logged with appropriate detail level

### Security Requirements

- **AC6**: Source and destination paths are validated for security
- **AC7**: Path resolution sanitizes any user input or environment variables
- **AC8**: Error messages don't expose sensitive file system paths

### Testing Requirements

- **AC9**: Unit tests cover both app.isPackaged states (true/false)
- **AC10**: Unit tests verify path validation logic
- **AC11**: Unit tests mock Electron app.getPath() and app.getAppPath()
- **AC12**: Tests verify logging output for debugging

## Dependencies

- **Prerequisites**: None - this is the foundational task
- **Blocks**: All other migration copying tasks depend on this
- **Uses**: Existing MainProcessServices logger and Electron app APIs

## Security Considerations

- Validate all resolved paths stay within expected directories
- Prevent directory traversal through path.resolve() validation
- Sanitize logged paths to avoid exposing sensitive information
- Use existing FileSystemBridge abstractions for secure operations

## Testing Requirements

### Unit Tests (include in implementation)

- Test getSourceMigrationsPath() with app.isPackaged = true
- Test getSourceMigrationsPath() with app.isPackaged = false
- Test getMigrationsPath() returns consistent userData path
- Test path validation with various input scenarios
- Mock Electron APIs (app.getPath, app.getAppPath, app.isPackaged)

### Verification Steps

- Run existing MainProcessServices tests to ensure no regression
- Verify new unit tests achieve >90% coverage of new code
- Test path resolution manually in development environment

## Implementation Notes

- Follow existing MainProcessServices patterns for private methods
- Use existing logger instance for consistent logging format
- Maintain TypeScript strict type checking compliance
- Preserve existing method signatures and behavior where unchanged

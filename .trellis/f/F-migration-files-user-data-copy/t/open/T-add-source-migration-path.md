---
id: T-add-source-migration-path
title: Add source migration path discovery method
status: open
priority: high
parent: F-migration-files-user-data-copy
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T05:35:31.274Z
updated: 2025-08-24T05:35:31.274Z
---

# Add source migration path discovery method

## Context

To copy migration files to userData, we need a robust method to discover the original migration files from the project root, regardless of execution context (development, E2E tests, packaged app). This task implements source path detection following patterns established in the codebase.

## Implementation Requirements

### File Location

- **Target File**: `packages/shared/src/services/migrations/MigrationService.ts`
- **Integration**: Add new private method to existing MigrationService class

### Technical Approach

1. **Add Source Path Discovery Method**

   ```typescript
   private getSourceMigrationsPath(): string {
     // Development and test environments: resolve from project root
     if (!app.isPackaged) {
       const appPath = app.getAppPath();
       const projectRoot = path.resolve(appPath, "..", "..");
       return path.join(projectRoot, "migrations");
     }

     // Production: migrations should be bundled with app resources
     const appPath = app.getAppPath();
     return path.join(appPath, "migrations");
   }
   ```

2. **Path Validation Logic**
   - Verify that the discovered path exists using FileSystemBridge
   - Handle cases where source migrations directory is not found
   - Log source path resolution for debugging

3. **Error Handling**
   - Graceful handling when source directory doesn't exist
   - Appropriate logging for path resolution failures
   - Ensure method doesn't crash the application

4. **Integration with Existing Patterns**
   - Use existing FileSystemBridge for path operations
   - Follow logging patterns established in the class
   - Maintain consistency with existing method signatures

## Detailed Acceptance Criteria

### Functional Requirements

- **AC1**: Method correctly resolves source migrations path in development environment
- **AC2**: Method correctly resolves source migrations path in E2E test environment
- **AC3**: Method correctly resolves source migrations path in packaged environment
- **AC4**: Method returns absolute path to migrations directory

### Path Resolution Logic

- **AC5**: Development/test: resolves to `${projectRoot}/migrations`
- **AC6**: Production: resolves to `${appPath}/migrations`
- **AC7**: Path resolution works regardless of current working directory
- **AC8**: Method validates that resolved path exists before returning

### Error Handling

- **AC9**: Throws descriptive error when source migrations directory not found
- **AC10**: Logs path resolution attempts and results
- **AC11**: Error messages include context about environment and attempted paths
- **AC12**: Graceful handling of permission or access issues

### Testing Requirements

- **AC13**: Unit tests cover all environment scenarios (dev, test, packaged)
- **AC14**: Tests verify path resolution with various app path configurations
- **AC15**: Tests validate error handling when source directory missing
- **AC16**: Tests ensure logging includes appropriate debugging information

## Security Considerations

- **Path Traversal Prevention**: Validate resolved paths don't escape expected directories
- **Error Message Sanitization**: Avoid exposing sensitive path information in errors
- **File System Access**: Use existing FileSystemBridge abstraction for security

## Dependencies

- **FileSystemBridge**: Use existing abstraction for path validation
- **PathUtils**: Leverage existing path manipulation utilities
- **Logger**: Use existing logger instance for consistent logging

## Testing Implementation

Include unit tests in the same task:

```typescript
describe("MigrationService.getSourceMigrationsPath", () => {
  it("should resolve source path in development environment", () => {
    // Mock app.isPackaged = false, test path resolution
  });

  it("should resolve source path in packaged environment", () => {
    // Mock app.isPackaged = true, test path resolution
  });

  it("should throw error when source directory does not exist", () => {
    // Test error handling for missing source
  });

  it("should log path resolution for debugging", () => {
    // Verify appropriate logging
  });
});
```

## Integration Points

- **MigrationService Constructor**: Will use this method during initialization
- **Migration Copying Logic**: Next task will use this to locate source files
- **Error Reporting**: Path resolution errors should integrate with existing error handling

## Success Criteria

- Robust source path detection across all execution environments
- Comprehensive error handling and logging
- Unit tests provide full coverage of scenarios
- Method integrates cleanly with existing MigrationService architecture
- No security vulnerabilities in path resolution logic

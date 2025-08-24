---
id: T-update-getmigrationspath-to
title: Update getMigrationsPath to use userData directory
status: open
priority: high
parent: F-migration-files-user-data-copy
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T05:35:02.104Z
updated: 2025-08-24T05:35:02.104Z
---

# Update getMigrationsPath to use userData directory

## Context

Currently `MainProcessServices.getMigrationsPath()` uses different logic for packaged vs development environments, causing E2E tests to fail because path resolution differs in test execution context. This task simplifies the logic to always use the userData directory, ensuring consistent behavior across all environments.

## Implementation Requirements

### File Location

- **Target File**: `apps/desktop/src/main/services/MainProcessServices.ts`
- **Method**: `getMigrationsPath()` at lines 314-333

### Technical Approach

1. **Simplify Path Resolution**
   - Remove the `app.isPackaged` conditional logic
   - Always return `path.join(app.getPath("userData"), "migrations")`
   - Remove project root path resolution code

2. **Update Method Implementation**

   ```typescript
   private getMigrationsPath(): string {
     const userDataPath = app.getPath("userData");
     const migrationsPath = path.join(userDataPath, "migrations");
     this.logger.debug("Using userData migrations path", {
       path: migrationsPath,
     });
     return migrationsPath;
   }
   ```

3. **Logging Enhancement**
   - Update debug logging to reflect the new consistent path strategy
   - Remove environment-specific logging messages
   - Ensure path is logged for debugging purposes

## Detailed Acceptance Criteria

### Functional Requirements

- **AC1**: Method always returns `${userData}/migrations` regardless of `app.isPackaged` state
- **AC2**: Path resolution works in development, test, and packaged environments
- **AC3**: Debug logging includes the resolved migrations path
- **AC4**: Method maintains the same return type and interface

### Code Quality

- **AC5**: Remove unused variables and conditional logic
- **AC6**: Maintain existing error handling patterns
- **AC7**: Follow existing code style and naming conventions
- **AC8**: Preserve existing JSDoc comments with updated implementation details

### Testing Requirements

- **AC9**: Write unit tests for the simplified path resolution logic
- **AC10**: Test path resolution with mocked `app.getPath("userData")`
- **AC11**: Verify debug logging includes correct path information
- **AC12**: Test that method works regardless of working directory

## Security Considerations

- **Path Validation**: Ensure resolved path is within expected userData directory
- **Error Handling**: Gracefully handle cases where userData path is unavailable
- **Logging Safety**: Sanitize logged paths to avoid exposing sensitive information

## Dependencies

- **Prerequisite**: None - this is the foundation change
- **Blocks**: Migration copying functionality depends on consistent path resolution

## Testing Implementation

Include unit tests in the same task:

```typescript
describe("MainProcessServices.getMigrationsPath", () => {
  it("should always return userData migrations path", () => {
    // Test implementation
  });

  it("should log debug information with resolved path", () => {
    // Test logging
  });

  it("should work regardless of app.isPackaged state", () => {
    // Test both packaged and development scenarios
  });
});
```

## Success Criteria

- Method implementation is simplified and consistent
- All environments use the same path resolution logic
- Unit tests provide comprehensive coverage
- Debug logging helps with troubleshooting path issues
- No breaking changes to existing interface

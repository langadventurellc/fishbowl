---
id: T-add-migrationerror-for-copy
title: Add MigrationError for copy failures
status: open
priority: medium
parent: F-migration-files-user-data-copy
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T05:37:14.052Z
updated: 2025-08-24T05:37:14.052Z
---

# Add MigrationError for copy failures

## Context

Add specific error handling for migration file copying operations by extending the existing MigrationError system. This ensures consistent error reporting and helps distinguish copy failures from migration execution failures.

## Implementation Requirements

### File Locations

- **Primary File**: `packages/shared/src/services/migrations/MigrationError.ts`
- **Integration**: Update error handling in MigrationService copying methods

### Technical Approach

1. **Add New Error Code**

   ```typescript
   export enum MigrationErrorCode {
     // Existing codes...
     MIGRATION_COPY_FAILED = "MIGRATION_COPY_FAILED",
     MIGRATION_SOURCE_NOT_FOUND = "MIGRATION_SOURCE_NOT_FOUND",
     MIGRATION_DESTINATION_ACCESS_DENIED = "MIGRATION_DESTINATION_ACCESS_DENIED",
   }
   ```

2. **Update Error Context Types**

   ```typescript
   export interface MigrationErrorContext {
     // Existing context fields...
     sourcePath?: string;
     destinationPath?: string;
     filesAttempted?: string[];
     filesSuccessful?: string[];
   }
   ```

3. **Add Helper Methods**
   ```typescript
   export class MigrationError extends Error {
     // Existing implementation...

     static createCopyError(
       message: string,
       sourcePath: string,
       destinationPath: string,
       originalError?: Error,
     ): MigrationError {
       return new MigrationError(
         MigrationErrorCode.MIGRATION_COPY_FAILED,
         message,
         undefined,
         {
           sourcePath,
           destinationPath,
           originalError,
         },
         originalError,
       );
     }

     static createSourceNotFoundError(sourcePath: string): MigrationError {
       return new MigrationError(
         MigrationErrorCode.MIGRATION_SOURCE_NOT_FOUND,
         `Migration source directory not found: ${sourcePath}`,
         undefined,
         { sourcePath },
       );
     }
   }
   ```

## Detailed Acceptance Criteria

### Error Code Coverage

- **AC1**: MIGRATION_COPY_FAILED covers general copying operation failures
- **AC2**: MIGRATION_SOURCE_NOT_FOUND covers missing source directory scenarios
- **AC3**: MIGRATION_DESTINATION_ACCESS_DENIED covers permission issues with userData directory
- **AC4**: Error codes integrate with existing MigrationErrorCode enum

### Error Context Enhancement

- **AC5**: Error context includes source and destination paths for copy operations
- **AC6**: Context tracks which files were attempted vs successfully copied
- **AC7**: Original error is preserved in context for debugging
- **AC8**: File paths are sanitized to avoid exposing sensitive information

### Helper Methods

- **AC9**: Static helper methods provide consistent error creation patterns
- **AC10**: Helper methods include appropriate error context automatically
- **AC11**: Methods follow existing patterns in MigrationError class
- **AC12**: Type safety is maintained for all error creation scenarios

### Integration with Copy Logic

- **AC13**: Copy operations use new error types consistently
- **AC14**: Error messages provide clear guidance for troubleshooting
- **AC15**: Errors distinguish between different types of copy failures
- **AC16**: Error handling doesn't break existing migration error patterns

### Testing Requirements

- **AC17**: Unit tests verify new error codes and context fields
- **AC18**: Tests validate helper methods create errors with proper context
- **AC19**: Tests ensure error message formatting is user-friendly
- **AC20**: Tests verify integration with copy operation error handling

## Security Considerations

- **Path Sanitization**: Ensure error messages don't expose sensitive file paths
- **Error Context**: Validate that error context doesn't include sensitive information
- **User-Facing Messages**: Provide helpful errors without security information disclosure

## Dependencies

- **MigrationError**: Extends existing error handling system
- **Migration Copy Logic**: Will use these errors in copy operations
- **Logging System**: Errors should integrate with existing logging patterns

## Testing Implementation

Include unit tests in the same task:

```typescript
describe("MigrationError copy error handling", () => {
  describe("error codes", () => {
    it("should include MIGRATION_COPY_FAILED error code", () => {
      // Test new error code exists
    });

    it("should include source and destination error codes", () => {
      // Test additional error codes
    });
  });

  describe("helper methods", () => {
    it("should create copy error with proper context", () => {
      const error = MigrationError.createCopyError(
        "Copy failed",
        "/source/path",
        "/dest/path",
        new Error("Original error"),
      );
      // Validate error structure and context
    });

    it("should create source not found error", () => {
      const error = MigrationError.createSourceNotFoundError("/missing/path");
      // Validate error code and message
    });
  });

  describe("error context", () => {
    it("should include source and destination paths", () => {
      // Test context fields
    });

    it("should sanitize sensitive path information", () => {
      // Test path sanitization
    });
  });
});
```

## Usage Examples

```typescript
// In copying service
try {
  await this.copyMigrationsToUserData();
} catch (error) {
  throw MigrationError.createCopyError(
    "Failed to copy migrations to userData",
    this.getSourceMigrationsPath(),
    this.migrationsPath,
    error instanceof Error ? error : undefined,
  );
}

// Source validation
if (!(await this.fileSystemBridge.exists(sourcePath))) {
  throw MigrationError.createSourceNotFoundError(sourcePath);
}
```

## Error Message Guidelines

- **Clear Context**: Error messages should clearly indicate copy vs execution phase
- **Actionable Information**: Include guidance on how to resolve copy issues
- **Path Information**: Include relevant paths while sanitizing sensitive information
- **Original Error**: Preserve underlying error information for technical debugging

## Integration Points

- **MigrationService Copy Methods**: Will use new error types for consistent error handling
- **Application Startup**: Copy errors should be handled gracefully at startup level
- **Logging System**: Errors should be logged with appropriate detail level

## Success Criteria

- New error types provide clear distinction for copy-related failures
- Error context includes relevant debugging information
- Helper methods ensure consistent error creation patterns
- Unit tests provide comprehensive coverage of error scenarios
- Integration with existing error handling maintains consistency
- Error messages are user-friendly and actionable

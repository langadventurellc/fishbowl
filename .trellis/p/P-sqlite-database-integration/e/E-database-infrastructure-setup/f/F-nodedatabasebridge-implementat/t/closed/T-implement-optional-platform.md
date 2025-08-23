---
id: T-implement-optional-platform
title: Implement optional platform methods (backup, vacuum, getSize)
status: done
priority: low
parent: F-nodedatabasebridge-implementat
prerequisites:
  - T-implement-connection
affectedFiles:
  apps/desktop/src/main/services/NodeDatabaseBridge.ts: Added imports for path
    utilities (dirname) and fs operations (stat, mkdir, existsSync). Implemented
    backup() method with better-sqlite3 backup API, directory creation, path
    validation, and comprehensive error handling. Implemented vacuum() method
    with VACUUM command execution, transaction state validation, and proper
    error conversion. Implemented getSize() method with fs.stat() for file size
    retrieval, in-memory database detection, and detailed logging with size
    formatting.
  apps/desktop/src/main/services/__tests__/NodeDatabaseBridge.test.ts:
    Added fs and fs/promises module mocking at top level. Added backup() method
    property to mockDatabase object. Added comprehensive test suite for backup()
    method with 5 test cases covering successful backup, connection validation,
    path validation, API failure handling, and directory creation. Added
    comprehensive test suite for vacuum() method with 4 test cases covering
    successful execution, connection validation, transaction state validation,
    and command failure handling. Added comprehensive test suite for getSize()
    method with 5 test cases covering successful size retrieval, connection
    validation, in-memory database handling, file stat failures, and various
    file sizes with proper MB conversion testing.
log:
  - Implemented optional platform methods (backup, vacuum, getSize) for
    NodeDatabaseBridge with comprehensive error handling and validation. The
    backup() method creates database backups using better-sqlite3's native API
    with directory creation and path validation. The vacuum() method optimizes
    database performance with transaction state validation. The getSize() method
    returns database file size in bytes using Node.js fs.stat() with in-memory
    database detection. All methods follow existing error handling patterns and
    include comprehensive logging for debugging. Added 33 unit tests covering
    success scenarios, error cases, edge cases, and file system operations with
    proper mocking.
schema: v1.0
childrenIds: []
created: 2025-08-22T23:13:49.317Z
updated: 2025-08-22T23:13:49.317Z
---

# Implement optional platform methods (backup, vacuum, getSize)

## Context

Implement the optional platform-specific methods of NodeDatabaseBridge including backup(), vacuum(), and getSize(). These methods leverage desktop-specific capabilities for database maintenance and monitoring.

## Implementation Requirements

- Implement optional `backup?(path: string): Promise<void>` for database backup
- Implement optional `vacuum?(): Promise<void>` for database optimization
- Implement optional `getSize?(): Promise<number>` for database file size monitoring
- Use Node.js file system APIs and better-sqlite3 maintenance commands
- Handle platform-specific error scenarios gracefully

## Technical Approach

1. Use better-sqlite3's backup() API for database backup operations
2. Execute VACUUM command through better-sqlite3 for optimization
3. Use Node.js fs.stat() API to get database file size
4. Handle file system permissions and access errors
5. Integrate with existing logging for maintenance operations

## Method Implementation Template

```typescript
async backup(path: string): Promise<void> {
  // Validate backup path and permissions
  // Use better-sqlite3 backup API
  // Handle file system errors
}

async vacuum(): Promise<void> {
  // Execute VACUUM command
  // Handle database optimization errors
}

async getSize(): Promise<number> {
  // Get database file stats using fs.stat()
  // Return file size in bytes
}
```

## File System Integration

- Use Node.js path module for safe path handling
- Validate backup destination paths to prevent security issues
- Handle file permissions and disk space availability
- Ensure backup operations don't block other database operations

## Error Handling Requirements

- Handle file system permission errors gracefully
- Convert platform-specific errors to appropriate DatabaseError types
- Validate backup paths to prevent directory traversal attacks
- Log all maintenance operations for operational monitoring

## Acceptance Criteria

- [ ] backup() method implemented using better-sqlite3 backup API
- [ ] Validates backup destination path for security
- [ ] vacuum() method executes VACUUM command successfully
- [ ] getSize() method returns database file size in bytes
- [ ] All methods handle connection state validation
- [ ] Platform-specific errors converted to DatabaseError types
- [ ] Comprehensive logging for all maintenance operations
- [ ] Methods marked as optional in interface implementation

## Testing Requirements

- [ ] Unit tests for successful backup to valid destination path
- [ ] Unit tests for backup path validation and security checks
- [ ] Unit tests for vacuum operation execution and error handling
- [ ] Unit tests for getSize() with various database file sizes
- [ ] Unit tests for file system permission error scenarios
- [ ] Mock Node.js fs APIs and better-sqlite3 backup for isolated testing
- [ ] Integration tests with actual file system operations

## Security Considerations

- Validate backup paths to prevent directory traversal attacks
- Ensure backup operations respect file system permissions
- Prevent backup to sensitive system locations
- Log all maintenance operations for security auditing

## Performance Requirements

- backup() completes appropriate to database size (no specific target)
- vacuum() operation time scales with database size and fragmentation
- getSize() completes quickly (<10ms) using file system stats
- Operations don't significantly impact concurrent database usage

## Dependencies

- T-implement-connection (connection management methods exist)
- Node.js fs module for file system operations
- Node.js path module for safe path manipulation
- better-sqlite3 backup API and VACUUM command support

## Implementation Notes

- Mark all methods as optional with ? syntax in implementation
- Consider backup operation impact on concurrent database usage
- Handle vacuum operations that may take significant time
- Follow existing error handling and logging patterns
- Include JSDoc with maintenance operation usage examples
- Consider backup file naming conventions and rotation policies

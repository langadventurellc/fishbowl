---
kind: task
id: T-implement-atomic-write
title: Implement atomic write operations with security features
status: open
priority: high
prerequisites:
  - T-create-core-filestorageservice
created: "2025-07-31T14:56:02.456410"
updated: "2025-07-31T14:56:02.456410"
schema_version: "1.1"
parent: F-generic-file-storage-service
---

# Atomic Write Operations with Security Features

## Context

This task completes the FileStorageService by implementing atomic write operations that prevent data corruption and include comprehensive security features. The atomic write pattern ensures data integrity even if operations are interrupted.

## Reference

- **Feature**: F-generic-file-storage-service
- **Dependencies**: T-create-core-filestorageservice
- **Location**: `packages/shared/src/services/storage/FileStorageService.ts` (extend existing)

## Implementation Requirements

### 1. Atomic Write Method

Extend the existing FileStorageService class with:

```typescript
async writeJsonFile<U = T>(filePath: string, data: U): Promise<void> {
  // 1. Validate input parameters and file path
  // 2. Create parent directories if needed
  // 3. Generate temporary file path
  // 4. Write data to temporary file with proper formatting
  // 5. Validate written data by reading back
  // 6. Move temporary file to target location atomically
  // 7. Clean up on any failure
}
```

### 2. Atomic Write Helper Methods

Implement private helper methods:

- `generateTempFilePath(targetPath: string): string`
- `writeToTempFile<U>(tempPath: string, data: U): Promise<void>`
- `validateWrittenData<U>(filePath: string, originalData: U): Promise<void>`
- `atomicMove(sourcePath: string, targetPath: string): Promise<void>`
- `cleanupTempFile(tempPath: string): Promise<void>`

### 3. Security Features Implementation

Enhance existing security with:

- **File Size Limits**: Prevent memory exhaustion attacks
- **File Permissions**: Set user-only access (0o600) for sensitive data
- **Path Sanitization**: Enhanced path validation
- **Data Validation**: Ensure JSON serializability before writing

### 4. Enhanced Path Validation

Extend path validation helpers:

- **Size Limits**: Configurable max file size (default 10MB)
- **Path Length**: Limit path length to prevent buffer issues
- **Character Validation**: Ensure safe characters in file paths
- **Reserved Names**: Block system reserved file names

## Technical Approach

### Atomic Write Pattern Implementation

```typescript
async writeJsonFile<U = T>(filePath: string, data: U): Promise<void> {
  // 1. Input validation
  this.validateWriteInput(filePath, data);

  // 2. Setup
  const absolutePath = this.resolveAbsolutePath(filePath);
  await this.ensureDirectoryExists(path.dirname(absolutePath));

  // 3. Atomic write sequence
  const tempPath = this.generateTempFilePath(absolutePath);
  try {
    await this.writeToTempFile(tempPath, data);
    await this.validateWrittenData(tempPath, data);
    await this.atomicMove(tempPath, absolutePath);
  } catch (error) {
    await this.cleanupTempFile(tempPath);
    throw ErrorFactory.fromNodeError(error, 'writeJsonFile', filePath);
  }
}
```

### Security Implementation

1. **File Permissions**: Use 0o600 for sensitive files
2. **Size Validation**: Check serialized JSON size before writing
3. **Path Security**: Enhanced traversal detection and sanitization
4. **Cleanup**: Ensure temp files are always cleaned up

## Acceptance Criteria

✓ **Atomic Write Operations**:

- Writes to temporary file first, then moves to target
- Prevents data corruption during interrupted writes
- Preserves existing file if new write fails
- Cleans up temporary files on all failure scenarios

✓ **Data Integrity**:

- Written JSON is immediately readable and matches original data
- Handles objects with special characters and Unicode properly
- Preserves object structure through serialization cycle
- Pretty-formatted JSON output for readability

✓ **Security Features**:

- File permissions set to 0o600 for user-only access
- Path traversal attempts detected and rejected
- File size limits prevent memory exhaustion
- Input validation prevents malicious data

✓ **Error Handling**:

- Disk full conditions handled gracefully
- Permission denied scenarios provide clear errors
- Cleanup guaranteed even on unexpected failures
- All errors mapped to appropriate custom types

✓ **Performance & Safety**:

- No memory leaks from unclosed handles or temp files
- Minimal temporary disk space usage
- Efficient JSON serialization with size limits
- Cross-platform compatibility maintained

✓ **Unit Tests** (include in same task):

- Test successful atomic write operations
- Test failure scenarios (disk full, permissions, corruption)
- Test security features (path validation, size limits)
- Test cleanup behavior on failures
- Test data integrity through write/read cycles
- Mock file system operations for edge case testing

## Dependencies

- Existing FileStorageService class with read functionality
- File system bridge interface
- Custom error classes
- Node.js path and crypto modules for temp file generation

## Security Considerations

- **File Permissions**: Sensitive data files use restrictive permissions
- **Path Validation**: Comprehensive path sanitization and validation
- **Size Limits**: Prevent memory exhaustion and disk space attacks
- **Temp File Security**: Temporary files created with secure permissions
- **Cleanup**: Always clean up temporary files to prevent information leaks

## Performance Considerations

- **Memory Efficiency**: Stream large files rather than loading entirely
- **Disk I/O**: Minimize disk operations through efficient temp file handling
- **Validation**: Fast validation without full re-parsing when possible
- **Atomic Operations**: Use platform-optimal atomic move operations

## Files to Modify

- `packages/shared/src/services/storage/FileStorageService.ts` (extend existing)
- Unit test file to include comprehensive write operation tests

## Configuration Options

Consider adding optional configuration:

```typescript
export interface FileStorageOptions {
  maxFileSizeBytes?: number; // Default: 10MB
  filePermissions?: number; // Default: 0o600
  tempFilePrefix?: string; // Default: '.tmp-'
}
```

## Integration Notes

- Completes the core FileStorageService implementation
- Ready for use by higher-level services (settings, user data)
- Provides foundation for specialized storage services

### Log

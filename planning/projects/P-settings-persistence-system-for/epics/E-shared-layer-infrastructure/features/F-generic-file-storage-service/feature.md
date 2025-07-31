---
kind: feature
id: F-generic-file-storage-service
title: Generic File Storage Service
status: in-progress
priority: high
prerequisites: []
created: "2025-07-31T12:19:41.106984"
updated: "2025-07-31T12:19:41.106984"
schema_version: "1.1"
parent: E-shared-layer-infrastructure
---

# Generic File Storage Service

## Purpose and Functionality

Implement a robust, generic file storage service that provides async JSON read/write operations with atomic write capabilities and comprehensive error handling. This service will be the foundation for all file-based persistence in the shared package, designed for reusability beyond just settings persistence.

## Key Components to Implement

### 1. FileStorageService Class

- Generic typing support for any JSON-serializable data type
- Async `readJsonFile<T>(filePath: string): Promise<T>` method
- Async `writeJsonFile<T>(filePath: string, data: T): Promise<void>` method
- Atomic write operations using temporary files to prevent corruption
- Directory creation if parent directories don't exist
- Cross-platform path handling (Windows, macOS, Linux)

### 2. Error Handling System

- Custom error types: `FileNotFoundError`, `InvalidJsonError`, `WritePermissionError`
- Detailed error context (file path, operation type, underlying cause)
- Proper error propagation without silent failures
- Graceful handling of malformed JSON with helpful error messages

### 3. File System Abstraction

- Interface-based design for easy testing and mocking
- Node.js fs/promises implementation as default
- Support for custom file system implementations (testing, cloud storage)
- Proper handling of file encoding (UTF-8)

## Detailed Acceptance Criteria

### Functional Behavior

- ✓ Successfully reads valid JSON files and parses to typed objects
- ✓ Successfully writes objects to JSON files with pretty formatting
- ✓ Creates parent directories automatically if they don't exist
- ✓ Handles missing files by throwing descriptive `FileNotFoundError`
- ✓ Handles malformed JSON by throwing `InvalidJsonError` with parsing details
- ✓ Handles permission issues by throwing `WritePermissionError`
- ✓ All operations are fully asynchronous using fs/promises

### Atomic Write Operations

- ✓ Writes to temporary file first, then moves to target location
- ✓ Prevents data corruption if write operation is interrupted
- ✓ Cleans up temporary files even if operation fails
- ✓ Preserves existing file if new write fails validation
- ✓ Uses appropriate file permissions (user-only access: 0o600)

### Data Integrity and Validation

- ✓ Written JSON is immediately readable and parses correctly
- ✓ Handles objects with special characters, unicode, and edge cases
- ✓ Preserves object structure and data types through serialization cycle
- ✓ Validates file path format and rejects dangerous paths (../, ~/)
- ✓ Enforces file size limits to prevent memory exhaustion

### Performance Requirements

- ✓ Read operations complete within 50ms for files under 1MB
- ✓ Write operations complete within 100ms for files under 1MB
- ✓ Memory usage remains constant regardless of number of operations
- ✓ No memory leaks from unclosed file handles or temporary files

### Cross-Platform Compatibility

- ✓ Works identically on Windows, macOS, and Linux
- ✓ Handles path separators correctly across platforms
- ✓ Respects platform-specific file permission models
- ✓ Handles case-sensitive vs case-insensitive filesystems appropriately

### Security Requirements

- ✓ File permissions set to user-only access (0o600) for sensitive data
- ✓ Path traversal attempts (../, ~/) are detected and rejected
- ✓ No sensitive data (file contents, paths) logged in error messages
- ✓ Temporary files have restricted permissions and are cleaned up
- ✓ Input validation prevents buffer overflow attacks

## Implementation Guidance

### Service Architecture

```typescript
export interface FileSystemBridge {
  readFile(path: string, encoding: string): Promise<string>;
  writeFile(
    path: string,
    data: string,
    options?: WriteFileOptions,
  ): Promise<void>;
  mkdir(path: string, options?: { recursive: boolean }): Promise<void>;
  unlink(path: string): Promise<void>;
}

export class FileStorageService<T = unknown> {
  constructor(private fs: FileSystemBridge = new NodeFileSystemBridge()) {}

  async readJsonFile<U = T>(filePath: string): Promise<U> {
    // Implementation with proper error handling
  }

  async writeJsonFile<U = T>(filePath: string, data: U): Promise<void> {
    // Atomic write implementation
  }
}
```

### Error Handling Strategy

- Create custom error classes extending base Error
- Include contextual information (operation, file path, underlying cause)
- Use error codes for programmatic handling
- Distinguish between recoverable and fatal errors
- Provide actionable error messages for developers

### Atomic Write Pattern

```typescript
// 1. Generate temporary file name
// 2. Write data to temporary file
// 3. Validate written data by reading back
// 4. Move temporary file to target location
// 5. Clean up on any failure
```

## Testing Requirements

### Unit Testing

- Successfully reads and writes various JSON data types
- Handles all error conditions with appropriate error types
- Atomic write operations work correctly and clean up properly
- Custom file system implementations work through the bridge interface
- Path validation prevents security vulnerabilities

### Integration Testing

- Works with actual file system operations
- Performance benchmarks meet response time requirements
- Cross-platform compatibility on CI/CD systems
- Memory usage remains stable under repeated operations
- Handles concurrent access patterns safely

### Error Scenario Testing

- Disk full conditions
- Permission denied scenarios
- Corrupted/malformed JSON files
- Network file system interruptions
- Concurrent write attempts

## Dependencies

This feature has no dependencies on other features and provides a foundation service for other components to use.

### Log

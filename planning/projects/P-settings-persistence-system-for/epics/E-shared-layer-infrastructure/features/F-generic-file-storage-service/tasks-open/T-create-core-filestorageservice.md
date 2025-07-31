---
kind: task
id: T-create-core-filestorageservice
title: Create core FileStorageService with read functionality
status: open
priority: high
prerequisites:
  - T-create-file-system-bridge
  - T-implement-custom-error-classes
created: "2025-07-31T14:55:23.270533"
updated: "2025-07-31T14:55:23.270533"
schema_version: "1.1"
parent: F-generic-file-storage-service
---

# Core FileStorageService with Read Functionality

## Context

This task implements the main FileStorageService class with generic typing support and async JSON read operations. This forms the core of the file storage system with proper error handling and type safety.

## Reference

- **Feature**: F-generic-file-storage-service
- **Dependencies**: T-create-file-system-bridge, T-implement-custom-error-classes
- **Location**: `packages/shared/src/services/storage/FileStorageService.ts`

## Implementation Requirements

### 1. Core Service Class

Create `packages/shared/src/services/storage/FileStorageService.ts`:

```typescript
import { FileSystemBridge, NodeFileSystemBridge } from "./FileSystemBridge";
import {
  FileStorageError,
  FileNotFoundError,
  InvalidJsonError,
  ErrorFactory,
} from "./errors";

export class FileStorageService<T = unknown> {
  constructor(private fs: FileSystemBridge = new NodeFileSystemBridge()) {}

  async readJsonFile<U = T>(filePath: string): Promise<U> {
    // Implementation with comprehensive error handling
  }

  // writeJsonFile will be implemented in next task
  // private helper methods for validation and path handling
}
```

### 2. Path Validation Utility

Create helper methods within the class:

- `validateFilePath(filePath: string)`: Reject dangerous paths (../, ~/)
- `resolveAbsolutePath(filePath: string)`: Handle relative to absolute path conversion
- `ensureDirectoryExists(dirPath: string)`: Create parent directories if needed

### 3. JSON Reading Implementation

Implement `readJsonFile<U = T>(filePath: string): Promise<U>`:

1. **Path Validation**: Check for path traversal attempts
2. **File Reading**: Use FileSystemBridge to read file content
3. **JSON Parsing**: Parse with proper error handling
4. **Error Mapping**: Convert fs errors to custom error types
5. **Type Safety**: Return properly typed object

## Technical Approach

1. **Generic Design**: Support any JSON-serializable type with TypeScript generics
2. **Dependency Injection**: Accept FileSystemBridge for testability
3. **Error Handling**: Map all fs errors through ErrorFactory
4. **Path Security**: Validate paths to prevent traversal attacks
5. **Async Operations**: Full Promise-based API

## Acceptance Criteria

✓ **Generic Type Support**:

- Class accepts generic type parameter for default operations
- Individual methods can override with their own generic types
- Full TypeScript type safety maintained throughout

✓ **Read Functionality**:

- Successfully reads and parses valid JSON files
- Returns properly typed objects matching generic constraints
- Handles missing files with FileNotFoundError
- Handles malformed JSON with InvalidJsonError

✓ **Path Validation**:

- Rejects path traversal attempts (../, ~/)
- Handles both relative and absolute paths correctly
- Provides clear error messages for invalid paths
- Cross-platform path handling

✓ **Error Handling**:

- All fs errors mapped to appropriate custom error types
- Error context includes operation type and file path
- Original error preserved as cause for debugging
- No sensitive information leaked in error messages

✓ **Dependency Injection**:

- Accepts custom FileSystemBridge implementations
- Defaults to NodeFileSystemBridge if none provided
- Enables easy testing with mock implementations
- Interface-based design maintained

✓ **Unit Tests** (include in same task):

- Test successful JSON reading with various data types
- Test error scenarios (file not found, invalid JSON)
- Test path validation and security features
- Test generic type handling and return types
- Mock FileSystemBridge for isolated testing

## Dependencies

- FileSystemBridge interface and NodeFileSystemBridge implementation
- Custom error classes (FileStorageError, FileNotFoundError, InvalidJsonError)
- ErrorFactory for error mapping

## Security Considerations

- Path traversal attack prevention
- Input validation for file paths
- No sensitive data in error messages
- Proper error context without information leaks

## Performance Considerations

- Async operations throughout (no blocking)
- Minimal memory footprint
- Efficient JSON parsing with error recovery

## Files to Create/Modify

- `packages/shared/src/services/storage/FileStorageService.ts`
- Update `packages/shared/src/services/storage/index.ts` to export new service
- Unit test file following project test patterns

## Integration Notes

- This class will be extended with write functionality in the next task
- Designed to be the main entry point for file storage operations
- Can be used directly or extended for specific use cases like settings storage

### Log

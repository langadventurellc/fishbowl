---
kind: task
id: T-implement-path-validation-and
title: Implement path validation and sanitization utilities
status: open
priority: normal
prerequisites: []
created: "2025-07-31T16:19:28.512095"
updated: "2025-07-31T16:19:28.512095"
schema_version: "1.1"
parent: F-error-handling-and-utilities
---

# Implement Path Validation and Sanitization Utilities

## Context

Create secure path utilities that prevent directory traversal attacks and handle cross-platform path resolution for the persistence system.

## Implementation Details

### Files to Create

- `packages/shared/src/services/storage/utils/pathUtils.ts`
- `packages/shared/src/services/storage/utils/__tests__/pathUtils.test.ts`
- `packages/shared/src/services/storage/utils/index.ts` (barrel file)

### Technical Approach

Implement these utility functions:

**validatePath(filePath: string): boolean**

- Reject dangerous paths: `../`, `~/`, absolute paths with suspicious components
- Allow relative paths within allowed directories
- Cross-platform validation (Windows vs Unix separators)

**sanitizePath(filePath: string): string**

- Remove or replace dangerous characters
- Normalize path separators for current platform
- Resolve relative components safely

**resolvePath(basePath: string, relativePath: string): string**

- Safely resolve relative paths against base path
- Prevent escaping the base directory
- Handle cross-platform path resolution
- Throw error if resolved path would escape base

**isPathSafe(filePath: string, allowedBase?: string): boolean**

- Check if path is safe for file operations
- Optionally verify path is within allowed base directory
- Return boolean for conditional logic

## Acceptance Criteria

### Security Requirements ✅ Must Implement

- ✅ Path validation prevents directory traversal attacks (`../`, `..\\`)
- ✅ Rejects paths with dangerous patterns (`~/`, absolute paths to system dirs)
- ✅ Handles both Windows (`\\`) and Unix (`/`) path separators correctly
- ✅ Prevents path injection via encoded characters (%2F, %2E, etc.)
- ✅ Validates against null bytes and other dangerous characters

### Cross-Platform Support ✅ Must Implement

- ✅ Works correctly on Windows, macOS, and Linux
- ✅ Handles different path separator conventions
- ✅ Resolves paths consistently across platforms
- ✅ Uses Node.js path module for platform-specific operations

### Error Handling ✅ Must Implement

- ✅ Throws descriptive errors for invalid paths
- ✅ Returns boolean flags for conditional validation
- ✅ Provides clear error messages for troubleshooting
- ✅ Integrates with existing FileStorageError hierarchy

### Performance ✅ Must Implement

- ✅ Minimal overhead for typical path operations
- ✅ Efficient validation without excessive string processing
- ✅ Suitable for high-frequency file operations

## Testing Requirements

### Unit Tests Must Cover

- Valid relative paths within allowed directories
- Directory traversal attack attempts (`../../../etc/passwd`)
- Path injection attempts with encoded characters
- Cross-platform path separator handling
- Base directory escape attempts
- Null byte injection attempts
- Empty and invalid path inputs
- Edge cases (very long paths, special characters)

### Security Tests Must Cover

- Common directory traversal patterns
- Path injection with URL encoding
- Windows vs Unix path separator mixing
- Symlink resolution if applicable
- Base path validation and enforcement

## Dependencies

- Node.js `path` module for cross-platform path operations
- Integration with existing FileStorageError for error handling

## File Locations

- Create new `utils/` directory under `packages/shared/src/services/storage/`
- Follow existing service patterns and directory structure
- Use similar test setup as existing storage tests

### Log

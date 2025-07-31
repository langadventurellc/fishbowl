---
kind: task
id: T-create-file-system-bridge
title: Create file system bridge interface and Node.js implementation
status: open
priority: high
prerequisites: []
created: "2025-07-31T14:54:24.361754"
updated: "2025-07-31T14:54:24.361754"
schema_version: "1.1"
parent: F-generic-file-storage-service
---

# File System Bridge Interface and Node.js Implementation

## Context

This task implements the foundational file system abstraction layer for the generic file storage service. The bridge pattern enables easy testing and potential future support for different storage backends.

## Reference

- **Feature**: F-generic-file-storage-service
- **Location**: `packages/shared/src/services/storage/` (new directory)

## Implementation Requirements

### 1. FileSystemBridge Interface

Create `packages/shared/src/services/storage/FileSystemBridge.ts`:

```typescript
export interface WriteFileOptions {
  mode?: number;
  encoding?: BufferEncoding;
}

export interface FileSystemBridge {
  readFile(path: string, encoding: BufferEncoding): Promise<string>;
  writeFile(
    path: string,
    data: string,
    options?: WriteFileOptions,
  ): Promise<void>;
  mkdir(path: string, options?: { recursive: boolean }): Promise<void>;
  unlink(path: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
}
```

### 2. Node.js Implementation

Create `packages/shared/src/services/storage/NodeFileSystemBridge.ts`:

```typescript
import * as fs from "fs/promises";
import { FileSystemBridge, WriteFileOptions } from "./FileSystemBridge";

export class NodeFileSystemBridge implements FileSystemBridge {
  // Implement all interface methods using fs/promises
  // Handle cross-platform path operations
  // Ensure proper error propagation
}
```

### 3. Barrel Export

Create `packages/shared/src/services/storage/index.ts`:

- Export both interface and implementation
- Follow project barrel export patterns

## Technical Approach

1. **Interface Design**: Define clean, minimal interface covering required operations
2. **Node.js Implementation**: Use fs/promises for all async operations
3. **Error Handling**: Let native fs errors bubble up (will be handled in higher layers)
4. **Cross-Platform**: Use Node.js built-in path handling capabilities
5. **TypeScript**: Full type safety with proper generic constraints

## Acceptance Criteria

✓ **Interface Definition**:

- Covers all required file operations (read, write, mkdir, unlink, rename)
- Uses appropriate TypeScript types for options and parameters
- Follows project interface naming conventions

✓ **Node.js Implementation**:

- Implements all interface methods using fs/promises
- Handles encoding properly (UTF-8 default)
- Supports recursive directory creation
- All methods are fully asynchronous

✓ **Cross-Platform Support**:

- Works on Windows, macOS, and Linux
- Handles path separators correctly through Node.js APIs
- Respects platform-specific file permissions

✓ **Unit Tests** (include in same task):

- Test interface compliance
- Test successful file operations
- Test error propagation from fs operations
- Mock testing capabilities verified

## Dependencies

- Node.js fs/promises module
- TypeScript type definitions

## Security Considerations

- No path validation at this layer (handled in higher-level service)
- Preserve native fs module security characteristics
- Proper error propagation without information leakage

## Files to Create

- `packages/shared/src/services/storage/FileSystemBridge.ts`
- `packages/shared/src/services/storage/NodeFileSystemBridge.ts`
- `packages/shared/src/services/storage/index.ts`
- Unit test file following project test patterns

### Log

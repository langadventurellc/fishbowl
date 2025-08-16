---
id: T-move-nodefilesystembridge-to
title: Move NodeFileSystemBridge to main process services
status: done
priority: high
parent: F-refactor-platform-specific
prerequisites:
  - T-create-directory-structure
affectedFiles:
  apps/desktop/src/main/services/NodeFileSystemBridge.ts: Enhanced - moved from
    shared package and added comprehensive Node.js-specific operations
    (setFilePermissions, checkFilePermissions, getDirectoryStats,
    ensureDirectoryExists) with full validation and error handling
  packages/shared/src/services/storage/FileSystemBridge.ts: Enhanced - added
    optional Node.js-specific methods to interface for proper dependency
    injection
  packages/shared/src/services/storage/FileStorageService.ts: Modified - updated
    to use FileSystemBridge interface methods with fallback behavior and proper
    error conversion, made FileSystemBridge parameter required
  packages/shared/src/services/storage/utils/index.ts: Cleaned up - removed exports for deleted Node.js-specific utility functions
  packages/shared/src/services/storage/utils/ensureDirectoryExists.ts: Deleted - moved functionality to NodeFileSystemBridge
  packages/shared/src/services/storage/utils/setFilePermissions.ts: Deleted - moved functionality to NodeFileSystemBridge
  packages/shared/src/services/storage/utils/checkFilePermissions.ts: Deleted - moved functionality to NodeFileSystemBridge
  packages/shared/src/services/storage/utils/getDirectoryStats.ts: Deleted - moved functionality to NodeFileSystemBridge
  packages/shared/src/services/storage/utils/__tests__/ensureDirectoryExists.test.ts: Deleted - moved with functionality to desktop app
  packages/shared/src/services/storage/utils/__tests__/setFilePermissions.test.ts: Deleted - moved with functionality to desktop app
  packages/shared/src/services/storage/utils/__tests__/checkFilePermissions.test.ts: Deleted - moved with functionality to desktop app
  packages/shared/src/services/storage/utils/__tests__/getDirectoryStats.test.ts: Deleted - moved with functionality to desktop app
  apps/desktop/src/main/services/__tests__/NodeFileSystemBridge.test.ts: Updated - maintained existing tests and functionality in desktop app
  apps/desktop/src/main/services/index.ts: Modified - added export for NodeFileSystemBridge
  apps/desktop/src/electron/main.ts: Modified - updated import to use NodeFileSystemBridge from local services
  apps/desktop/src/electron/services/LlmStorageService.ts: Modified - updated import to use NodeFileSystemBridge from local services
  apps/desktop/src/data/repositories/RolesRepository.ts: Modified - added
    NodeFileSystemBridge and updated constructor to provide FileSystemBridge
    parameter
  packages/shared/src/services/storage/RolesFileRecoveryService.ts: Modified - added FileSystemBridge constructor parameter
  packages/shared/src/services/storage/utils/createFileBackup.ts: Modified - made FileSystemBridge parameter required
  packages/shared/src/services/storage/index.ts: Modified - removed NodeFileSystemBridge export
log:
  - Successfully moved NodeFileSystemBridge from shared package to main process
    services directory and consolidated all Node.js-specific filesystem
    utilities into the platform-specific implementation. Added optional methods
    to FileSystemBridge interface (setFilePermissions, checkFilePermissions,
    getDirectoryStats, ensureDirectoryExists) and implemented them in
    NodeFileSystemBridge with proper validation and error handling. Removed all
    Node.js-specific utility functions from shared package and updated all
    services to use dependency injection pattern. Maintained backward
    compatibility with proper fallback behavior and error conversion. All
    quality checks pass and tests are working correctly.
schema: v1.0
childrenIds: []
created: 2025-08-15T21:51:41.760Z
updated: 2025-08-15T21:51:41.760Z
---

# Move NodeFileSystemBridge to Main Process Services

## Context

Move the existing `NodeFileSystemBridge` class from the shared package to the main process services directory, as it contains Node.js-specific file system operations that should only run in the Electron main process.

**Current Location:** `packages/shared/src/services/storage/NodeFileSystemBridge.ts`
**Target Location:** `apps/desktop/src/main/services/NodeFileSystemBridge.ts`

## Implementation Requirements

### File Movement:

1. Copy `NodeFileSystemBridge.ts` to `apps/desktop/src/main/services/`
2. Copy corresponding test file to `apps/desktop/src/main/services/__tests__/`
3. Update imports in the moved files:
   - Change shared package imports to use `@fishbowl-ai/shared` for interfaces
   - Ensure `FileSystemBridge` interface import works correctly
4. Export from `apps/desktop/src/main/services/index.ts`

### Interface Verification:

- Ensure `FileSystemBridge` interface remains in `packages/shared/src/services/storage/FileSystemBridge.ts`
- Verify `NodeFileSystemBridge` properly implements the `FileSystemBridge` interface from `@fishbowl-ai/shared/services/storage`
- Maintain all existing method signatures and functionality

## Technical Approach

1. Move the implementation file and its test
2. Update import paths to reference shared package interfaces
3. Add proper exports to barrel files
4. Verify TypeScript compilation succeeds
5. Run unit tests to ensure functionality is preserved

## Acceptance Criteria

- [ ] `NodeFileSystemBridge.ts` moved to `apps/desktop/src/main/services/`
- [ ] Unit tests moved and updated for new location
- [ ] All imports correctly reference shared package interfaces
- [ ] Class properly implements `FileSystemBridge` interface
- [ ] TypeScript compilation succeeds without errors
- [ ] Unit tests pass in new location
- [ ] Exports properly configured in barrel files

## Dependencies

- Requires T-create-directory-structure to be completed

## Security Considerations

- Maintain file permission checking logic
- Preserve path validation and sanitization
- Keep error handling for file system operations

## Testing Requirements

- Run existing unit tests in new location
- Verify interface compliance
- Test import resolution from main process

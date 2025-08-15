---
id: T-move-nodefilesystembridge-to
title: Move NodeFileSystemBridge to main process services
status: open
priority: high
parent: F-refactor-platform-specific
prerequisites:
  - T-create-directory-structure
affectedFiles: {}
log: []
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

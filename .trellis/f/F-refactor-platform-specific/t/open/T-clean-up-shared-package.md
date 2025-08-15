---
id: T-clean-up-shared-package
title: Clean up shared package platform-specific code
status: open
priority: high
parent: F-refactor-platform-specific
prerequisites:
  - T-wire-up-node-implementations
  - T-wire-up-browser-implementation
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T21:53:46.223Z
updated: 2025-08-15T21:53:46.223Z
---

# Clean Up Shared Package Platform-Specific Code

## Context

Remove all platform-specific implementations from the shared package now that they have been moved to the appropriate desktop app directories. This ensures the shared package is truly platform-agnostic.

**Files to Remove:**

- `packages/shared/src/services/storage/NodeFileSystemBridge.ts`
- `packages/shared/src/services/storage/__tests__/NodeFileSystemBridge.test.ts`
- `packages/shared/src/utils/randomBytes.ts`
- `packages/shared/src/utils/generateId.ts`
- `packages/shared/src/utils/getByteLength.ts`
- `packages/shared/src/logging/utils/getDeviceInfo.ts`
- `packages/shared/src/logging/utils/detectPlatform.ts`
- Platform-specific parts of `packages/shared/src/logging/createLoggerSync.ts`

## Implementation Requirements

### Remove Platform-Specific Files:

1. Delete moved implementation files
2. Delete corresponding test files
3. Update barrel exports (`index.ts` files) to remove deleted exports
4. Update any internal shared package imports

### Clean Up Mixed Files:

1. **createLoggerSync.ts**: Remove process-specific metadata collection
2. **randomBytesHex.ts**: Update to use injected crypto utils if needed
3. Remove any remaining `eval()` or dynamic import statements
4. Remove platform detection utilities

### Update Exports:

- Remove deleted files from all `index.ts` barrel exports
- Update shared package main exports
- Ensure only interfaces and platform-agnostic code is exported

### Verify Platform Agnostic:

- No Node.js-specific imports (`fs`, `os`, `crypto`, `buffer`)
- No browser-specific globals (`window`, `navigator`, `screen`)
- No platform detection logic (`typeof process`, `typeof window`)
- No dynamic imports or eval statements

## Technical Approach

1. Remove platform-specific implementation files
2. Clean up barrel exports and internal imports
3. Update mixed files to remove platform-specific logic
4. Run TypeScript compilation to catch missing exports
5. Run shared package tests to ensure no broken dependencies
6. Verify no platform-specific code remains

## Acceptance Criteria

- [ ] All platform-specific implementation files removed
- [ ] Barrel exports updated correctly
- [ ] No Node.js or browser-specific imports remain
- [ ] No platform detection logic in shared package
- [ ] No eval() or dynamic import statements
- [ ] TypeScript compilation succeeds
- [ ] Shared package tests pass
- [ ] Only interfaces and platform-agnostic code exported

## Dependencies

- Requires implementations to be successfully moved and wired up

## Security Considerations

- Ensure no accidental removal of security-critical validation logic
- Preserve interface definitions for security contracts
- Maintain error handling patterns

## Testing Requirements

- Run shared package test suite
- Verify TypeScript compilation
- Test that shared package can be imported without platform-specific dependencies
- Confirm no runtime platform-specific code execution

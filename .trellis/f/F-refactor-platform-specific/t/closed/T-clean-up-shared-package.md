---
id: T-clean-up-shared-package
title: Clean up shared package platform-specific code
status: done
priority: high
parent: F-refactor-platform-specific
prerequisites:
  - T-wire-up-node-implementations
  - T-wire-up-browser-implementation
affectedFiles:
  packages/shared/src/utils/randomBytes.ts: Removed platform-specific random bytes implementation
  packages/shared/src/utils/generateId.ts: Removed platform-specific ID generation implementation
  packages/shared/src/utils/getByteLength.ts: Removed platform-specific byte length implementation
  packages/shared/src/logging/utils/getDeviceInfo.ts: Removed platform-specific device info implementation
  packages/shared/src/logging/utils/detectPlatform.ts: Removed platform-specific platform detection implementation
  packages/shared/src/logging/utils/getCachedDeviceInfo.ts: Removed cached device info that depended on deleted getDeviceInfo
  packages/shared/src/logging/utils/PlatformCache.ts: Removed platform cache that depended on deleted detectPlatform
  packages/shared/src/logging/utils/getPlatform.ts: Removed getPlatform utility that depended on deleted PlatformCache
  packages/shared/src/logging/utils/resetPlatformCache.ts: Removed resetPlatformCache utility that depended on deleted PlatformCache
  packages/shared/src/utils/index.ts: Updated barrel exports to remove deleted utility files
  packages/shared/src/logging/utils/index.ts: Updated barrel exports to remove deleted logging utility files
  packages/shared/src/services/storage/FileStorageService.ts: Updated constructor to use dependency injection for crypto utilities
  packages/shared/src/repositories/llmConfig/LlmConfigRepository.ts: Updated constructor to use dependency injection for crypto utilities
  packages/shared/src/logging/createLogger.ts:
    Updated to use dependency injection
    for device info and crypto utilities, removed direct process access
  packages/shared/src/logging/createLoggerSync.ts: Updated to use dependency
    injection interfaces and removed platform-specific process metadata
    collection
  packages/shared/src/logging/config/getDefaultConfig.ts: Added safe guard for process.env access to be platform-agnostic
  packages/shared/src/utils/randomBytesHex.ts: Updated to use dependency injection for crypto utilities
  packages/shared/src/logging/__tests__/createLoggerSync.test.ts: Updated test to reflect platform-agnostic logger behavior
log:
  - Successfully cleaned up shared package platform-specific code by removing
    all platform-specific implementations and replacing them with dependency
    injection interfaces. All platform-specific utilities (randomBytes,
    generateId, getByteLength, getDeviceInfo, detectPlatform) have been moved to
    desktop app directories and replaced with interfaces in the shared package.
    Updated constructor signatures to use dependency injection pattern and made
    all remaining code platform-agnostic with proper guards. All tests pass and
    TypeScript compilation succeeds.
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

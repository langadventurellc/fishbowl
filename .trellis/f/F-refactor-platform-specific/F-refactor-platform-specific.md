---
id: F-refactor-platform-specific
title: Refactor platform-specific code into separate packages
status: in-progress
priority: high
prerequisites: []
affectedFiles:
  apps/desktop/src/main/services/index.ts: Created barrel file for Node.js/Electron main process service implementations
  apps/desktop/src/main/utils/index.ts: Created barrel file for Node.js/Electron
    main process utility functions; Added export for NodeCryptoUtils class
  apps/desktop/src/renderer/utils/index.ts: Created barrel file for browser/Electron renderer process utility functions
  apps/desktop/src/__tests__/directoryStructure.test.ts: Created test to verify module resolution and directory structure
  packages/shared/src/utils/CryptoUtilsInterface.ts: Created interface for
    platform-agnostic crypto operations with randomBytes, generateId, and
    getByteLength methods
  packages/shared/src/utils/index.ts: Added export for CryptoUtilsInterface
  apps/desktop/src/main/utils/NodeCryptoUtils.ts: Implemented NodeCryptoUtils
    class with direct Node.js crypto imports, no dynamic imports or eval
    statements
  apps/desktop/src/main/utils/__tests__/NodeCryptoUtils.test.ts:
    Created comprehensive unit tests covering all crypto utility functions,
    interface compliance, and error handling
log: []
schema: v1.0
childrenIds:
  - T-clean-up-shared-package
  - T-extract-browser-crypto
  - T-extract-browser-device-info
  - T-extract-node-crypto-utilities
  - T-extract-node-device-info-to
  - T-move-nodefilesystembridge-to
  - T-update-shared-services-for
  - T-verify-build-passes-after
  - T-wire-up-browser-implementation
  - T-wire-up-node-implementations
  - T-create-directory-structure
created: 2025-08-15T21:43:23.682Z
updated: 2025-08-15T21:43:23.682Z
---

# Refactor Platform-Specific Code into Desktop App Directories

## Purpose

Move platform-specific implementations from the shared package directly into the desktop app's main and renderer processes to resolve build and runtime issues without over-engineering.

## Problem Statement

The shared package currently contains code that uses platform-specific APIs (Node.js fs, crypto, os modules) which causes build failures when imported in incompatible environments. Rather than creating new packages, we'll move implementations to where they're actually used.

## Solution Architecture

### Simple Directory-Based Approach:

1. **@fishbowl-ai/shared** - Contains only:
   - Interface definitions (FileSystemBridge, etc.)
   - Pure TypeScript types
   - Platform-agnostic business logic
   - Validation utilities
   - Constants

2. **apps/desktop/src/main/** - Node.js/Electron main implementations:
   - `services/NodeFileSystemBridge.ts`
   - `utils/NodeCryptoUtils.ts` (randomBytes, generateId)
   - `utils/NodeDeviceInfo.ts`
   - File system operations

3. **apps/desktop/src/renderer/** - Browser/Electron renderer implementations:
   - `utils/BrowserCryptoUtils.ts` (Web Crypto API)
   - `utils/BrowserDeviceInfo.ts`
   - localStorage/IndexedDB operations

### Dependency Injection via Constructors:

- Services in shared package accept interfaces via constructor
- Each process creates its implementations at startup
- No frameworks needed - just plain TypeScript constructor injection

## Acceptance Criteria

- [ ] All platform-specific code removed from shared package
- [ ] Node implementations moved to `apps/desktop/src/main/`
- [ ] Browser implementations moved to `apps/desktop/src/renderer/`
- [ ] Desktop main process successfully imports from platform-node
- [ ] Desktop renderer process successfully imports from platform-browser
- [ ] No eval() or dynamic require statements needed
- [ ] Build passes without errors
- [ ] All existing functionality preserved
- [ ] Type safety maintained across packages

## Implementation Guidance

### Step 1: Create directory structure

- Create `apps/desktop/src/main/services/` for Node implementations
- Create `apps/desktop/src/main/utils/` for Node utilities
- Create `apps/desktop/src/renderer/utils/` for browser implementations

### Step 2: Move implementations with simple wiring

- Move `NodeFileSystemBridge` → `apps/desktop/src/main/services/`
- Extract Node crypto logic → `apps/desktop/src/main/utils/NodeCryptoUtils.ts`
- Extract browser crypto logic → `apps/desktop/src/renderer/utils/BrowserCryptoUtils.ts`
- Extract Node device info → `apps/desktop/src/main/utils/NodeDeviceInfo.ts`
- Extract browser device info → `apps/desktop/src/renderer/utils/BrowserDeviceInfo.ts`

### Step 3: Wire up via constructor injection

- Update shared services to accept implementations via constructor
- Create implementations at startup in each process
- Pass to shared services (e.g., `new FileStorageService(new NodeFileSystemBridge())`)

### Step 4: Clean up shared package

- Remove all platform-specific implementations
- Keep only interfaces and pure utilities
- Remove dynamic imports and eval statements
- Ensure truly platform-agnostic code only

## Testing Requirements

- Unit tests for moved implementations in their new locations
- Integration tests verifying constructor injection works properly
- Build verification for desktop app (main and renderer)
- Runtime verification in desktop app (both main and renderer processes)

## Technical Constraints

- No dynamic imports or eval statements
- Maintain backward compatibility for existing APIs
- Keep package sizes minimal
- Ensure tree-shaking works properly
- TypeScript strict mode compliance

## Dependencies

- None - this is a standalone refactoring feature

## Estimated Effort

- 6-8 hours of implementation work
- Can be broken down into 8-12 discrete tasks

---
id: F-refactor-platform-specific
title: Refactor platform-specific code into separate packages
status: in-progress
priority: high
prerequisites: []
affectedFiles:
  apps/desktop/src/main/services/index.ts: Created barrel file for
    Node.js/Electron main process service implementations; Modified - added
    export for NodeFileSystemBridge
  apps/desktop/src/main/utils/index.ts: Created barrel file for Node.js/Electron
    main process utility functions; Added export for NodeCryptoUtils class;
    Added export for NodeDeviceInfo class
  apps/desktop/src/renderer/utils/index.ts: Created barrel file for
    browser/Electron renderer process utility functions; Updated barrel file to
    export BrowserCryptoUtils class; Added export for BrowserDeviceInfo to
    barrel file
  apps/desktop/src/__tests__/directoryStructure.test.ts: Created test to verify module resolution and directory structure
  packages/shared/src/utils/CryptoUtilsInterface.ts: Created interface for
    platform-agnostic crypto operations with randomBytes, generateId, and
    getByteLength methods
  packages/shared/src/utils/index.ts: Added export for CryptoUtilsInterface;
    Updated barrel exports to remove deleted utility files
  apps/desktop/src/main/utils/NodeCryptoUtils.ts: Implemented NodeCryptoUtils
    class with direct Node.js crypto imports, no dynamic imports or eval
    statements
  apps/desktop/src/main/utils/__tests__/NodeCryptoUtils.test.ts:
    Created comprehensive unit tests covering all crypto utility functions,
    interface compliance, and error handling
  apps/desktop/src/renderer/utils/BrowserCryptoUtils.ts: Created new
    BrowserCryptoUtils class implementing CryptoUtilsInterface using Web Crypto
    API and TextEncoder
  apps/desktop/src/renderer/utils/__tests__/BrowserCryptoUtils.test.ts:
    Added comprehensive unit tests with 28 test cases covering all
    functionality, error handling, interface compliance, and cryptographic
    quality
  apps/desktop/src/main/services/NodeFileSystemBridge.ts: Enhanced - moved from
    shared package and added comprehensive Node.js-specific operations
    (setFilePermissions, checkFilePermissions, getDirectoryStats,
    ensureDirectoryExists) with full validation and error handling
  packages/shared/src/services/storage/FileSystemBridge.ts: Enhanced - added
    optional Node.js-specific methods to interface for proper dependency
    injection
  packages/shared/src/services/storage/FileStorageService.ts: Modified - updated
    to use FileSystemBridge interface methods with fallback behavior and proper
    error conversion, made FileSystemBridge parameter required; Updated
    constructor to use dependency injection for crypto utilities
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
  apps/desktop/src/electron/main.ts: Modified - updated import to use
    NodeFileSystemBridge from local services; Updated main process startup to
    use MainProcessServices container, replaced direct service instantiation
    with explicit dependency injection
  apps/desktop/src/electron/services/LlmStorageService.ts: Modified - updated import to use NodeFileSystemBridge from local services
  apps/desktop/src/data/repositories/RolesRepository.ts: Modified - added
    NodeFileSystemBridge and updated constructor to provide FileSystemBridge
    parameter
  packages/shared/src/services/storage/RolesFileRecoveryService.ts: Modified - added FileSystemBridge constructor parameter
  packages/shared/src/services/storage/utils/createFileBackup.ts: Modified - made FileSystemBridge parameter required
  packages/shared/src/services/storage/index.ts: Modified - removed NodeFileSystemBridge export
  packages/shared/src/logging/DeviceInfoInterface.ts: Created interface for device info collection services
  packages/shared/src/logging/index.ts: Added export for DeviceInfoInterface
  apps/desktop/src/main/utils/NodeDeviceInfo.ts:
    Implemented Node.js/Electron main
    process device info service with direct imports and hostname sanitization
  apps/desktop/src/main/utils/__tests__/NodeDeviceInfo.test.ts:
    Comprehensive unit tests with mocked electron and os modules covering all
    functionality and error cases
  packages/shared/src/logging/StructuredLogger.ts: Updated constructor to accept
    DeviceInfoInterface and CryptoUtilsInterface parameters, removed internal
    platform-specific code creation, updated session ID generation to use
    injected crypto utils
  packages/shared/src/logging/createLogger.ts: Updated to provide default
    implementations for DeviceInfoInterface and CryptoUtilsInterface to
    StructuredLogger constructor; Updated to use dependency injection for device
    info and crypto utilities, removed direct process access
  packages/shared/src/logging/createLoggerSync.ts: Updated to provide default
    implementations for DeviceInfoInterface and CryptoUtilsInterface to
    StructuredLogger constructor with sync-appropriate fallbacks; Updated to use
    dependency injection interfaces and removed platform-specific process
    metadata collection
  packages/shared/src/logging/__tests__/StructuredLogger.test.ts:
    Updated all constructor calls to provide mock implementations, fixed session
    ID uniqueness and platform detection tests
  packages/shared/src/logging/__tests__/createLogger.test.ts: Updated mock
    expectations to match new constructor signature with three parameters
  packages/shared/src/logging/__tests__/createLoggerSync.test.ts:
    Updated mock expectations to match new constructor signature with three
    parameters; Updated test to reflect platform-agnostic logger behavior
  apps/desktop/src/main/services/MainProcessServices.ts:
    Created service container
    class that implements dependency injection pattern for main process, wires
    Node.js implementations into shared services
  apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts:
    Added comprehensive unit tests verifying service container initialization,
    dependency injection, and service integration
  apps/desktop/src/renderer/utils/BrowserDeviceInfo.ts:
    Created BrowserDeviceInfo
    service class implementing DeviceInfoInterface for browser/Electron renderer
    device info collection
  apps/desktop/src/renderer/utils/__tests__/BrowserDeviceInfo.test.ts: Added comprehensive unit tests for BrowserDeviceInfo with mocked browser APIs
  apps/desktop/src/renderer/services/RendererProcessServices.ts:
    Created service container class that initializes browser implementations and
    creates configured logger with dependency injection
  apps/desktop/src/renderer/services/index.ts: Added barrel export for RendererProcessServices
  apps/desktop/src/contexts/ServicesProvider.tsx: Created React context provider
    component for sharing services throughout renderer process
  apps/desktop/src/contexts/ServicesContext.tsx: Created React context for accessing renderer process services
  apps/desktop/src/contexts/useServices.tsx: Created React hook for consuming
    services from context with proper error handling
  apps/desktop/src/contexts/index.ts: Added exports for new service-related context components
  apps/desktop/src/main.tsx: Updated renderer initialization to create service
    container and wrap App with ServicesProvider
  apps/desktop/src/App.tsx:
    Updated to use configured logger from services context
    instead of creating its own logger
  apps/desktop/src/renderer/services/__tests__/RendererProcessServices.test.ts:
    Added comprehensive unit tests covering service initialization, browser
    implementations, logger configuration, and fallback behavior
  apps/desktop/src/App.test.tsx: Fixed failing tests by adding mock for
    useServices hook to provide necessary test context
  packages/shared/src/utils/randomBytes.ts: Removed platform-specific random bytes implementation
  packages/shared/src/utils/generateId.ts: Removed platform-specific ID generation implementation
  packages/shared/src/utils/getByteLength.ts: Removed platform-specific byte length implementation
  packages/shared/src/logging/utils/getDeviceInfo.ts: Removed platform-specific device info implementation
  packages/shared/src/logging/utils/detectPlatform.ts: Removed platform-specific platform detection implementation
  packages/shared/src/logging/utils/getCachedDeviceInfo.ts: Removed cached device info that depended on deleted getDeviceInfo
  packages/shared/src/logging/utils/PlatformCache.ts: Removed platform cache that depended on deleted detectPlatform
  packages/shared/src/logging/utils/getPlatform.ts: Removed getPlatform utility that depended on deleted PlatformCache
  packages/shared/src/logging/utils/resetPlatformCache.ts: Removed resetPlatformCache utility that depended on deleted PlatformCache
  packages/shared/src/logging/utils/index.ts: Updated barrel exports to remove deleted logging utility files
  packages/shared/src/repositories/llmConfig/LlmConfigRepository.ts: Updated constructor to use dependency injection for crypto utilities
  packages/shared/src/logging/config/getDefaultConfig.ts: Added safe guard for process.env access to be platform-agnostic
  packages/shared/src/utils/randomBytesHex.ts: Updated to use dependency injection for crypto utilities
log: []
schema: v1.0
childrenIds:
  - T-clean-up-shared-package
  - T-verify-build-passes-after
  - T-create-directory-structure
  - T-extract-browser-crypto
  - T-extract-browser-device-info
  - T-extract-node-crypto-utilities
  - T-extract-node-device-info-to
  - T-move-nodefilesystembridge-to
  - T-update-shared-services-for
  - T-wire-up-browser-implementation
  - T-wire-up-node-implementations
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
